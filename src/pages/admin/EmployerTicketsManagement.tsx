import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from "@/components/ui/data-table";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, CheckCircle, Clock } from 'lucide-react';

interface EmployerTicket {
  id: string;
  employerId: string;
  email: string;
  companyName: string;
  subject: string;
  details: string;
  status: string;
  createdAt: any;
}

const EmployerTicketsManagement = () => {
  const [tickets, setTickets] = useState<EmployerTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "employer_tickets"),
      (snapshot) => {
        const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployerTicket));
        setTickets(reqs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching employer tickets: ", error);
        toast({
          title: "Error",
          description: "Could not fetch employer tickets.",
          variant: "destructive"
        });
        setIsLoading(false);
      });

    return () => unsubscribe();
  }, [toast]);

  const updateStatus = async (id: string, status: string) => {
      try {
          await updateDoc(doc(db, "employer_tickets", id), { status });
          toast({ title: "Success", description: `Ticket marked as ${status}` });
      } catch (e) {
          toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      }
  };

  const columns: ColumnDef<EmployerTicket>[] = [
    {
      accessorKey: "companyName",
      header: "Employer / Company",
    },
    {
      accessorKey: "subject",
      header: "Subject",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant="outline" className={
              status === 'Open' ? 'bg-blue-100 text-blue-700' : 
              status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
              status === 'Resolved' ? 'bg-green-100 text-green-700' : ''
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as any;
        if (!date) return 'N/A';
        return new Date(date.toDate ? date.toDate() : date).toLocaleDateString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ticket = row.original;
   
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => window.location.href = `mailto:${ticket.email}?subject=RE: ${ticket.subject}`}>
                <Mail className="mr-2 h-4 w-4" /> Email Employer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => updateStatus(ticket.id, 'In Progress')}>
                <Clock className="mr-2 h-4 w-4 text-yellow-500" /> Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus(ticket.id, 'Resolved')}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mark Resolved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Employer Tickets</CardTitle>
          <CardDescription>Review and respond to support requests from employers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <DataTable columns={columns} data={tickets} filterColumn="companyName" />
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default EmployerTicketsManagement;
