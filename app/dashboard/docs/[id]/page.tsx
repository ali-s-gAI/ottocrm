import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the document
  const { data: doc, error } = await supabase
    .from('documentation')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !doc) {
    notFound();
  }

  // Get user for admin check
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  const isAdmin = profile?.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/docs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{doc.title}</h1>
          <p className="text-muted-foreground">{doc.description}</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {doc.content.split('\n').map((paragraph: string, index: number) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {isAdmin && (
        <div className="flex justify-end pt-6 border-t">
          <Link href={`/dashboard/docs/${id}/edit`}>
            <Button variant="outline">Edit Document</Button>
          </Link>
        </div>
      )}
    </div>
  );
} 
