import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLicenseApplications } from '@/hooks/useLicenseApplications';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { STATUS_COLORS } from '@/types/license';

export default function LicenseApplicationsManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    applications,
    total,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    refresh,
  } = useLicenseApplications();


  const formatDate = (date: any) => {
    if (!date) return '-';
    return new Date(date.seconds * 1000).toLocaleDateString();
  };
  
  const stats = {
    total: total,
    pending: applications.filter(e => e.status === 'pending').length,
    approved: applications.filter(e => e.status === 'approved').length,
    rejected: applications.filter(e => e.status === 'rejected').length,
  };

  if (error && !isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">License Applications Management</h1>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-destructive">
                <p>Error: {error}</p>
                <Button onClick={() => refresh()} className="mt-4">Retry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">License Applications Management</h1>
          <Button onClick={() => refresh()}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center mb-2"><Clock className="h-6 w-6 text-yellow-500" /></div><p className="text-3xl font-bold text-yellow-600">{stats.pending}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center mb-2"><CheckCircle className="h-6 w-6 text-green-500" /></div><p className="text-3xl font-bold text-green-600">{stats.approved}</p><p className="text-sm text-muted-foreground">Approved</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center mb-2"><XCircle className="h-6 w-6 text-red-500" /></div><p className="text-3xl font-bold text-red-600">{stats.rejected}</p><p className="text-sm text-muted-foreground">Rejected</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Applications</CardTitle>
              <div className="flex gap-2">
                <Select onValueChange={setStatusFilter} defaultValue="all">
                  <SelectTrigger className="w-48"><SelectValue placeholder='Status' /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Application Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto my-16" /></TableCell></TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12"><FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No applications found</p></TableCell></TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-mono text-sm">{application.refNo}</TableCell>
                        <TableCell>{application.fullName}</TableCell>
                        <TableCell>{application.applicationType}</TableCell>
                        <TableCell><Badge className={STATUS_COLORS[application.status]}>{application.status}</Badge></TableCell>
                        <TableCell>{formatDate(application.submittedOn)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/license-application/${application.id}`)}><Eye className="h-4 w-4 mr-2" />View</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Showing {applications.length} of {total} applications</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0 || isLoading}>Previous</Button>
                  <span className="text-sm flex items-center">Page {currentPage + 1} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages - 1 || isLoading}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
