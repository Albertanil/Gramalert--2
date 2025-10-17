"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DynamicMapPicker from "./dynamic-map-picker" 
import type { Grievance } from "@/lib/types"
import { FileText, Edit } from "lucide-react"

interface SubmitRequestDialogProps {
  isEditing?: boolean;
  initialData?: Grievance | null;
  children: React.ReactNode;
  onSubmit: (request: {
    id?: number;
    title: string;
    description: string;
    category: string;
    location?: { lat: number; lng: number } | null;
    file?: File | null;
  }) => void;
}

export function SubmitRequestDialog({ children, isEditing = false, initialData, onSubmit }: SubmitRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setCategory(initialData.category);
        setLocation(initialData.latitude && initialData.longitude ? { lat: initialData.latitude, lng: initialData.longitude } : null);
      } else {
        setTitle("");
        setDescription("");
        setCategory("");
        setLocation(null);
        setFile(null);
      }
    }
  }, [open, isEditing, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: initialData?.id, title, description, category, location, file });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Grievance" : "Submit New Grievance"}</DialogTitle>
          <DialogDescription>{isEditing ? "Update the details of your request." : "Fill in the details of your request."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="title">Title *</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="category">Category *</Label><Select value={category} onValueChange={setCategory} required><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="electricity">Electricity</SelectItem><SelectItem value="water">Water Supply</SelectItem><SelectItem value="roads">Roads & Infrastructure</SelectItem><SelectItem value="sanitation">Sanitation</SelectItem><SelectItem value="health">Health Services</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="description">Description *</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required /></div>
          
          {!isEditing && (
            <>
              <div className="space-y-2"><Label htmlFor="file">Attach Photo/Document (Optional)</Label><Input id="file" type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
              <div className="space-y-2"><Label>Location (Optional)</Label><DynamicMapPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} /></div>
            </>
          )}
          {isEditing && (
            <div className="text-sm p-4 bg-muted rounded-md text-muted-foreground">Location and attached images cannot be edited after submission.</div>
          )}

          <div className="flex gap-3 pt-4"><Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button><Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">{isEditing ? "Save Changes" : "Submit Request"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}