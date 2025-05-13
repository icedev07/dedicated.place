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

export default function NewObjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    try {
      setSaving(true);
      setError(null);
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from('objects')
        .insert([
          {
            title_de: title,
            description_de: description,
          }
        ]);

      if (insertError) throw insertError;

      router.push('/providers');
    } catch (err) {
      setError('Failed to create object. Please try again.');
    } finally {
      setSaving(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="container mx-auto py-16 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Create New Object</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter object title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter object description"
            className="min-h-[100px]"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            Create Object
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/providers')}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </form>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Creation</DialogTitle>
            <DialogDescription>
              Are you sure you want to create this object? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 