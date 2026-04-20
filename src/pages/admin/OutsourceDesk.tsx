import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit, Loader2, CheckCircle2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const OutsourceDesk = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal form states
  const [updateStatus, setUpdateStatus] = useState('');
  const [assignTracker, setAssignTracker] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'outsource_contracts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContracts(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching outsource contracts:", error);
      toast({ title: 'Error', description: 'Failed to load outsource requests.', variant: 'destructive' });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleOpenUpdate = (contract: any) => {
    setSelectedContract(contract);
    setUpdateStatus(contract.status || 'Request Submitted');
    setAssignTracker(contract.assignedDriverId || (contract.recommendedDriverIds ? contract.recommendedDriverIds.join(', ') : ''));
    setAdminFeedback(contract.adminFeedback || '');
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedContract) return;
    setUpdatingId(selectedContract.id);
    try {
      const contractRef = doc(db, 'outsource_contracts', selectedContract.id);
      await updateDoc(contractRef, {
        status: updateStatus,
        assignedDriverId: assignTracker || null,
        recommendedDriverIds: assignTracker ? assignTracker.split(',').map(id => id.trim()).filter(id => id) : [],
        adminFeedback: adminFeedback,
        updatedAt: new Date()
      });
      
      toast({ title: 'Success', description: 'Contract updated successfully.' });
      setIsUpdateModalOpen(false);
      setSelectedContract(null);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Update Failed', description: e.message || 'Failed to update contract.', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
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
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Outsource Desk</h1>
          <p className="text-muted-foreground">Manage corporate driver outsourcing requests and deployments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Requests ({contracts.length})</CardTitle>
          <CardDescription>Review and assign drivers to pending outsource contracts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role Requirement</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                     <TableCell colSpan={7} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                     </TableCell>
                  </TableRow>
                ) : contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No outsource requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.companyName}</TableCell>
                      <TableCell>
                        <div className="font-semibold">{contract.driverLevel}</div>
                        <div className="text-xs text-muted-foreground">{contract.vehicleType} • {contract.numberOfDrivers || 1} Driver{contract.numberOfDrivers > 1 ? 's' : ''}</div>
                      </TableCell>
                      <TableCell>{contract.contractDuration}</TableCell>
                      <TableCell>{contract.district ? `${contract.district}, ${contract.region}` : contract.region}</TableCell>
                      <TableCell>
                         <Badge variant="outline" className={getStatusBadge(contract.status)}>
                            {contract.status}
                         </Badge>
                      </TableCell>
                      <TableCell>
                         {contract.createdAt ? new Date(contract.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleOpenUpdate(contract)}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Action
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

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Contract Status</DialogTitle>
            <DialogDescription>
              Modify the deployment details for {selectedContract?.companyName}'s request.
            </DialogDescription>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2 border-b pb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Requirements Summary</span>
                  <span className="text-sm border px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    {selectedContract.numberOfDrivers || 1} Drivers Required
                  </span>
                </div>
                <span className="text-sm border p-3 rounded bg-muted/30">
                  {selectedContract.requirements || "No specialized requirements listed."}
                </span>
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>Contact: <strong>{selectedContract.contactNumber || 'N/A'}</strong></span>
                  <span>Expected Start: <strong>{selectedContract.startDate}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusUpdate">Lifecycle Status</Label>
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger id="statusUpdate">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Request Submitted">1. Request Submitted (Pending Review)</SelectItem>
                    <SelectItem value="Matching Drivers">2. Matching Drivers (Actively Sourcing)</SelectItem>
                    <SelectItem value="Active">3. Active (Driver Deployed & Billing Start)</SelectItem>
                    <SelectItem value="Completed">4. Completed (Contract Ended Successfully)</SelectItem>
                    <SelectItem value="Terminated">X. Terminated (Contract Failed/Cancelled)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignTracker">Assigned Driver IDs (Comma-separated)</Label>
                <Input 
                   id="assignTracker" 
                   placeholder="Enter driver IDs e.g. driver1, driver2" 
                   value={assignTracker}
                   onChange={(e) => setAssignTracker(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Keep track of which exact platform UI drivers are assigned/recommended to this contract.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminFeedback">Feedback for Employer</Label>
                <Textarea 
                   id="adminFeedback" 
                   placeholder="Enter any notes or feedback for the employer to see..." 
                   value={adminFeedback}
                   onChange={(e) => setAdminFeedback(e.target.value)}
                   className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">The employer will see this feedback in their tracking dashboard.</p>
              </div>

              <div className="flex justify-end pt-4 gap-2 border-t">
                <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateSubmit} disabled={updatingId === selectedContract.id}>
                  {updatingId === selectedContract.id ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : 'Save Updates'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default OutsourceDesk;
