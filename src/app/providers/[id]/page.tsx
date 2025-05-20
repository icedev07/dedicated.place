"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadObjectImage } from '@/utils/supabase/uploadImage';

const typeOptions = [
  { value: "bench", label: "Bench" },
  { value: "tree", label: "Tree" },
  { value: "fountain", label: "Fountain" },
];
const statusOptions = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "unavailable", label: "Unavailable" },
];

export default function ObjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState({
    title_de: "",
    title_en: "",
    description_de: "",
    description_en: "",
    type: "bench",
    custom_type_name: "",
    special_tag: "",
    image_urls: "",
    location_text: "",
    latitude: "",
    longitude: "",
    price: "",
    plaque_allowed: false,
    plaque_max_chars: "",
    status: "available",
    booking_url: "",
    share_url: "",
    map_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchObject = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.from("objects").select("*").eq("id", id).single();
      if (data) {
        setForm({
          title_de: data.title_de || "",
          title_en: data.title_en || "",
          description_de: data.description_de || "",
          description_en: data.description_en || "",
          type: data.type?.value || "bench",
          custom_type_name: data.custom_type_name || "",
          special_tag: data.special_tag || "",
          image_urls: data.image_urls || "",
          location_text: data.location_text || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          price: data.price?.toString() || "",
          plaque_allowed: !!data.plaque_allowed,
          plaque_max_chars: data.plaque_max_chars?.toString() || "",
          status: data.status?.value || "available",
          booking_url: data.booking_url || "",
          share_url: data.share_url || "",
          map_url: data.map_url || "",
        });
        if (data.image_urls) setImagePreview(data.image_urls);
      }
      setLoading(false);
    };
    fetchObject();
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show loading state
        setImagePreview(URL.createObjectURL(file));
        
        // Upload to Supabase Storage and get public URL
        const url = await uploadObjectImage(file, id);
        if (url) {
          // Update both the preview and the form state with the new URL
          setForm((prev) => ({ ...prev, image_urls: url }));
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        // If upload fails, revert the preview and show error
        setImagePreview(form.image_urls || null);
        setError('Failed to upload image. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    try {
      setSaving(true);
      setError(null);
      const supabase = createClient();
      const updateData = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        price: form.price ? parseFloat(form.price) : null,
        plaque_max_chars: form.plaque_max_chars ? parseInt(form.plaque_max_chars) : null,
        type: { value: form.type },
        status: { value: form.status },
      };
      const { error: updateError } = await supabase.from("objects").update(updateData).eq("id", id);
      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err) {
      setError("Failed to update object. Please try again.");
    } finally {
      setSaving(false);
      setShowConfirmDialog(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-500" />
      </div>
    );

  return (
    <div className="container mx-auto py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Edit Object</h1>
      {success && (
        <Alert className="mb-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Object updated successfully.</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title_de">Title (German)</Label>
            <Input id="title_de" name="title_de" value={form.title_de} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="title_en">Title (English)</Label>
            <Input id="title_en" name="title_en" value={form.title_en} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="description_de">Description (German)</Label>
            <Textarea id="description_de" name="description_de" value={form.description_de} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="description_en">Description (English)</Label>
            <Textarea id="description_en" name="description_en" value={form.description_en} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="custom_type_name">Custom type name</Label>
            <Input id="custom_type_name" name="custom_type_name" value={form.custom_type_name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="special_tag">Special tag</Label>
            <Input id="special_tag" name="special_tag" value={form.special_tag} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="location_text">Location text</Label>
            <Input id="location_text" name="location_text" value={form.location_text} onChange={handleChange} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" name="latitude" value={form.latitude} onChange={handleChange} />
            </div>
            <div className="flex-1">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" name="longitude" value={form.longitude} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Image upload</Label>
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
                id="image-upload" 
              />
              <label 
                htmlFor="image-upload" 
                className="w-48 h-48 border-2 border-dashed flex items-center justify-center cursor-pointer bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors group"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="object-cover w-full h-full rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center p-4">
                        <p className="font-medium">Click to change image</p>
                        <p className="text-sm mt-1">or drag and drop</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
                    <span className="text-4xl mb-2">+</span>
                    <span className="text-sm">Click to upload</span>
                    <span className="text-xs mt-1">or drag and drop</span>
                  </div>
                )}
              </label>
            </div>
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" value={form.price} onChange={handleChange} type="number" min="0" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="plaque_allowed" name="plaque_allowed" checked={form.plaque_allowed} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, plaque_allowed: !!checked }))} />
            <Label htmlFor="plaque_allowed">Plaque allowed</Label>
          </div>
          <div>
            <Label htmlFor="plaque_max_chars">Max. text length for dedication/plaque</Label>
            <Input id="plaque_max_chars" name="plaque_max_chars" value={form.plaque_max_chars} onChange={handleChange} type="number" min="0" />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="booking_url">Booking URL (optional)</Label>
            <Input id="booking_url" name="booking_url" value={form.booking_url} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="share_url">Shareable URL (optional)</Label>
            <Input id="share_url" name="share_url" value={form.share_url} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="map_url">Map URL (optional)</Label>
            <Input id="map_url" name="map_url" value={form.map_url} onChange={handleChange} />
          </div>
        </div>
        <div className="md:col-span-2 flex gap-2 mt-8">
          <Button type="submit" disabled={saving}>
            Save
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/providers")}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </form>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update this object? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={saving}>
              {saving ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}