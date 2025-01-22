import { createClient } from "@/utils/supabase/server";

type DashboardStats = {
  openTickets: number;
  ticketsToday: number;
  avgResponseTime: string;
  satisfaction: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Fetch open tickets count
  const { count: openTickets } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'OPEN');

  // Fetch tickets created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: ticketsToday } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  const stats = [
    { label: "Open Tickets", value: openTickets?.toString() || "0" },
    { label: "Tickets Today", value: ticketsToday?.toString() || "0" },
    { label: "Avg Response Time", value: "< 24h" }, // We can implement this later with actual response time tracking
    { label: "Customer Satisfaction", value: "Coming Soon" },
  ];

  // Fetch recent activity
  const { data: recentTickets } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by_profile:user_profiles!created_by(full_name),
      assigned_to_profile:user_profiles!assigned_to(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-lg bg-[#1C1C1C] border border-[#333333] hover:border-[#444444] transition-colors"
          >
            <div className="text-sm text-gray-400">{stat.label}</div>
            <div className="text-2xl font-bold text-white mt-2">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-lg bg-[#1C1C1C] border border-[#333333]">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        {recentTickets && recentTickets.length > 0 ? (
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 rounded-md bg-[#252525] border border-[#333333]">
                <div>
                  <h3 className="font-medium text-white">{ticket.title}</h3>
                  <p className="text-sm text-gray-400">
                    Created by {ticket.created_by_profile?.full_name || 'Unknown'} 
                    {ticket.assigned_to_profile && ` • Assigned to ${ticket.assigned_to_profile.full_name}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    ticket.priority === 'HIGH' ? 'bg-red-500/10 text-red-500' :
                    ticket.priority === 'MEDIUM' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-500' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-purple-500/10 text-purple-500' :
                    ticket.status === 'RESOLVED' ? 'bg-green-500/10 text-green-500' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No recent activity to display.</p>
        )}
      </div>
    </div>
  );
} 