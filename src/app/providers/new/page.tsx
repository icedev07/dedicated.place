'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from '@/components/ui/image-upload';

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

export default function NewObjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title_de: "",
    title_en: "",
    description_de: "",
    description_en: "",
    type: "bench",
    custom_type_name: "",
    special_tag: "",
    image_urls: [] as string[],
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      const insertData = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        price: form.price ? parseFloat(form.price) : null,
        plaque_max_chars: form.plaque_max_chars ? parseInt(form.plaque_max_chars) : null,
        type: { value: form.type },
        status: { value: form.status },
      };
      const { error: insertError } = await supabase.from("objects").insert([insertData]);
      if (insertError) throw insertError;
      router.push("/providers");
    } catch (err) {
      setError("Failed to create object. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create Object</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
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
        <div>
          <Label>Images</Label>
          <ImageUpload
            value={form.image_urls}
            onChange={(urls) => setForm(prev => ({ ...prev, image_urls: urls }))}
            onRemove={(url) => setForm(prev => ({ ...prev, image_urls: prev.image_urls.filter(u => u !== url) }))}
            folder="objects"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </form>

      {/* Confirmation dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Creation</DialogTitle>
            <DialogDescription>
              Are you sure you want to create this object? This action cannot be undone.
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
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 