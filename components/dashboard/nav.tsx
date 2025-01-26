import Link from "next/link";
import Image from "next/image";
import { Home, Inbox, Users, Settings, BookOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardNav() {
  const supabase = await createClient();
  
  // Get user and role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  const isCustomer = profile?.role === 'CUSTOMER';

  return (
    <nav className="w-64 bg-card text-muted-foreground p-4 border-r border-border">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">OttoCRM</h1>
          <Image
            src="/ottocrm_logo.png"
            alt="OttoCRM Logo"
            width={24}
            height={24}
            className="rounded-full"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <NavItem href="/dashboard" icon={<Home size={20} />}>
          Overview
        </NavItem>
        <NavItem href="/dashboard/tickets" icon={<Inbox size={20} />}>
          Tickets
        </NavItem>
        {!isCustomer && (
          <NavItem href="/dashboard/customers" icon={<Users size={20} />}>
            Customers
          </NavItem>
        )}
        <NavItem href="/dashboard/docs" icon={<BookOpen size={20} />}>
          Docs & FAQ
        </NavItem>
        <NavItem href="/dashboard/settings" icon={<Settings size={20} />}>
          Settings
        </NavItem>
      </div>
    </nav>
  );
}

function NavItem({ 
  href, 
  icon, 
  children 
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
} 