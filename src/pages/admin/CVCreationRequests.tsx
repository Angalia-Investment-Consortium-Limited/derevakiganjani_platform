import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  updateDoc,
  doc, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, CheckCircle2, Upload } from 'lucide-react';
import type { CVRequest } from '@/hooks/useCVCreation';

const CVCreationRequests = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CVRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'cv_requests'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CVRequest[];
      setRequests(data);
    } catch (err) {
      console.error("Error fetching CV requests:", err);
      toast({
        title: "Error",
        description: "Failed to fetch CV requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string, cvUrl?: string) => {
    setIsUpdating(id);
    try {
      const docRef = doc(db, 'cv_requests', id);
      const updateData: any = {
        requestStatus: newStatus,
        updatedAt: serverTimestamp()
      };
      if (cvUrl) {
        updateData.cvUrl = cvUrl;
      }
      
      await updateDoc(docRef, updateData);
      
      toast({
        title: "Status Updated",
        description: `CV Request marked as ${newStatus}`,
      });
      fetchRequests(); // refresh list
    } catch (err) {
      console.error("Error updating CV request:", err);
      toast({
        title: "Update Failed",
        description: "Could not update the CV request",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.driverPhone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || req.requestStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CV Creation Requests</h1>
            <p className="text-muted-foreground">Manage and generate professional CVs for drivers.</p>
          </div>
        </div>

        <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>Drivers who have paid for the Kiganjani CV Service.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input 
              placeholder="Search by name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {['All', 'Requested', 'Drafting', 'Completed'].map(status => (
                <Button 
                  key={status} 
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No CV requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedRequests.map((request) => (
                <div key={request.id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex-1 space-y-1 text-center md:text-left">
                    <p className="font-semibold text-lg">{request.driverName || 'Unknown Driver'}</p>
                    <p className="text-sm text-muted-foreground">Phone: {request.driverPhone || 'N/A'} • UID: {request.userId}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                      <Badge variant={request.paymentStatus === 'Paid' ? 'default' : 'secondary'}>
                        {request.paymentStatus}
                      </Badge>
                      <Badge variant={request.requestStatus === 'Completed' ? 'default' : 'outline'}>
                        {request.requestStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    {request.requestStatus === 'Requested' && (
                      <Button 
                        onClick={() => navigate(`/admin/cv-builder/${request.id}`)}
                        disabled={request.paymentStatus !== 'Paid'}
                      >
                        Start Drafting
                      </Button>
                    )}
                    
                    {request.requestStatus === 'Drafting' && (
                      <Button 
                        variant="secondary"
                        onClick={() => navigate(`/admin/cv-builder/${request.id}`)}
                      >
                        Continue Drafting
                      </Button>
                    )}
                    
                    {request.requestStatus === 'Completed' && (
                      <Button variant="outline" onClick={() => window.open(request.cvUrl, '_blank')} disabled={!request.cvUrl}>
                        <FileText className="h-4 w-4 mr-2" />
                        View CV
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 border-t pt-4 gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Show:</span>
                      <select 
                        className="bg-background border rounded px-2 py-1"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm font-medium">Page {currentPage} of {totalPages}</div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
};

export default CVCreationRequests;
