'use client';

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewDocForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;

    const { error } = await supabase
      .from('documentation')
      .insert([
        {
          title,
          description,
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error creating document:', error);
      alert('Failed to create document. Please try again.');
      setIsSubmitting(false);
      return;
    }

    router.push('/dashboard/docs');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="e.g., Getting Started Guide"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Input
          id="description"
          name="description"
          required
          placeholder="e.g., Learn the basics of using OttoCRM"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={15}
          placeholder="Write your documentation content here..."
          className="font-mono"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Creating...' : 'Create Document'}
      </Button>
    </form>
  );
} 