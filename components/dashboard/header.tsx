import { User } from "@supabase/supabase-js";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOutAction } from "@/app/actions";

export default function DashboardHeader({ user }: { user: User }) {
  return (
    <header className="h-16 px-6 border-b border-[#333333] bg-[#1C1C1C] flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="search"
            placeholder="Search tickets..."
            className="w-full pl-10 bg-[#242424] border-[#333333] text-gray-300"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Bell size={20} />
        </Button>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">{user.email}</span>
          <form action={signOutAction}>
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white"
            >
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
} 