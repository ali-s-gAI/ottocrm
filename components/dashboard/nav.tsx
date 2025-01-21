import Link from "next/link";
import { Home, Inbox, Users, Settings } from "lucide-react";

export default function DashboardNav() {
  return (
    <nav className="w-64 bg-[#1C1C1C] text-gray-300 p-4 border-r border-[#333333]">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">OttoCRM</h1>
      </div>
      
      <div className="space-y-2">
        <NavItem href="/dashboard" icon={<Home size={20} />}>
          Overview
        </NavItem>
        <NavItem href="/dashboard/tickets" icon={<Inbox size={20} />}>
          Tickets
        </NavItem>
        <NavItem href="/dashboard/customers" icon={<Users size={20} />}>
          Customers
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
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
} 