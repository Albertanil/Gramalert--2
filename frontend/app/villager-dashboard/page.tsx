"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmitRequestDialog } from "@/components/submit-request-dialog";
import { getStatusColor, getEscalationLevelName, cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebSocket } from "@/hooks/useWebSocket";
import { format, parseISO } from "date-fns";
import type { Grievance, Alert } from "@/lib/types";
import {
  BellRing,
  FileText,
  List,
  Edit,
  AlertTriangle,
  ClipboardList,
  CircleUser,
} from "lucide-react";
import DynamicMapDisplay from "@/components/dynamic-map-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function VillagerDashboard() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [myRequests, setMyRequests] = useState<Grievance[]>([]);
  const [publicGrievances, setPublicGrievances] = useState<Grievance[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [myRequestsRes, allGrievancesRes, alertsRes] = await Promise.all([
        fetch(`${API_URL}/grievances/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/grievances`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!myRequestsRes.ok || !allGrievancesRes.ok || !alertsRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      setMyRequests(await myRequestsRes.json());
      setPublicGrievances(await allGrievancesRes.json());
      setAlerts(await alertsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: "Could not connect to the server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleGrievanceUpdate = (updatedGrievance: Grievance) => {
    setMyRequests((prev) => {
      const exists = prev.some((g) => g.id === updatedGrievance.id);
      if (exists) {
        toast({
          title: "Your Request Was Updated",
          description: `Status for "${updatedGrievance.title}" is now ${updatedGrievance.status}.`,
        });
        return prev.map((g) => (g.id === updatedGrievance.id ? updatedGrievance : g));
      }
      if (user && updatedGrievance.submittedBy === user.username && !exists) {
        return [updatedGrievance, ...prev].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return prev;
    });

    setPublicGrievances((prev) => {
      const exists = prev.some((g) => g.id === updatedGrievance.id);
      if (exists) {
        return prev.map((g) => (g.id === updatedGrievance.id ? updatedGrievance : g));
      }
      return [updatedGrievance, ...prev].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  };

  const handleAlertUpdate = (updatedAlert: Alert) => {
    setAlerts((prev) => {
      const exists = prev.some((a) => a.id === updatedAlert.id);
      if (exists) {
        toast({ title: "Village Alert Updated", description: updatedAlert.title });
        return prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a));
      } else {
        toast({ title: "New Village Alert", description: updatedAlert.title });
        return [updatedAlert, ...prev].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });
  };

  useWebSocket("/topic/grievances", handleGrievanceUpdate, token);
  useWebSocket("/topic/alerts", handleAlertUpdate, token);

  const handleFormSubmit = async (requestData: {
    id?: number;
    title: string;
    description: string;
    category: string;
    location?: { lat: number; lng: number } | null;
    file?: File | null;
  }) => {
    if (!token) return;
    const isEditing = !!requestData.id;
    const url = isEditing
      ? `${API_URL}/grievances/${requestData.id}`
      : `${API_URL}/grievances`;
    const method = isEditing ? "PUT" : "POST";

    try {
      let response;
      if (isEditing) {
        response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });
      } else {
        const formData = new FormData();
        formData.append("title", requestData.title);
        formData.append("description", requestData.description);
        formData.append("category", requestData.category);
        if (requestData.location) {
          formData.append("latitude", requestData.location.lat.toString());
          formData.append("longitude", requestData.location.lng.toString());
        }
        if (requestData.file) {
          formData.append("file", requestData.file);
        }
        response = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      if (!response.ok)
        throw new Error(`Failed to ${isEditing ? "update" : "submit"} request`);

      toast({
        title: "Success!",
        description: `Your request has been ${
          isEditing ? "updated" : "submitted"
        }.`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description:
          error.message || `Could not ${isEditing ? "update" : "submit"} request.`,
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 overflow-x-hidden">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <h1 className="text-lg font-semibold md:text-xl truncate">
          Villager Dashboard
        </h1>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <SubmitRequestDialog onSubmit={handleFormSubmit}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <FileText className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Submit New Request</span>
            </Button>
          </SubmitRequestDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 w-full">
          {/* Community Grievances */}
          <div className="lg:col-span-2 grid gap-6 md:gap-8 w-full">
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle>Community Grievances</CardTitle>
                  <CardDescription>
                    Public requests from your village. Click to view details.
                  </CardDescription>
                </div>
                <List className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent className="grid gap-2">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))
                ) : publicGrievances.length > 0 ? (
                  publicGrievances.map((req) => (
                    <Dialog key={`public-${req.id}`}>
                      <DialogTrigger asChild>
                        <div className="flex items-center justify-between gap-3 rounded-lg p-3 text-sm cursor-pointer hover:bg-accent transition-colors w-full overflow-hidden">
                          <div className="flex items-center flex-1 min-w-0 gap-2">
                            <List className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-semibold truncate"
                                title={req.title}
                              >
                                {req.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {req.category}
                              </p>
                            </div>
                          </div>
                          <Badge className={cn(getStatusColor(req.status))}>
                            {req.status}
                          </Badge>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-3xl w-full">
                        <DialogHeader>
                          <DialogTitle>{req.title}</DialogTitle>
                          <DialogDescription>{req.description}</DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No public grievances have been submitted yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 grid auto-rows-max items-start gap-6 md:gap-8 w-full">
            {/* My Requests */}
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle>My Submitted Grievances</CardTitle>
                  <CardDescription>View and edit your own requests.</CardDescription>
                </div>
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent className="grid gap-2">
                {isLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : myRequests.length > 0 ? (
                  myRequests.map((req) => (
                    <Dialog key={`my-${req.id}`}>
                      <DialogTrigger asChild>
                        <div className="flex items-center justify-between gap-3 rounded-lg p-3 text-sm cursor-pointer hover:bg-accent transition-colors w-full overflow-hidden">
                          <div className="flex items-center flex-1 min-w-0 gap-2">
                            <BellRing className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-semibold truncate"
                                title={req.title}
                              >
                                {req.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                Posted on{" "}
                                {req.createdAt
                                  ? format(parseISO(req.createdAt), "PPP")
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                          <Badge className={cn(getStatusColor(req.status))}>
                            {req.status}
                          </Badge>
                        </div>
                      </DialogTrigger>

                      <DialogContent className="max-w-[95vw] sm:max-w-3xl w-full flex flex-col max-h-[90vh] p-0">
                        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
                          <DialogTitle>{req.title}</DialogTitle>
                          <DialogDescription>
                            Submitted on{" "}
                            {req.createdAt
                              ? format(parseISO(req.createdAt), "PPP")
                              : "N/A"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="overflow-y-auto flex-grow px-4 sm:px-6">
                          <div className="grid md:grid-cols-2 gap-6 py-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-1">Description</h4>
                                <p className="text-sm text-muted-foreground break-words">
                                  {req.description}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">Status</h4>
                                <Badge className={getStatusColor(req.status)}>
                                  {req.status}
                                </Badge>
                              </div>
                              {req.isOverdue && (
                                <div className="flex items-center gap-2 text-destructive font-semibold">
                                  <AlertTriangle className="h-4 w-4" /> This grievance
                                  is overdue.
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold mb-1">Attached Image</h4>
                                {req.fileUrl ? (
                                  <img
                                    src={`${API_URL}${req.fileUrl}`}
                                    alt="Attached file"
                                    className="mt-2 rounded-md border max-h-60 w-full object-cover"
                                  />
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No image was attached.
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="h-80 w-full rounded-md bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                              {req.latitude && req.longitude ? (
                                <DynamicMapDisplay
                                  lat={req.latitude}
                                  lng={req.longitude}
                                />
                              ) : (
                                <p>Location not provided.</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <DialogFooter className="p-6 pt-4 border-t flex-shrink-0">
                          <SubmitRequestDialog
                            onSubmit={handleFormSubmit}
                            isEditing={true}
                            initialData={req}
                          >
                            <Button variant="outline">
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </Button>
                          </SubmitRequestDialog>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    You have not submitted any requests yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle>Recent Village Alerts</CardTitle>
                  <CardDescription>
                    Important announcements from the Panchayat.
                  </CardDescription>
                </div>
                <BellRing className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent className="grid gap-2">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))
                ) : alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <Dialog key={alert.id}>
                      <DialogTrigger asChild>
                        <div className="flex items-center justify-between gap-3 rounded-lg p-3 text-sm cursor-pointer hover:bg-accent transition-colors w-full overflow-hidden">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <BellRing className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-semibold truncate"
                                title={alert.title}
                              >
                                {alert.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                Posted on{" "}
                                {alert.createdAt
                                  ? format(parseISO(alert.createdAt), "PPP")
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-3xl w-full">
                        <DialogHeader>
                          <DialogTitle>{alert.title}</DialogTitle>
                          <DialogDescription>{alert.description}</DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No new alerts at the moment.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
