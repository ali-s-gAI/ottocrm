"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString() as 'ADMIN' | 'AGENT' | 'CUSTOMER';
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password || !role) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email, password, and role are required",
    );
  }

  const { error: signUpError, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (signUpError) {
    console.error(signUpError.code + " " + signUpError.message);
    return encodedRedirect("error", "/sign-up", signUpError.message);
  }

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: data.user.id,
          role,
          full_name: email.split('@')[0], // Temporary name from email
        }
      ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Continue anyway as the user was created
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const syncMissingProfiles = async () => {
  const supabase = await createClient();

  // Get all users from auth.users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  // Get existing profiles
  const { data: existingProfiles } = await supabase
    .from('user_profiles')
    .select('id');

  const existingIds = new Set(existingProfiles?.map(p => p.id) || []);

  // Filter users that don't have profiles
  const usersToSync = users.users.filter(user => !existingIds.has(user.id));

  // Create profiles for users that don't have them
  for (const user of usersToSync) {
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: user.id,
          role: user.email?.startsWith('admin') ? 'ADMIN' : 
                user.email?.startsWith('agent') ? 'AGENT' : 'CUSTOMER',
          full_name: user.email?.split('@')[0] || 'Unknown',
        }
      ]);

    if (insertError) {
      console.error('Error creating profile for user:', user.email, insertError);
    }
  }
};
