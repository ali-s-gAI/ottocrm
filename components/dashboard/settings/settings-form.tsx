'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';

interface SettingsFormProps {
  user: User;
  initialProfile: {
    full_name: string;
    role: string;
  };
}

export function SettingsForm({ user, initialProfile }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState(initialProfile.full_name);
  const [email, setEmail] = useState(user.email || '');
  const [isDirty, setIsDirty] = useState(false);
  const supabase = createClient();

  // Track changes to determine if form is dirty
  useEffect(() => {
    const isNameChanged = fullName !== initialProfile.full_name;
    const isEmailChanged = email !== user.email;
    setIsDirty(isNameChanged || isEmailChanged);
  }, [fullName, email, initialProfile.full_name, user.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Update profile name
    if (fullName !== initialProfile.full_name) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        setIsLoading(false);
        return;
      }
    }

    // Update email if changed
    if (email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email
      });

      if (emailError) {
        console.error('Error updating email:', emailError);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    setIsDirty(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="max-w-md"
        />
        {email !== user.email && (
          <p className="text-sm text-muted-foreground">
            You will need to verify your new email address.
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isDirty || isLoading}
        className={`${
          isDirty 
            ? 'bg-primary hover:bg-primary/90' 
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
} 