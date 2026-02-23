import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Eye, CheckCircle, XCircle, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { collection, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

interface Payment {
  id: string;
  userId: string;
  service: string;
  provider: string;
  phone: string;
  selcomTransactionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
  amount: number;
  adminNote?: string;
  // Temporary, until we have user names
  userName?: string; 
}

const PaymentsManagement = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const [adminNote, setAdminNote] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    service: 'all',
    query: '',
  });

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'payments'), (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // TODO: Fetch user name based on userId
        userName: `User ${doc.data().userId.substring(0, 5)}...`
      } as Payment));
      setPayments(paymentsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const handleActionClick = (type: 'verify' | 'reject') => {
    setActionType(type);
    setIsDetailOpen(false); // Close detail view first
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedPayment) return;

    const newStatus = actionType === 'verify' ? 'completed' : 'failed';
    const paymentRef = doc(db, 'payments', selectedPayment.id);

    try {
      await updateDoc(paymentRef, {
        status: newStatus,
        adminNote: adminNote,
      });

      // Optionally update the corresponding test_attempt status if it's a JiTesti payment
      // This logic can be expanded.
      
      toast({
        title: `Payment ${newStatus}`,
        description: `Payment ID ${selectedPayment.selcomTransactionId} has been ${newStatus}.`,
      });

    } catch (error) {
        console.error("Error updating payment status:", error);
        toast({
            title: "Error",
            description: "Failed to update payment status.",
            variant: "destructive",
        });
    }

    setIsActionModalOpen(false);
    setAdminNote('');
    setSelectedPayment(null);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: 'Export Started',
      description: `Exporting payments as ${format.toUpperCase()}...`,
    });
    // Placeholder for actual export logic
  };

  const getStatusBadge = (status: Payment['status']) => {
    const variants: Record<Payment['status'], BadgeProps['variant']> = {
      'pending': 'secondary',
      'completed': 'default',
      'failed': 'destructive',
    };
    return <Badge variant={variants[status]} className="capitalize">{status}</Badge>;
  };

  const filteredPayments = payments.filter(payment => {
    if (filters.status !== 'all' && payment.status !== filters.status) return false;
    if (filters.service !== 'all' && payment.service !== filters.service) return false;
    if (filters.query && !JSON.stringify(payment).toLowerCase().includes(filters.query.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Payments Management</h1>
              <p className="text-muted-foreground">Review and manage Selcom transactions</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleExport('csv')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search by User, Phone, or Transaction ID..."
                  value={filters.query}
                  onChange={(e) => setFilters({...filters, query: e.target.value})}
                />
                <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.service} onValueChange={(v) => setFilters({...filters, service: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="JiTesti">JiTesti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                          <p className="mt-2 text-muted-foreground">Loading transactions...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          No transactions found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.userName}</TableCell>
                          <TableCell>{payment.service}</TableCell>
                          <TableCell>TZS {payment.amount?.toLocaleString()}</TableCell>
                          <TableCell className="font-mono">{payment.phone}</TableCell>
                          <TableCell className="font-mono text-sm">{payment.selcomTransactionId}</TableCell>
                          <TableCell>{payment.createdAt ? format(payment.createdAt.toDate(), 'PP pp') : 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(payment)}
                            >
                              <Eye className="h-4 w-4" />
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

          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogDescription>Review transaction from {selectedPayment?.provider}</DialogDescription>
              </DialogHeader>
              {selectedPayment && (
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">User</Label>
                      <p className="font-medium">{selectedPayment.userName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Service</Label>
                      <p className="font-medium">{selectedPayment.service}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Amount</Label>
                      <p className="font-bold text-lg">TZS {selectedPayment.amount?.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Status</Label>
                      <div>{getStatusBadge(selectedPayment.status)}</div>
                    </div>
                     <div className="space-y-1">
                      <Label className="text-muted-foreground">Phone Number</Label>
                      <p className="font-mono">{selectedPayment.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Date</Label>
                      <p>{selectedPayment.createdAt ? format(selectedPayment.createdAt.toDate(), 'PPpp') : 'N/A'}</p>
                    </div>
                  </div>
                   <div className="space-y-1 border-t pt-4">
                      <Label className="text-muted-foreground">Selcom Transaction ID</Label>
                      <p className="font-mono text-sm">{selectedPayment.selcomTransactionId}</p>
                    </div>
                    {selectedPayment.adminNote && (
                         <div className="space-y-1 border-t pt-4">
                         <Label className="text-muted-foreground">Admin Notes</Label>
                         <p className="text-sm p-3 bg-muted rounded-md">{selectedPayment.adminNote}</p>
                       </div>
                    )}
                </div>
              )}
              <DialogFooter className="gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                {selectedPayment?.status === 'pending' && (
                  <>
                    <Button variant="destructive" onClick={() => handleActionClick('reject')}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button variant="default" onClick={() => handleActionClick('verify')}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{actionType === 'verify' ? 'Verify Payment' : 'Reject Payment'}</DialogTitle>
                <DialogDescription>
                  {actionType === 'verify'
                    ? `Confirm that TZS ${selectedPayment?.amount.toLocaleString()} has been received.`
                    : 'Please provide a reason for rejecting this payment.'}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="adminNote">Admin Notes {actionType === 'reject' && '(Required)'}</Label>
                <Textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g., Amount mismatch, transaction not found..."
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
                <Button
                  variant={actionType === 'reject' ? 'destructive' : 'default'}
                  onClick={handleConfirmAction}
                  disabled={actionType === 'reject' && !adminNote.trim()}
                >
                  Confirm {actionType === 'verify' ? 'Verification' : 'Rejection'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    </AdminLayout>
  );
};

export default PaymentsManagement;