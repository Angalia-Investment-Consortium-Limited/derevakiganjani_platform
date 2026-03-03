import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Search, Edit, Trash2, MoreHorizontal, Loader2, AlertCircle, Eye, PlusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, getDoc, doc, Timestamp } from "firebase/firestore";

interface Employer {
  uid: string;
  email?: string;
  full_name?: string;
  createdAt?: Timestamp;
  // from employers collection
  company_name?: string;
  contactPerson?: string;
  verificationStatus?: 'Verified' | 'Pending' | 'Rejected';
}

const EmployerManagement = () => {
  const navigate = useNavigate();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsLoading(true);

    const usersQuery = query(
      collection(db, "users"),
      where("roles", "array-contains", "Employer")
    );

    const unsubscribe = onSnapshot(
      usersQuery,
      async (snapshot) => {
        if (snapshot.empty) {
          setEmployers([]);
          setIsLoading(false);
          return;
        }

        const employersPromises = snapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          let employerData = {};

          // Fetch corresponding employer profile
          try {
            const employerDoc = await getDoc(doc(db, "employers", userDoc.id));
            if (employerDoc.exists()) {
              employerData = employerDoc.data();
            }
          } catch (e) {
            console.error("Error fetching employer profile:", e);
          }

          return {
            uid: userDoc.id,
            ...userData,
            ...employerData,
          } as Employer;
        });

        const resolvedEmployers = await Promise.all(employersPromises);
        
        // Sort by creation date descending
        resolvedEmployers.sort((a, b) => {
            const dateA = a.createdAt?.toMillis() || 0;
            const dateB = b.createdAt?.toMillis() || 0;
            return dateB - dateA;
        });
        
        setEmployers(resolvedEmployers);
        setIsLoading(false);
      },
      (err) => {
        console.error("Firebase snapshot error:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);



  const filteredEmployers = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return employers.filter(
      (employer) =>
        (employer.full_name || "").toLowerCase().includes(lowercasedQuery) ||
        (employer.email || "").toLowerCase().includes(lowercasedQuery) ||
        (employer.company_name || "").toLowerCase().includes(lowercasedQuery) ||
        (employer.contactPerson || "").toLowerCase().includes(lowercasedQuery)
    );
  }, [employers, searchQuery]);

  const getStatusVariant = (status?: string) => {
      switch (status) {
          case 'Verified': return 'default';
          case 'Pending': return 'secondary';
          case 'Rejected': return 'destructive';
          default: return 'outline';
      }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Employer Management</h1>
          <p className="text-muted-foreground">
            View, manage, and verify employer accounts.
          </p>
        </div>
        <Button onClick={() => navigate("/admin/users/new?role=Employer")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Employer
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load employers. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployers.length > 0 ? (
                    filteredEmployers.map((employer) => (
                      <TableRow key={employer.uid}>
                        <TableCell className="font-medium">
                          {employer.company_name || "N/A"}
                        </TableCell>
                        <TableCell>
                            <div className="text-sm">{employer.contactPerson || employer.full_name}</div>
                            <div className="text-xs text-muted-foreground">{employer.email}</div>
                        </TableCell>
                        <TableCell>
                           <Badge variant={getStatusVariant(employer.verificationStatus)}>
                                {employer.verificationStatus || 'N/A'}
                           </Badge>
                        </TableCell>
                        <TableCell>
                          {employer.createdAt
                            ? new Date(
                                employer.createdAt.seconds * 1000
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/admin/employer-review/${employer.uid}`
                                  )
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Review
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/admin/users/${employer.uid}/edit`)
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center"
                      >
                        No employers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default EmployerManagement;
