import { signInAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FormMessage } from "@/components/form-message";

interface PageProps {
  searchParams: Promise<{ message?: string; type?: string }>;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-6 text-foreground"
        action={signInAction}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <Button>Sign In</Button>
        <FormMessage message={params.message} type={params.type} />
        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-foreground hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
