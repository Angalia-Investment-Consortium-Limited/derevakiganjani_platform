import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Loader2, MessageSquare, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const OutsourceRequestsTracking = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const employerId = (profile as any)?.userId || user?.uid;
    if (!employerId) return;

    const q = query(
      collection(db, 'outsource_contracts'),
      where('employerId', '==', employerId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort locally to avoid requiring a composite index
      data.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setRequests(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile, user]);

  const handleViewDetails = (req: any) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Request Submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Matching Drivers': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Terminated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
           <div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">My Outsource Requests</h1>
             <p className="text-muted-foreground">Track the status of your long-term driver requests and view recommendations.</p>
           </div>
           <Button onClick={() => navigate('/employer/outsource')}>
             + New Request
           </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>All your submitted driver outsourcing contracts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Requirement</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                         <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        You have no outsource requests.
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="font-semibold">{req.driverLevel}</div>
                          <div className="text-xs text-muted-foreground">{req.vehicleType} &bull; {req.numberOfDrivers || 1} Driver{req.numberOfDrivers > 1 ? 's' : ''}</div>
                        </TableCell>
                        <TableCell>{req.district ? `${req.district}, ${req.region}` : req.region}</TableCell>
                        <TableCell>{req.contractDuration}</TableCell>
                        <TableCell>
                          {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(req.status)}>
                            {req.status || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleViewDetails(req)}>
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Outsource Request Details</DialogTitle>
              <DialogDescription>
                Full details and platform feedback for this request.
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6 py-4">
                {/* Status & Feedback Banner */}
                <div className={`p-4 rounded-lg border ${selectedRequest.adminFeedback ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'}`}>
                   <div className="flex justify-between items-start mb-3">
                     <h3 className="font-semibold flex items-center gap-2">
                       <MessageSquare className="h-4 w-4 text-primary" /> Admin Feedback
                     </h3>
                     <Badge variant="outline" className={getStatusBadge(selectedRequest.status)}>
                       {selectedRequest.status || 'Pending'}
                     </Badge>
                   </div>
                   <p className="text-sm">
                     {selectedRequest.adminFeedback ? selectedRequest.adminFeedback : "Your request is currently being reviewed. You will see feedback from our team here soon."}
                   </p>
                </div>

                {/* Recommended Drivers */}
                {((selectedRequest.recommendedDriverIds && selectedRequest.recommendedDriverIds.length > 0) || selectedRequest.assignedDriverId) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Recommended Drivers
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.recommendedDriverIds && selectedRequest.recommendedDriverIds.length > 0 ? (
                        selectedRequest.recommendedDriverIds.map((driverId: string, idx: number) => (
                           <Button key={driverId} variant="outline" size="sm" onClick={() => navigate(`/employer/drivers/${driverId}`)}>
                             View Driver Candidate {idx + 1}
                           </Button>
                        ))
                      ) : (
                         <Button variant="outline" size="sm" onClick={() => navigate(`/employer/drivers/${selectedRequest.assignedDriverId}`)}>
                           View Assigned Driver
                         </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Request Spec */}
                <div>
                   <h3 className="font-semibold mb-3 border-b pb-2">Original Request Specifications</h3>
                   <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                     <div>
                       <span className="text-muted-foreground block mb-1">Role / Level</span>
                       <span className="font-medium">{selectedRequest.driverLevel}</span>
                     </div>
                     <div>
                       <span className="text-muted-foreground block mb-1">Vehicle Type</span>
                       <span className="font-medium">{selectedRequest.vehicleType}</span>
                     </div>
                     <div>
                       <span className="text-muted-foreground block mb-1">Location</span>
                       <span className="font-medium">{selectedRequest.district ? `${selectedRequest.district}, ${selectedRequest.region}` : selectedRequest.region}</span>
                     </div>
                     <div>
                       <span className="text-muted-foreground block mb-1">Contract Duration</span>
                       <span className="font-medium">{selectedRequest.contractDuration}</span>
                     </div>
                     <div>
                       <span className="text-muted-foreground block mb-1">Expected Start</span>
                       <span className="font-medium">{selectedRequest.startDate}</span>
                     </div>
                     <div>
                       <span className="text-muted-foreground block mb-1">Number of Drivers</span>
                       <span className="font-medium text-primary">{selectedRequest.numberOfDrivers || 1}</span>
                     </div>
                     <div>
                       <span className="text-muted-foreground block mb-1">Contact Number</span>
                       <span className="font-medium">{selectedRequest.contactNumber || 'N/A'}</span>
                     </div>
                     {selectedRequest.requirements && (
                       <div className="col-span-2 mt-2 p-3 bg-slate-50 border rounded text-xs text-slate-700">
                         <strong>Additional Requirements: </strong>
                         {selectedRequest.requirements}
                       </div>
                     )}
                   </div>
                </div>

              </div>
            )}
            <div className="flex justify-end border-t pt-4">
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

      </main>
      <Footer />
    </div>
  );
};

export default OutsourceRequestsTracking;
