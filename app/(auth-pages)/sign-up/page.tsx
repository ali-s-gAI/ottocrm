import { signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FormMessage } from "@/components/form-message";

interface PageProps {
  searchParams: Promise<{ message?: string; type?: string }>;
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="w-full sm:max-w-md px-8">
      <form
        className="animate-in flex flex-col w-full gap-6 text-foreground"
        action={signUpAction}
      >
        <div className="text-center mb-4">
          <h1 className="text-2xl font-semibold text-foreground">Sign Up</h1>
        </div>
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            className="rounded-md px-4 py-2 bg-background border border-input"
            required
          >
            <option value="CUSTOMER">Customer</option>
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <Button>Sign Up</Button>
        <FormMessage message={params.message} type={params.type} />
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-foreground hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
