import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
} from 'lucide-react';
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
import { useLicenseApplicationsManagement } from '@/hooks/useLicenseApplications';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { STATUS_COLORS } from '@/types/license';
import { Loader } from '../../components/ui/loader';

const ITEMS_PER_PAGE = 10;
const LICENSE_CATEGORIES = ['A', 'A2', 'B', 'C', 'C1', 'C2', 'C3', 'D', 'E'];

export default function LicenseApplicationsManagement() {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);

  const { 
    applications: allApplications, 
    isLoading, 
    error, 
    refresh 
  } = useLicenseApplicationsManagement({
    status: statusFilter,
    type: typeFilter,
    category: categoryFilter,
  });

  const searchedApplications = useMemo(() => {
    if (!searchTerm) return allApplications;
    return allApplications.filter(app => 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allApplications, searchTerm]);

  const totalPages = Math.ceil(searchedApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = searchedApplications.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const formatDate = (date: any) => {
    if (!date) return '-';
    const jsDate = date.toDate ? date.toDate() : new Date(date.seconds * 1000);
    return jsDate.toLocaleDateString();
  };

  const stats = useMemo(() => ({
    total: allApplications.length,
    pending: allApplications.filter(e => e.status === 'Pending').length,
    approved: allApplications.filter(e => e.status === 'Approved').length,
    rejected: allApplications.filter(e => e.status === 'Rejected').length,
  }), [allApplications]);

  const handleRefresh = () => {
    setCurrentPage(0);
    setSearchTerm('');
    // Resetting filters will trigger a re-fetch via the hook's useEffect
    setStatusFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    // We can also call refresh if we want to force it without changing filters
    refresh();
  }

  if (error && !isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">License Applications Management</h1>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-destructive">
                <p>Error: {error}</p>
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
          <h1 className="text-3xl font-bold">License Applications</h1>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
           {/* Stats Cards */}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <CardTitle>All Applications</CardTitle>
              <div className="flex gap-2 w-full md:w-auto flex-wrap">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder='Search by name or ID...'
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0">Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}<ChevronDown className="h-4 w-4 ml-2" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                      <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="approved">Approved</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="rejected">Rejected</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="flex-shrink-0">Type: {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}<ChevronDown className="h-4 w-4 ml-2" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                      <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="New">New</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Renewal">Renewal</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0">Category: {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}<ChevronDown className="h-4 w-4 ml-2" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
                      <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                      {LICENSE_CATEGORIES.map(cat => <DropdownMenuRadioItem key={cat} value={cat}>{cat}</DropdownMenuRadioItem>)}
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
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center"><Loader>Loading applications...</Loader></TableCell></TableRow>
                  ) : paginatedApplications.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12"><FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No applications found</p></TableCell></TableRow>
                  ) : (
                    paginatedApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{application.fullName}</TableCell>
                        <TableCell>{application.categories ? application.categories.join(', ') : 'N/A'}</TableCell>
                        <TableCell>{application.applicationType}</TableCell>
                        <TableCell><Badge className={`${STATUS_COLORS[application.status]} hover:${STATUS_COLORS[application.status]}`}>{application.status}</Badge></TableCell>
                        <TableCell>{formatDate(application.submittedOn)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/license-application/${application.id}`)}><Eye className="h-4 w-4 mr-2" />Review</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Showing {paginatedApplications.length} of {searchedApplications.length} applications</p>
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
