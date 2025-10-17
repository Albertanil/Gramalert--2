// In frontend/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth-context"; // Corrected import path
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProfileView } from "./ProfileView";
import { VerifyPasswordDialog } from "./VerifyPasswordDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().optional().refine(
    (val) => val === "" || val === undefined || val.length >= 6, 
    { message: "New password must be at least 6 characters." }
  ),
  confirmPassword: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ProfileData = { username: string; email: string };

export default function ProfilePage() {
    const { token, logout, user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    
    const [view, setView] = useState<'view' | 'edit'>('view');
    const [isVerifyDialogOpen, setVerifyDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { username: "", password: "", confirmPassword: "" },
    });

    useEffect(() => {
        async function fetchProfile() {
            if (!token) return;
            const response = await fetch(`${API_URL}/api/profile/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                setProfileData(data);
                form.reset({ username: data.username });
            }
        }
        fetchProfile();
    }, [token, form]);

    async function onSubmit(values: z.infer<typeof profileFormSchema>) {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/profile/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ username: values.username, password: values.password }),
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || "Failed to update profile.");
            }

            toast({ title: "Profile Updated", description: "Please log in again with your new credentials." });
            logout();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    const getDashboardLink = () => {
        if (!user) return "/login";
        // --- THIS IS THE FIX ---
        // Use the correct paths based on your actual folder structure.
        return user.role.includes('ADMIN') ? "/admin-dashboard" : "/villager-dashboard";
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
                <Link href={getDashboardLink()}>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Dashboard</span>
                    </Button>
                </Link>
                <h1 className="text-lg font-semibold md:text-xl">My Profile</h1>
            </header>
            
            <main className="flex-1 p-4 sm:p-6 md:p-8 flex justify-center items-start pt-6 sm:pt-10">
                {view === 'view' ? (
                    <ProfileView 
                        username={profileData?.username} 
                        email={profileData?.email}
                        onEdit={() => setVerifyDialogOpen(true)} 
                    />
                ) : (
                    <Card className="w-full max-w-lg">
                        <CardHeader><CardTitle>Edit Profile</CardTitle><CardDescription>Update your username or password here.</CardDescription></CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField control={form.control} name="username" render={({ field }) => (
                                        <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem><FormLabel>New Password (optional)</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                        <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button type="button" variant="outline" className="w-full" onClick={() => setView('view')}>Cancel</Button>
                                        <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? "Saving..." : "Save Changes"}</Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}
            </main>
            <VerifyPasswordDialog 
                open={isVerifyDialogOpen}
                onOpenChange={setVerifyDialogOpen}
                onSuccess={() => {
                    setVerifyDialogOpen(false);
                    setView('edit');
                }}
            />
        </div>
    );
}