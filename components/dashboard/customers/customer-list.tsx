"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

type Customer = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  open_tickets: number;
  closed_tickets: number;
};

type SortField = "name" | "tickets" | "created";
type SortOrder = "asc" | "desc";

export function CustomerList({
  initialCustomers,
}: {
  initialCustomers: Customer[];
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortCustomers = (field: SortField) => {
    const newOrder = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    setSortField(field);

    const sorted = [...customers].sort((a, b) => {
      const multiplier = newOrder === "asc" ? 1 : -1;
      
      switch (field) {
        case "name":
          return multiplier * a.full_name.localeCompare(b.full_name);
        case "tickets":
          const totalA = a.open_tickets + a.closed_tickets;
          const totalB = b.open_tickets + b.closed_tickets;
          return multiplier * (totalA - totalB);
        case "created":
          return multiplier * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        default:
          return 0;
      }
    });

    setCustomers(sorted);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => sortCustomers("name")}
                className="h-8 text-left font-medium"
              >
                Customer Name {getSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => sortCustomers("tickets")}
                className="h-8 text-left font-medium"
              >
                Tickets {getSortIcon("tickets")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => sortCustomers("created")}
                className="h-8 text-left font-medium"
              >
                Customer Since {getSortIcon("created")}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.full_name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>
                <span className="text-green-500">{customer.open_tickets} open</span>
                {" • "}
                <span className="text-gray-500">{customer.closed_tickets} closed</span>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 