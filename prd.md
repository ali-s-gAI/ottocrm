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
1. **Supabase Auth Integration** ✓ 
   - [x] Implement Supabase Auth (Sign up, Sign in, Password reset, etc.)  
   - [x] Automatically store user records in `auth.users`  
   - [x] Create a `profiles` or `user_profiles` table to store:
     - `id` (UUID, matches `auth.users` user ID)  
     - `role` (enum: `ADMIN`, `AGENT`, `CUSTOMER`)  
     - Additional fields like `name`, `email`, etc.  
   - [x] Ensure that each user is assigned the correct role upon creation.
2. **Role-based Access** ✓
   - [x] Secure serverless routes to ensure only permitted roles can access certain data.  
   - [x] Show different dashboards (admin vs. agent vs. customer) based on role.

### B. Ticket Management
1. **Database Schema: `tickets` Table** ✓
   - [x] **ID**: primary key (UUID)  
   - [x] **created_at**: timestamp  
   - [x] **updated_at**: timestamp (for last update)  
   - [x] **status**: ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')  
   - [x] **priority**: ENUM ('HIGH', 'MEDIUM', 'LOW')  
   - [x] **tags**: text[] (implemented but not yet used in UI)  
   - [x] **title**: text/string  
   - [x] **description**: text/string  
   - [x] **internal_notes**: text/string  
   - [x] **assigned_to**: foreign key referencing `user_profiles.id`  
   - [x] **created_by**: foreign key referencing `user_profiles.id`
2. **Real-time Updates** ✓
   - [x] Enable Supabase Realtime on `tickets` table for immediate UI updates.  
   - [ ] (Optional) Use presence or channel-based subscriptions for collaborative chat.
3. **Conversation/Chat History**  
   - [ ] Use a `ticket_conversations` or `ticket_messages` table to store all messages.  
     - `id`, `ticket_id`, `sender_id`, `message_text`, `created_at`.  
   - [ ] This table will allow showing the entire conversation history in the chat UI.
4. **Filtering & Sorting** (Partially Complete)
   - [x] By priority (High, Medium, Low) - UI implemented  
   - [x] By status (Open, In Progress, Resolved, Closed) - UI implemented  
   - [ ] By assignee (Just My Tickets)  
   - [x] By creation date - Default sorting implemented

### C. Agent (Employee) Dashboard
1. **Queue Management**  
   - [x] **Real-Time Updates**: Reflect ticket changes instantly via Supabase Realtime.  
   - [ ] **Customizable Views**: Sort tickets by priority, status, etc.  
   - [ ] **Quick Filters**: By status, priority, or tags.  
   - [ ] **Bulk Operations**: Close multiple tickets at once, etc.
2. **Ticket Handling**  
   - [x] **Ticket Details**: Show description, status, priority  
   - [ ] **Rich Text Editing**: Compose responses using a simple rich text editor  
   - [ ] **Quick Responses (Macros)**: Future enhancement  
   - [ ] **Collaboration**: Option to add internal notes
3. **Performance Tools**  
   - [x] **Metrics**: Basic metrics implemented (open tickets, daily tickets)  
   - [ ] **Personal Stats**: Summaries of tickets handled

### D. Admin Dashboard
1. **Team Management**  
   - [x] **Assign Agents**: Admin can assign tickets to agents  
   - [ ] **Create/Manage Teams**: Future enhancement  
   - [ ] **Coverage Schedules**: Future enhancement
2. **Routing Intelligence** (Future)
   - [ ] **Rule-Based Assignment**  
   - [ ] **Skills-Based Routing**  
   - [ ] **Load Balancing**
3. **Dashboard Metrics**  
   - [x] **Team Performance**: Basic metrics implemented  
   - [x] **Agent Metrics**: Basic workload view (open/closed tickets)

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
1. **Layout** ✓
   - [x] **Header**: Navigation and user info  
   - [x] **SideBar**: Role-based navigation  
   - [x] **Dashboard**: Different views per role  
   - [ ] **Chat**: Future enhancement  
   - [ ] **ChatSide**: Future enhancement
2. **Responsiveness**  
   - [x] Desktop layout implemented  

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