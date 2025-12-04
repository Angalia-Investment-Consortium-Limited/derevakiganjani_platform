import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Eye, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  driverName: string;
  serviceType: 'JiTesti' | 'Elimika' | 'Leseni' | 'Job Post';
  paymentMethod: 'M-Pesa' | 'Airtel Money' | 'Bank Transfer';
  referenceNumber: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  datePaid: string;
  amount: string;
  proofUrl?: string;
}

const PaymentsManagement = () => {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const [adminNote, setAdminNote] = useState('');
  const [filters, setFilters] = useState({
    paymentMethod: 'all',
    status: 'all',
    serviceType: 'all',
  });

  // Mock data
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'PAY-001',
      driverName: 'John Mwangi',
      serviceType: 'JiTesti',
      paymentMethod: 'M-Pesa',
      referenceNumber: 'MPE234567890',
      status: 'Pending',
      datePaid: '2024-01-15',
      amount: 'KSh 500',
    },
    {
      id: 'PAY-002',
      driverName: 'Grace Njeri',
      serviceType: 'Elimika',
      paymentMethod: 'Airtel Money',
      referenceNumber: 'ART123456789',
      status: 'Verified',
      datePaid: '2024-01-14',
      amount: 'KSh 1,200',
    },
    {
      id: 'PAY-003',
      driverName: 'Peter Ochieng',
      serviceType: 'Leseni',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'BNK987654321',
      status: 'Rejected',
      datePaid: '2024-01-13',
      amount: 'KSh 3,000',
    },
  ]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  const handleActionClick = (type: 'verify' | 'reject') => {
    setActionType(type);
    setIsDetailOpen(false);
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedPayment) return;

    const newStatus = actionType === 'verify' ? 'Verified' : 'Rejected';
    
    setPayments(payments.map(p => 
      p.id === selectedPayment.id ? { ...p, status: newStatus } : p
    ));

    toast({
      title: `Payment ${newStatus}`,
      description: `Payment ${selectedPayment.referenceNumber} has been ${newStatus.toLowerCase()}.`,
    });

    setIsActionModalOpen(false);
    setAdminNote('');
    setSelectedPayment(null);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: 'Export Started',
      description: `Exporting payments as ${format.toUpperCase()}...`,
    });
  };

  const getStatusBadge = (status: Payment['status']) => {
    const variants: Record<Payment['status'], 'default' | 'secondary' | 'destructive'> = {
      'Pending': 'secondary',
      'Verified': 'default',
      'Rejected': 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const filteredPayments = payments.filter(payment => {
    if (filters.paymentMethod !== 'all' && payment.paymentMethod !== filters.paymentMethod) return false;
    if (filters.status !== 'all' && payment.status !== filters.status) return false;
    if (filters.serviceType !== 'all' && payment.serviceType !== filters.serviceType) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Payments & Finance</h1>
              <p className="text-muted-foreground">Manage and verify payment transactions</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleExport('csv')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={() => handleExport('pdf')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={filters.paymentMethod} onValueChange={(v) => setFilters({...filters, paymentMethod: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                      <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Verified">Verified</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select value={filters.serviceType} onValueChange={(v) => setFilters({...filters, serviceType: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="JiTesti">JiTesti</SelectItem>
                      <SelectItem value="Elimika">Elimika</SelectItem>
                      <SelectItem value="Leseni">Leseni</SelectItem>
                      <SelectItem value="Job Post">Job Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Input type="date" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver Name</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Reference Number</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No payments found matching your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.driverName}</TableCell>
                          <TableCell>{payment.serviceType}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell className="font-mono text-sm">{payment.referenceNumber}</TableCell>
                          <TableCell>{payment.amount}</TableCell>
                          <TableCell>{payment.datePaid}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(payment)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
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

          {/* Payment Detail Dialog */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Review payment information and proof
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Driver Name</Label>
                  <p className="text-sm font-medium">{selectedPayment.driverName}</p>
                </div>
                <div>
                  <Label>Service Type</Label>
                  <p className="text-sm font-medium">{selectedPayment.serviceType}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="text-sm font-medium">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <Label>Reference Number</Label>
                  <p className="text-sm font-mono">{selectedPayment.referenceNumber}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-sm font-medium">{selectedPayment.amount}</p>
                </div>
                <div>
                  <Label>Date Paid</Label>
                  <p className="text-sm">{selectedPayment.datePaid}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedPayment.status)}</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-muted/30">
                <Label className="mb-2 block">Payment Proof</Label>
                <div className="bg-muted h-48 rounded flex items-center justify-center text-muted-foreground">
                  [Receipt/Screenshot Preview]
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedPayment?.status === 'Pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleActionClick('reject')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={() => handleActionClick('verify')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Payment
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'verify' ? 'Verify Payment' : 'Reject Payment'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'verify' 
                ? 'Confirm that this payment has been verified.'
                : 'Please provide a reason for rejecting this payment.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Admin Notes {actionType === 'reject' && '(Required)'}</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add any notes or reasons..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
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
