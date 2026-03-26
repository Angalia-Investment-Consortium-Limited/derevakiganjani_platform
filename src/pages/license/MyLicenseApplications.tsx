
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMyApplications } from '@/hooks/useApplications';
import { STATUS_COLORS } from '@/types/license';
import { Loader2, AlertTriangle, FilePlus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function MyLicenseApplications() {
  const { t } = useLanguage();
  const { applications, isLoading, error } = useMyApplications();

  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStatus, sortBy]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">{t('Loading Applications')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-semibold text-destructive">{t('Error Loading Applications')}</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <FilePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('No Applications Found')}</h3>
          <p className="text-muted-foreground mb-6">{t('Start New Application Prompt')}</p>
          <Button asChild>
            <Link to="/license">{t('Apply for License')}</Link>
          </Button>
        </div>
      );
    }

    // Filter and Sort Custom Logic
    const filteredAndSortedApplications = [...applications]
      .filter((app) => {
        if (filterType !== 'all' && app.applicationType !== filterType) return false;
        if (filterStatus !== 'all' && app.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = a.submittedOn ? (typeof a.submittedOn.toDate === 'function' ? a.submittedOn.toDate().getTime() : new Date(a.submittedOn as any).getTime()) : 0;
        const dateB = b.submittedOn ? (typeof b.submittedOn.toDate === 'function' ? b.submittedOn.toDate().getTime() : new Date(b.submittedOn as any).getTime()) : 0;

        if (sortBy === 'newest') return dateB - dateA;
        if (sortBy === 'oldest') return dateA - dateB;
        return 0;
      });

    const totalPages = Math.ceil(filteredAndSortedApplications.length / itemsPerPage);
    const paginatedApplications = filteredAndSortedApplications.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return (
      <div className="space-y-6">
        {/* Filters and Sorting Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requirements</SelectItem>
              <SelectItem value="New License">New License</SelectItem>
              <SelectItem value="License Renewal">License Renewal</SelectItem>
              <SelectItem value="LATRA Exam">LATRA Exam</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending-payment">Pending Payment</SelectItem>
              <SelectItem value="pending-review">Pending Review</SelectItem>
              <SelectItem value="requires-changes">Requires Changes</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredAndSortedApplications.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-white">
            <p className="text-muted-foreground">{t('No applications match your filters.')}</p>
            <Button variant="link" onClick={() => { setFilterType("all"); setFilterStatus("all"); setSortBy("newest"); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedApplications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <Link to={`/license/application/${app.id}`} className="block">
                  <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <div className="md:col-span-2">
                      <p className="font-semibold text-primary">{app.applicationType}</p>
                      <p className="text-sm text-muted-foreground">{t('ref_no')}: {app.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('Submission Date')}</p>
                      <p className="text-sm text-muted-foreground">{app.submittedOn ? (typeof app.submittedOn.toDate === 'function' ? format(app.submittedOn.toDate(), 'PPP') : format(new Date(app.submittedOn as any), 'PPP')) : 'N/A'}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={`${STATUS_COLORS[app.status] || 'bg-gray-200'}`}>
                        {t(app.status.replace(/-/g, '_'))}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">{t('dashboard')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/license">Leseni</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('My License Applications')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('My License Applications')}</CardTitle>
              <CardDescription>{t('View history and status')}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
