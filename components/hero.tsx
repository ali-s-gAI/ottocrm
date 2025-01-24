import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/ottocrm_logo.png"
            alt="OttoCRM Logo"
            width={80}
            height={80}
            className="rounded-full"
          />
          <h1 className="text-5xl font-bold text-foreground">OttoCRM</h1>
        </div>
        <p className="text-2xl text-muted-foreground">
          A modern customer support platform
        </p>
      </div>
      
      <div className="flex gap-4 mt-8">
        <Link href="/sign-in">
          <Button variant="outline" size="lg">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button size="lg">
            Sign Up
          </Button>
        </Link>
      </div>
    </div>
  );
}
