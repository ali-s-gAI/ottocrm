import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // TODO: Replace with actual stats from database
  const stats = [
    { label: "Open Tickets", value: "12" },
    { label: "Tickets Today", value: "5" },
    { label: "Avg Response Time", value: "2h" },
    { label: "Customer Satisfaction", value: "94%" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-lg bg-[#1C1C1C] border border-[#333333]"
          >
            <div className="text-sm text-gray-400">{stat.label}</div>
            <div className="text-2xl font-bold text-white mt-2">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-lg bg-[#1C1C1C] border border-[#333333]">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <p className="text-gray-400">No recent activity to display.</p>
      </div>
    </div>
  );
} 