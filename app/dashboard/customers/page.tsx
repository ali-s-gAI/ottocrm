import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CustomerList } from "@/components/dashboard/customers/customer-list";

type CustomerData = {
  id: string;
  full_name: string;
  created_at: string;
  auth_users: {
    email: string;
  } | null;
};

export default async function CustomersPage() {
  const supabase = await createClient();

  // Check user role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('Current user profile:', { id: user.id, profile });
  console.log('JWT claims:', await supabase.auth.getSession());

  // Only allow ADMIN and AGENT roles
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'AGENT')) {
    return redirect("/dashboard");
  }

  // Get customer profiles
  const { data: customers, error: customersError } = await supabase
    .from('user_profiles')
    .select('id, full_name, created_at')
    .eq('role', 'CUSTOMER')
    .order('created_at', { ascending: false });

  console.log('Customers from user_profiles:', customers);

  if (customersError) {
    console.error('Error fetching customers:', customersError);
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-destructive">Error loading customers. Please try again later.</p>
      </div>
    );
  }

  // Get emails for all customers in a single query
  const { data: emails } = await supabase
    .from('auth.users')
    .select('id, email')
    .in('id', (customers || []).map(c => c.id));

  console.log('Emails from auth.users:', emails);

  // Create a map of id to email
  const emailMap = new Map(
    (emails || []).map(user => [user.id, user.email])
  );

  // Transform the data to match our expected format
  const transformedCustomers = (customers || []).map(customer => ({
    id: customer.id,
    full_name: customer.full_name,
    created_at: customer.created_at,
    email: emailMap.get(customer.id) || 'No email'
  }));

  console.log('Transformed customers:', transformedCustomers);

  // Get ticket counts for each customer
  const customersWithCounts = await Promise.all(
    transformedCustomers.map(async (customer) => {
      const { count: openCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', customer.id)
        .in('status', ['OPEN', 'IN_PROGRESS']);

      const { count: closedCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', customer.id)
        .in('status', ['RESOLVED', 'CLOSED']);

      return {
        ...customer,
        open_tickets: openCount || 0,
        closed_tickets: closedCount || 0
      };
    })
  );

  console.log('Final customers with counts:', customersWithCounts);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Customers</h1>
      <CustomerList initialCustomers={customersWithCounts} />
    </div>
  );
} 