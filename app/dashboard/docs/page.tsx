import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function DocsPage() {
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
      question: "What do the different ticket priorities mean?",
      answer: "Tickets can be set to three priority levels: High (urgent issues requiring immediate attention), Medium (standard issues), and Low (minor issues or general inquiries)."
    },
    {
      question: "How do I update my profile information?",
      answer: "Click on 'Settings' in the sidebar to access your profile settings. Here you can update your name and other profile information."
    }
  ];

  const guides = [
    {
      title: "Getting Started",
      description: "Learn the basics of using OttoCRM",
      content: "Welcome to OttoCRM! This guide will help you get started with our platform. OttoCRM is designed to streamline customer support interactions and make ticket management efficient and straightforward."
    },
    {
      title: "Ticket Management",
      description: "Learn how to effectively manage support tickets",
      content: "Tickets are the core of OttoCRM. They help track customer inquiries, bug reports, and feature requests. Each ticket can be assigned a priority level and status, and can be assigned to specific support agents."
    },
    {
      title: "Best Practices",
      description: "Tips for effective customer support",
      content: "Providing excellent customer support requires clear communication, prompt responses, and proper ticket management. Always provide detailed responses and keep tickets updated with the latest status."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documentation & FAQ</h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions and learn how to use OttoCRM effectively.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Documentation Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Documentation</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {guides.map((guide) => (
              <Card key={guide.title}>
                <CardHeader>
                  <CardTitle>{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{guide.content}</p>
                </CardContent>
              </Card>
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