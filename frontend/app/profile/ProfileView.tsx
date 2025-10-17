// In frontend/app/profile/ProfileView.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";

interface ProfileViewProps {
  username?: string;
  email?: string;
  onEdit: () => void;
}

export function ProfileView({ username, email, onEdit }: ProfileViewProps) {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Your personal account details.</CardDescription>
      </CardHeader>
      {/* --- RESPONSIVE SPACING --- */}
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label>Username</Label>
          <Input value={username} readOnly />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} readOnly />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" value="********" readOnly />
        </div>
        <Button onClick={onEdit} className="w-full !mt-6">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
}