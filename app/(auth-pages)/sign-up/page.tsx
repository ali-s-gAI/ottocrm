import { signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FormMessage } from "@/components/form-message";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { message: string; type: string };
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-6 text-foreground"
        action={signUpAction}
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            className="rounded-md px-4 py-2 bg-inherit border"
            required
          >
            <option value="CUSTOMER">Customer</option>
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <Button>Sign Up</Button>
        <FormMessage message={searchParams.message} type={searchParams.type} />
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
