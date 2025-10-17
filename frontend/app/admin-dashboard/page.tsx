"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, getStatusColor, getPriorityColor, getEscalationLevelName } from "@/lib/utils";
import { useWebSocket } from "@/hooks/useWebSocket";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, AlertTriangle, Edit, Trash2, UserCog, Megaphone, ClipboardList, BellRing, CircleUser } from "lucide-react";
import type { Grievance, Alert } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DynamicMapDisplay from "@/components/dynamic-map-display";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function AdminDashboard() {
    const { token, logout, user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAlertDialogOpen, setAlertDialogOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
    const [newAlertTitle, setNewAlertTitle] = useState("");
    const [newAlertDesc, setNewAlertDesc] = useState("");
    const [newAlertStart, setNewAlertStart] = useState<Date | undefined>();
    const [newAlertEnd, setNewAlertEnd] = useState<Date | undefined>();

    const fetchData = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const [grievancesRes, alertsRes] = await Promise.all([
                fetch(`${API_URL}/grievances`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/alerts`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!grievancesRes.ok || !alertsRes.ok) throw new Error('Failed to fetch data');
            setGrievances(await grievancesRes.json());
            setAlerts(await alertsRes.json());
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ variant: "destructive", title: "Failed to load data", description: "Could not connect to the server." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { if (token) fetchData(); }, [token]);

    const handleGrievanceUpdate = (updatedGrievance: Grievance) => {
        setGrievances(prev => {
            const exists = prev.some(g => g.id === updatedGrievance.id);
            if (exists) {
                return prev.map(g => g.id === updatedGrievance.id ? updatedGrievance : g);
            }
            return [updatedGrievance, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
    };

    const handleAlertUpdate = (updatedAlert: Alert) => {
      setAlerts(prev => {
          const exists = prev.some(a => a.id === updatedAlert.id);
          if (exists) {
              return prev.map(a => a.id === updatedAlert.id ? updatedAlert : a);
          }
          return [updatedAlert, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
    };

    const handleAlertDelete = (deletedId: number) => {
        setAlerts(prev => prev.filter(a => a.id !== deletedId));
        toast({ title: "Alert Deleted", description: "The alert has been successfully removed." });
    };
    
    useWebSocket('/topic/grievances', handleGrievanceUpdate, token);
    useWebSocket('/topic/alerts', handleAlertUpdate, token);
    useWebSocket('/topic/alerts/deleted', handleAlertDelete, token);

    const handleStatusChange = async (id: number, newStatus: string) => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/grievances/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error("Failed to update status");
            toast({ title: "Status Updated", description: `Grievance status has been changed to ${newStatus}.` });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({ variant: "destructive", title: "Update Failed", description: "Could not update status." });
        }
    };
    
    const handleAlertSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        const url = editingAlert ? `${API_URL}/alerts/${editingAlert.id}` : `${API_URL}/alerts`;
        const method = editingAlert ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: newAlertTitle, description: newAlertDesc, category: 'General', severity: 'Medium', startTime: newAlertStart?.toISOString(), endTime: newAlertEnd?.toISOString() })
            });
            if (!response.ok) throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} alert`);
            toast({ title: "Success", description: `Alert has been ${method === 'POST' ? 'created' : 'updated'}.` });
            closeAndResetAlertModal();
        } catch (error) {
            console.error(`Error ${method === 'POST' ? 'creating' : 'updating'} alert:`, error);
            toast({ variant: "destructive", title: "Error", description: `Could not ${method === 'POST' ? 'create' : 'update'} the alert.` });
        }
    };

    const handleDeleteAlert = async (id: number) => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/alerts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to delete alert");
        } catch (error) {
            console.error("Error deleting alert:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not delete the alert." });
        }
    };
    
    const openEditAlertModal = (alert: Alert) => {
        setEditingAlert(alert);
        setNewAlertTitle(alert.title);
        setNewAlertDesc(alert.description);
        setNewAlertStart(alert.startTime ? parseISO(alert.startTime) : undefined);
        setNewAlertEnd(alert.endTime ? parseISO(alert.endTime) : undefined);
        setAlertDialogOpen(true);
    };
    
    const openCreateAlertModal = () => {
        setEditingAlert(null);
        setNewAlertTitle("");
        setNewAlertDesc("");
        setNewAlertStart(undefined);
        setNewAlertEnd(undefined);
        setAlertDialogOpen(true);
    };
    
    const closeAndResetAlertModal = () => {
        setAlertDialogOpen(false);
        setEditingAlert(null);
    };
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
                <h1 className="text-lg font-semibold md:text-xl">Admin Dashboard</h1>
                <div className="ml-auto flex items-center gap-2 sm:gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin-dashboard/user-management')}>
                        <UserCog className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Manage Users</span>
                    </Button>
                    <Button size="sm" onClick={openCreateAlertModal}>
                        <Megaphone className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Create New Alert</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <CircleUser className="h-5 w-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user?.username || 'My Account'}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle>Manage Grievances</CardTitle>
                                <CardDescription>View and update the status of all submitted grievances.</CardDescription>
                            </div>
                            <ClipboardList className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Grievance</TableHead>
                                        <TableHead className="hidden sm:table-cell">Submitted By</TableHead>
                                        <TableHead className="hidden md:table-cell">Priority</TableHead>
                                        <TableHead className="w-[150px]">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? ( Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow>)
                                    ) : grievances.length > 0 ? ( grievances.map((g) => (
                                        <Dialog key={g.id}>
                                            <DialogTrigger asChild>
                                                <TableRow className="cursor-pointer hover:bg-muted/50">
                                                    <TableCell className="max-w-[150px] sm:max-w-xs">
                                                        <div className="font-medium truncate" title={g.title}>{g.title}</div>
                                                        <div className="text-xs text-muted-foreground">{g.category}</div>
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">{g.submittedBy}</TableCell>
                                                    <TableCell className="hidden md:table-cell"><Badge variant="outline" className={getPriorityColor(g.priority)}>{g.priority}</Badge></TableCell>
                                                    <TableCell>
                                                        <Select value={g.status} onValueChange={(newStatus) => handleStatusChange(g.id, newStatus)}>
                                                            <SelectTrigger className={cn("w-[130px]", getStatusColor(g.status))} onClick={(e) => e.stopPropagation()}><SelectValue /></SelectTrigger>
                                                            <SelectContent><SelectItem value="Received">Received</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Resolved">Resolved</SelectItem></SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            </DialogTrigger>
                                            
                                            {/* --- START OF THE SCROLLBAR FIX --- */}
                                            <DialogContent className="max-w-3xl flex flex-col max-h-[90vh] p-0">
                                                <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
                                                    <DialogTitle>{g.title}</DialogTitle>
                                                    <DialogDescription>Submitted by {g.submittedBy} on {format(parseISO(g.createdAt), "PPP")}</DialogDescription>
                                                </DialogHeader>
                                                <div className="overflow-y-auto flex-grow">
                                                    <div className="grid md:grid-cols-2 gap-6 p-6">
                                                        <div className="space-y-4">
                                                            <div><h4 className="font-semibold mb-1">Description</h4><p className="text-sm text-muted-foreground break-words">{g.description}</p></div>
                                                            {g.isOverdue && <div className="flex items-center gap-2 text-destructive font-semibold"><AlertTriangle className="h-4 w-4" /> This grievance is overdue.</div>}
                                                            <div><h4 className="font-semibold mb-1">Escalation Level</h4><p className="text-sm text-muted-foreground">{getEscalationLevelName(g.escalationLevel)}</p></div>
                                                            <div><h4 className="font-semibold mb-1">Attached Image</h4>{g.fileUrl ? <img src={`${API_URL}${g.fileUrl}`} alt="Attached file" className="mt-2 rounded-md border max-h-60 w-full object-cover" /> : <p className="text-sm text-muted-foreground">No image was attached.</p>}</div>
                                                        </div>
                                                        <div className="h-80 w-full rounded-md bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                                                            {g.latitude && g.longitude ? ( <DynamicMapDisplay lat={g.latitude} lng={g.longitude} /> ) : ( <p>Location not provided.</p> )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                            {/* --- END OF THE SCROLLBAR FIX --- */}

                                        </Dialog>
                                    ))
                                    ) : ( <TableRow><TableCell colSpan={4} className="h-24 text-center">No grievances submitted yet.</TableCell></TableRow> )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                             <div className="space-y-1">
                                <CardTitle>Manage Alerts</CardTitle>
                                <CardDescription>Create, edit, or delete village-wide alerts.</CardDescription>
                            </div>
                            <BellRing className="h-6 w-6 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead className="hidden sm:table-cell">Active Until</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {isLoading ? ( Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-10 w-full" /></TableCell></TableRow>)
                                        ) : alerts.length > 0 ? ( alerts.map((alert) => (
                                            <TableRow key={alert.id}>
                                                <TableCell className="font-medium">{alert.title}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{alert.endTime ? format(parseISO(alert.endTime), "PPP") : 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditAlertModal(alert)}><Edit className="h-4 w-4" /></Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the alert.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteAlert(alert.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        ) : ( <TableRow><TableCell colSpan={3} className="h-24 text-center">No alerts have been created yet.</TableCell></TableRow> )}
                                    </TableBody>
                                </Table>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Dialog open={isAlertDialogOpen} onOpenChange={setAlertDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingAlert ? 'Edit Alert' : 'Create a New Alert'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleAlertSubmit} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" value={newAlertTitle} onChange={(e) => setNewAlertTitle(e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="desc">Description</Label><Textarea id="desc" value={newAlertDesc} onChange={(e) => setNewAlertDesc(e.target.value)} required /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Start Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !newAlertStart && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{newAlertStart ? format(newAlertStart, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newAlertStart} onSelect={setNewAlertStart} initialFocus /></PopoverContent></Popover></div>
                            <div className="space-y-2"><Label>End Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !newAlertEnd && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{newAlertEnd ? format(newAlertEnd, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newAlertEnd} onSelect={setNewAlertEnd} initialFocus /></PopoverContent></Popover></div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline" onClick={closeAndResetAlertModal}>Cancel</Button></DialogClose>
                            <Button type="submit">{editingAlert ? 'Save Changes' : 'Create Alert'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}