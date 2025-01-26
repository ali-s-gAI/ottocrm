import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function DocsPage() {
  const supabase = await createClient();

  // Get user role for admin check
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  const isAdmin = profile?.role === 'ADMIN';

  // Fetch documentation from Supabase
  const { data: docs } = await supabase
    .from('documentation')
    .select('*')
    .order('created_at', { ascending: false });

  const faqs = [
    {
      question: "How do I create a new ticket?",
      answer: "To create a new ticket, click on 'Tickets' in the sidebar, then click the 'New Ticket' button in the top right corner. Fill out the ticket form with a title, description, and any other relevant details."
    },
    {
      question: "How do I check the status of my ticket?",
      answer: "You can view all your tickets by clicking on 'Tickets' in the sidebar. Each ticket will show its current status (Open, In Progress, Resolved, or Closed). Click on any ticket to view more details."
    },
    {
      question: "How do I update my profile information?",
      answer: "Click on 'Settings' in the sidebar to access your profile settings. Here you can update your name, email, and other profile information."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentation & FAQ</h1>
          <p className="text-muted-foreground mt-2">
            Find answers to common questions and learn how to use OttoCRM effectively.
          </p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/docs/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6">
        {/* Documentation Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Documentation</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {(docs || []).map((doc) => (
              <Link key={doc.id} href={`/dashboard/docs/${doc.id}`}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle>{doc.title}</CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">{doc.content}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 