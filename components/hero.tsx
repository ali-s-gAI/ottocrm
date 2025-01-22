import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-white">OttoCRM</h1>
        <p className="text-2xl text-gray-400">
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
          <Button size="lg" className="bg-[#333333] hover:bg-[#444444]">
            Sign Up
          </Button>
        </Link>
      </div>
    </div>
  );
}
