Below is **(1) a Markdown PRD** that outlines core features, requirements, and technical considerations for your MVP ZenDesk-like CRM, followed by **(2) an example file structure** (with brief explanations) for a Next.js 15 (App Router) + Supabase + TypeScript project.

---

# 1. Project Requirements Document (PRD)

## Overview

**Project Name**: OttoCRM (ZenDesk-like CRM MVP)

**Tech Stack**:  
- **Frontend**: TypeScript, React, Next.js 15 (App Router)  
- **Backend**: [Vercel-deployed Next.js serverless API routes], Supabase  
- **Database**: Supabase (PostgreSQL + Realtime)  
- **Auth**: Supabase Auth  
- **Hosting**: Vercel

**User Roles**:
1. **Admin** 
2. **Employee (Customer Support Agent)**
3. **Customer**

Each role gets a different view (dashboard) and permissions.

---

## Goals and Features

### A. User Management & Authentication
1. **Supabase Auth Integration**  
   - [ ] Implement Supabase Auth (Sign up, Sign in, Password reset, etc.)  
   - [ ] Automatically store user records in `auth.users`  
   - [ ] Create a `profiles` or `user_profiles` table to store:
     - `id` (UUID, matches `auth.users` user ID)  
     - `role` (enum: `ADMIN`, `AGENT`, `CUSTOMER`)  
     - Additional fields like `name`, `email`, etc.  
   - [ ] Ensure that each user is assigned the correct role upon creation.
2. **Role-based Access**  
   - [ ] Secure serverless routes to ensure only permitted roles can access certain data.  
   - [ ] Show different dashboards (admin vs. agent vs. customer) based on role.

### B. Ticket Management
1. **Database Schema: `tickets` Table**  
   - [ ] **ID**: primary key (UUID or serial)  
   - [ ] **created_at**: timestamp  
   - [ ] **updated_at**: timestamp (for last update)  
   - [ ] **status**: (e.g., `IN_PROGRESS`, `RESOLVED`, etc.)  
   - [ ] **priority**: (e.g., `HIGH`, `MEDIUM`, `LOW`)  
   - [ ] **tags**: text[] or separate join table (`ticket_tags`)  
   - [ ] **title**: text/string  
   - [ ] **description**: text/string (initial issue details)  
   - [ ] **internal_notes**: text/string (could also have a separate `ticket_notes` table)  
   - [ ] **assigned_to**: foreign key referencing `user_profiles.id` (for employee assignment)  
   - [ ] **created_by**: foreign key referencing `user_profiles.id` (who opened the ticket)
2. **Real-time Updates**  
   - [ ] Enable Supabase Realtime on `tickets` table for immediate UI updates.  
   - [ ] (Optional) Use presence or channel-based subscriptions for collaborative chat.
3. **Conversation/Chat History**  
   - [ ] Use a `ticket_conversations` or `ticket_messages` table to store all messages.  
     - `id`, `ticket_id`, `sender_id`, `message_text`, `created_at`.  
   - [ ] This table will allow showing the entire conversation history in the chat UI.
4. **Filtering & Sorting**  
   - [ ] By priority (High, Medium, Low).  
   - [ ] By status (In Progress, Resolved).  
   - [ ] By assignee (Just My Tickets).  
   - [ ] By creation date.

### C. Agent (Employee) Dashboard
1. **Queue Management**  
   - [ ] **Customizable Views**: Sort tickets by priority, status, etc.  
   - [ ] **Real-Time Updates**: Reflect ticket changes instantly via Supabase Realtime.  
   - [ ] **Quick Filters**: By status, priority, or tags.  
   - [ ] **Bulk Operations**: Close multiple tickets at once, etc.
2. **Ticket Handling**  
   - [ ] **Ticket Details**: Show description, conversation history, tags, internal notes.  
   - [ ] **Rich Text Editing**: Compose responses using a simple rich text editor or markdown input.  
   - [ ] **Quick Responses (Macros)**: (Future or MVP, but placeholders for templates).  
   - [ ] **Collaboration**: Option to add internal notes that do not show to customers.
3. **Performance Tools**  
   - [ ] **Metrics**: Show average response times, resolution rates.  
   - [ ] **Personal Stats**: Summaries of tickets handled, average resolution time, etc.

