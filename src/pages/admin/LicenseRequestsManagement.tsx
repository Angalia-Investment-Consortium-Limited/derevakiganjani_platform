
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { columns } from "@/components/admin/requests/Columns";
import { DataTable } from "@/components/ui/data-table";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { LicenseRequest } from '@/types/license';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const LicenseRequestsManagement = () => {
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "license_requests"), 
      (snapshot) => {
        const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LicenseRequest));
        setRequests(reqs);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching license requests: ", error);
        toast({
          title: "Error",
          description: "Could not fetch license requests.",
          variant: "destructive"
        });
        setIsLoading(false);
      });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>General License Requests</CardTitle>
          <CardDescription>Review and respond to general inquiries and support requests from drivers.</CardDescription>
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
            <DataTable columns={columns} data={requests} filterColumn="fullName" />
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default LicenseRequestsManagement;
