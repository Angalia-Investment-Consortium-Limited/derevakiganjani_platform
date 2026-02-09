import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  FileText
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Loader } from '@/components/ui/loader'; // Using alias, assuming it works now

// Hook
import { useEmployerVerificationManagement } from '@/hooks/useEmployerVerification';

// Constants
const ITEMS_PER_PAGE = 10;
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  verified: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function EmployerVerificationManagement() {
  const navigate = useNavigate();
  const { employers: allEmployers, isLoading, error, refresh } = useEmployerVerificationManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);

  const filteredEmployers = useMemo(() => {
    return allEmployers
      .filter(emp => 
        statusFilter === 'all' || emp.verificationStatus === statusFilter
      )
      .filter(emp => 
        emp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [allEmployers, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredEmployers.length / ITEMS_PER_PAGE);
  const paginatedEmployers = filteredEmployers.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const formatDate = (date: any) => {
    if (!date) return '-';
    const jsDate = date.toDate ? date.toDate() : new Date(date.seconds * 1000);
    return jsDate.toLocaleDateString('en-US', { dateStyle: 'medium' });
  };

  const stats = useMemo(() => ({
    total: allEmployers.length,
    pending: allEmployers.filter(e => e.verificationStatus === 'pending').length,
    verified: allEmployers.filter(e => e.verificationStatus === 'verified').length,
    rejected: allEmployers.filter(e => e.verificationStatus === 'rejected').length,
  }), [allEmployers]);

  const handleRefresh = () => {
    setCurrentPage(0);
    setSearchTerm('');
    setStatusFilter('all');
    refresh();
  }

  if (error && !isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Employer Verification</h1>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-destructive">
                <p>{error}</p>
                <Button onClick={handleRefresh} className="mt-4">Retry</Button>
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
          <h1 className="text-3xl font-bold">Employer Verification</h1>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total" value={stats.total} icon={<Users />} isLoading={isLoading} />
          <StatCard title="Pending" value={stats.pending} icon={<Clock />} color="text-yellow-600" isLoading={isLoading} />
          <StatCard title="Verified" value={stats.verified} icon={<CheckCircle />} color="text-green-600" isLoading={isLoading} />
          <StatCard title="Rejected" value={stats.rejected} icon={<XCircle />} color="text-red-600" isLoading={isLoading} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <CardTitle>Verification Requests</CardTitle>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder='Search by company or email...'
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0">
                      Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                      <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="verified">Verified</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="rejected">Rejected</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader>Loading employer requests...</Loader></TableCell></TableRow>
                  ) : paginatedEmployers.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12"><FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No verification requests found</p></TableCell></TableRow>
                  ) : (
                    paginatedEmployers.map((employer) => (
                      <TableRow key={employer.id}>
                        <TableCell className="font-medium">{employer.companyName}</TableCell>
                        <TableCell>{employer.contactPerson}</TableCell>
                        <TableCell><Badge className={`${STATUS_COLORS[employer.verificationStatus]} hover:${STATUS_COLORS[employer.verificationStatus]}`}>{employer.verificationStatus}</Badge></TableCell>
                        <TableCell>{formatDate(employer.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/employer-review/${employer.id}`)}><Eye className="h-4 w-4 mr-2" />Review</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Showing {paginatedEmployers.length} of {filteredEmployers.length} requests</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0 || isLoading}>Previous</Button>
                  <span className="text-sm flex items-center">Page {currentPage + 1} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1 || isLoading}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

// Helper component for stat cards
const StatCard = ({ title, value, icon, color, isLoading }: { title: string, value: number, icon: React.ReactNode, color?: string, isLoading: boolean }) => (
    <Card>
        <CardContent className="pt-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{title}</p>
                <div className={color}>{icon}</div>
            </div>
            {isLoading ? <Loader className="h-6 w-6 mt-1" /> : <p className={`text-3xl font-bold ${color}`}>{value}</p>}
        </CardContent>
    </Card>
);