### D. Admin Dashboard
1. **Team Management**  
   - [ ] **Create/Manage Teams**: Group agents by skill, region, etc. (MVP can just be a concept, or store in a `teams` table).  
   - [ ] **Assign Agents** to tickets or skill groups.  
   - [ ] **Coverage Schedules**: Show who is on duty (could be a simple text field for now).  
2. **Routing Intelligence (Future)**  
   - [ ] **Rule-Based Assignment**: e.g., by keywords or tags.  
   - [ ] **Skills-Based Routing**: Assign tickets automatically if an agent has the matching skill (e.g., `IT`, `Billing`).  
   - [ ] **Load Balancing**: Distribute tickets among available agents.
3. **Dashboard Metrics**  
   - [ ] **Team Performance**: Show overall KPI (tickets open/closed, average resolution time, etc.).  
   - [ ] **Agent Metrics**: Compare performance across agents.

### E. Customer Portal
1. **Ticket Tracking**  
   - [ ] Customers can log in, view a list of their tickets, and see statuses.  
   - [ ] They can add additional messages or attachments.
2. **Self-Service (Future)**  
   - [ ] **Knowledge Base**: Provide FAQs or articles (MVP can skip or just have placeholders).  
   - [ ] **AI-Powered Chatbot**: Possibly incorporate RAG approach with existing knowledge.
3. **Communication Tools**  
   - [ ] **Live Chat**: Real-time chat with an agent.  
   - [ ] **Email Integration**: Create/update tickets via email (can be a future integration).
4. **Feedback & Ratings**  
   - [ ] **Rate Ticket Resolution**: 1-5 star rating or thumbs up/down.  
   - [ ] **Feedback Comments**: Store in a `ticket_feedback` table.

### F. Data Management & Supabase
1. **Schema Flexibility**  
   - [ ] The ability to add fields and tags easily in the DB.  
   - [ ] Migrations: (Supabase migration scripts or manual).  
   - [ ] **Audit Logging**: Keep track of changes (`audit_logs` table with `action`, `table_name`, `record_id`, `user_id`, `timestamp`).
2. **Performance**  
   - [ ] **Caching**: (Optional for MVP; possibly leverage Next.js ISR or caching).  
   - [ ] **Query Optimization**: Indexes on frequently queried columns (e.g., `assigned_to`, `status`).  
   - [ ] **Attachments**: Possibly store in Supabase Storage with references in DB.  
   - [ ] **Maintenance**: Basic DB housekeeping tasks.

### G. UI Components
1. **Layout**  
   - [ ] **Header**: Tab view for tickets (draggable tabs, plus “+” button to open new tab).  
   - [ ] **SideBar**: Common navigation for each role’s main sections.  
   - [ ] **Dashboard**: One or multiple pages for admin, agent, and customer.  
   - [ ] **Chat**: A chat widget that appears (right-aligned), possibly toggleable.  
   - [ ] **ChatSide**: The side panel that might show conversation details, internal notes, etc.
2. **Responsiveness**  
   - [ ] Ensure the layout is responsive enough for desktop and at least passable on mobile.

### H. Deployment and Environment
1. **Deployment**  
   - [ ] Deploy on Vercel, ensuring environment variables for Supabase (API key, project URL) are set.  
   - [ ] Automatic deployments on `main` or `master` branch push.
2. **Environment Variables**  
   - [ ] `NEXT_PUBLIC_SUPABASE_URL`  
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - [ ] Possibly a service key for serverless routes if needed.

### I. Testing and QA
1. **Unit & Integration Testing**  
   - [ ] Write basic tests for critical components (e.g., ticket creation, role-based route protection).
2. **E2E Testing** (Future)  
   - [ ] Cypress/Playwright tests for login flows, ticket creation, etc.

### J. Roadmap
- **MVP**:
  - [ ] Auth (Supabase), basic roles, create/read/update tickets, real-time changes, simple dashboards.  
  - [ ] Basic chat within a ticket.  
  - [ ] Basic metrics (count of tickets, statuses).  
- **Phase 2**:
  - [ ] Advanced analytics, team management, skill-based routing.  
  - [ ] Knowledge base, AI chatbot integration.  
  - [ ] Email integration, rating system.
 
- The MVP focuses on **core ticket CRUD** + **role-based dashboards** + **Supabase auth** + **real-time**. You can add or remove sections as your project evolves.