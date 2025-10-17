"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context"; // Corrected import path
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, UserPlus, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

interface User {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "VILLAGER" | "ROLE_ADMIN" | "ROLE_VILLAGER";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function UserManagementPage() {
    const { token } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isUserDialogOpen, setUserDialogOpen] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState<"VILLAGER" | "ADMIN">("VILLAGER");

    const fetchUsers = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to fetch users");
            setUsers(await res.json());
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not load user data." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [token]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ username: newUsername, email: newEmail, role: newRole })
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to create user.");
            }
            toast({ title: "Success", description: `User '${newUsername}' created with default password 'password'.` });
            closeAndResetDialog();
            fetchUsers();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Creation Failed", description: err.message });
        }
    };

    const handleDeleteUser = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to delete user");
            toast({ title: "User Deleted", description: "The user has been removed." });
            fetchUsers();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete user." });
        }
    };

    const closeAndResetDialog = () => {
        setNewUsername("");
        setNewEmail("");
        setNewRole("VILLAGER");
        setUserDialogOpen(false);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
                {/* --- THIS IS THE FIX --- */}
                <Link href="/admin-dashboard">
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Dashboard</span>
                    </Button>
                </Link>
                <h1 className="text-lg font-semibold md:text-xl">User Management</h1>
                <div className="ml-auto">
                    <Button onClick={() => setUserDialogOpen(true)} size="sm">
                        <UserPlus className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Create New User</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>View, create, and manage all user accounts.</CardDescription>
                        </div>
                        <Users className="h-6 w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
                                    ) : users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.username}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                                            <TableCell>{user.role.replace("ROLE_", "")}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" disabled={user.role === 'ADMIN' || user.role === 'ROLE_ADMIN'}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                            <span className="sr-only">Delete user</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the user account for '{user.username}'.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete User</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={isUserDialogOpen} onOpenChange={setUserDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="username">Username</Label><Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="role">Role</Label><Select value={newRole} onValueChange={(value: "ADMIN" | "VILLAGER") => setNewRole(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="VILLAGER">Villager</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent></Select></div>
                        <p className="text-xs text-muted-foreground">The new user will be created with a default password of "password".</p>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline" onClick={closeAndResetDialog}>Cancel</Button></DialogClose>
                            <Button type="submit">Create User</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}