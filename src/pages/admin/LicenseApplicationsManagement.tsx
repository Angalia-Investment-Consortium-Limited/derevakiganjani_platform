
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { columns } from "@/components/admin/license/Columns";
import { DataTable } from "@/components/ui/data-table";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { LicenseApplication } from '@/types/license';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const LicenseApplicationsManagement = () => {
  const [applications, setApplications] = useState<LicenseApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "license_applications"), 
      (snapshot) => {
        const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LicenseApplication));
        setApplications(apps);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching license applications: ", error);
        toast({
          title: "Error",
          description: "Could not fetch license applications.",
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
          <CardTitle>License Applications</CardTitle>
          <CardDescription>Review and manage all incoming driver license applications.</CardDescription>
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
            <DataTable columns={columns} data={applications} filterColumn="fullName" />
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default LicenseApplicationsManagement;
