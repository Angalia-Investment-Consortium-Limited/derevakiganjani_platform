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

interface Driver {
  uid: string;
  email?: string;
  full_name?: string;
  createdAt?: Timestamp;
  phoneNumber?: string;
  mobile_no?: string;
  // This license field is based on an assumption that it exists on the user document
  license?: {
      isVerified?: boolean;
      status?: string;
  };
  // from driver_profiles
  licenseNumber?: string;
}

const DriverManagement = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsLoading(true);

    const usersQuery = query(
      collection(db, "users"),
      where("roles", "array-contains", "Driver")
    );

    const unsubscribe = onSnapshot(
      usersQuery,
      async (snapshot) => {
        if (snapshot.empty) {
          setDrivers([]);
          setIsLoading(false);
          return;
        }

        const driversPromises = snapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          let driverProfileData = {};

          try {
            const driverDoc = await getDoc(doc(db, "driver_profiles", userDoc.id));
            if (driverDoc.exists()) {
              driverProfileData = driverDoc.data();
            }
          } catch (e) {
            console.error("Error fetching driver profile:", e);
          }

          return {
            uid: userDoc.id,
            ...userData,
            ...driverProfileData,
          } as Driver;
        });

        const resolvedDrivers = await Promise.all(driversPromises);
        
        resolvedDrivers.sort((a, b) => {
            const dateA = a.createdAt?.toMillis() || 0;
            const dateB = b.createdAt?.toMillis() || 0;
            return dateB - dateA;
        });

        setDrivers(resolvedDrivers);
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

  const filteredDrivers = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return drivers.filter(
      (driver) =>
        (driver.full_name || "").toLowerCase().includes(lowercasedQuery) ||
        (driver.email || "").toLowerCase().includes(lowercasedQuery) ||
        (driver.phoneNumber || "").toLowerCase().includes(lowercasedQuery) ||
        (driver.mobile_no || "").toLowerCase().includes(lowercasedQuery)
    );
  }, [drivers, searchQuery]);

 const getLicenseStatus = (driver: Driver) => {
      if (driver.license?.isVerified) {
          return { text: 'Verified', variant: 'default' as const };
      }
       if (driver.license?.status === 'pending') {
          return { text: 'Pending', variant: 'secondary' as const };
      }
       if (driver.license?.status === 'rejected') {
          return { text: 'Rejected', variant: 'destructive' as const };
      }
      return { text: 'Not Submitted', variant: 'outline' as const };
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <p className="text-muted-foreground">
            View, manage, and interact with driver accounts.
          </p>
        </div>
        <Button onClick={() => navigate("/admin/users/new?role=Driver")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
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
                Failed to load drivers. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>License Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.length > 0 ? (
                    filteredDrivers.map((driver) => {
                        const licenseStatus = getLicenseStatus(driver);
                        return (
                          <TableRow key={driver.uid}>
                            <TableCell className="font-medium">
                              {driver.full_name || "N/A"}
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">{driver.email}</div>
                                <div className="text-xs text-muted-foreground">{driver.phoneNumber || driver.mobile_no || 'No phone'}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={licenseStatus.variant}>
                                {licenseStatus.text}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {driver.createdAt
                                ? new Date(
                                    driver.createdAt.seconds * 1000
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
                                      navigate(`/driver/${driver.uid}`)
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate(`/admin/users/${driver.uid}/edit`)
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
                        )
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center"
                      >
                        No drivers found.
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

export default DriverManagement;
