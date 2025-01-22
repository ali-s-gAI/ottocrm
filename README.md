# OttoCRM

A modern customer support platform built with Next.js and Supabase.

## Features

- **Modern Tech Stack**
  - Next.js 15 (App Router)
  - Supabase for auth, database, and real-time updates
  - TypeScript
  - Tailwind CSS with shadcn/ui components
  - Real-time ticket updates

- **Role-Based Access**
  - Admin: Full system access, can manage agents and assign tickets
  - Agent: Handle and respond to tickets
  - Customer: Create and track tickets

- **Ticket Management**
  - Create tickets with title, description, and priority
  - Real-time status updates
  - Priority levels (High, Medium, Low) with color coding
  - Status tracking (Open, In Progress, Resolved, Closed)
  - Agent assignment system

- **Dashboard Features**
  - Overview of ticket metrics
  - Real-time activity feed
  - Ticket filtering and sorting
  - Agent performance tracking

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Supabase project and update environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update the following in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=[YOUR SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR SUPABASE ANON KEY]
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tables
- `user_profiles`: Extended user information and roles
- `tickets`: Support ticket management
  - Status: OPEN, IN_PROGRESS, RESOLVED, CLOSED
  - Priority: HIGH, MEDIUM, LOW

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
