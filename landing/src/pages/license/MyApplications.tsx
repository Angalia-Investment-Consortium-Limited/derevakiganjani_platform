import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, Eye, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMyApplications } from '@/hooks/useLicense';
import { useLanguage } from '@/contexts/LanguageContext';
import { STATUS_TRANSLATIONS, APPLICATION_TYPES, STATUS_COLORS } from '@/types/license';
import type { ApplicationStatus, ApplicationType, ApplicationFilter } from '@/types/license';

export default function MyApplications() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ApplicationFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const { applications, isLoading, error } = useMyApplications(filter);

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilter({ ...filter, status: undefined });
    } else {
      setFilter({ ...filter, status: status as ApplicationStatus });
    }
  };

  const handleTypeFilter = (type: string) => {
    if (type === 'all') {
      setFilter({ ...filter, application_type: undefined });
    } else {
      setFilter({ ...filter, application_type: type as ApplicationType });
    }
  };

  const handleSearch = () => {
    setFilter({ ...filter, search: searchTerm });
  };

  const filteredApplications = applications?.filter(app => {
    if (!searchTerm) return true;
    return (
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone_number.includes(searchTerm)
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    return (
      <Badge className={STATUS_COLORS[status]}>
        {language === 'sw' ? STATUS_TRANSLATIONS[status] : status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'sw' ? 'Maombi Yangu' : 'My Applications'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'sw'
            ? 'Angalia na ufuatilie maombi yako yote ya leseni'
            : 'View and track all your license applications'}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {language === 'sw' ? 'Chuja Maombi' : 'Filter Applications'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder={language === 'sw' ? 'Tafuta...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Filter */}
            <Select onValueChange={handleStatusFilter} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder={language === 'sw' ? 'Hali' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'sw' ? 'Hali Zote' : 'All Statuses'}
                </SelectItem>
                <SelectItem value="Pending">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Pending'] : 'Pending'}
                </SelectItem>
                <SelectItem value="Under Review">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Under Review'] : 'Under Review'}
                </SelectItem>
                <SelectItem value="Approved">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Approved'] : 'Approved'}
                </SelectItem>
                <SelectItem value="Rejected">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Rejected'] : 'Rejected'}
                </SelectItem>
                <SelectItem value="Completed">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Completed'] : 'Completed'}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select onValueChange={handleTypeFilter} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder={language === 'sw' ? 'Aina' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'sw' ? 'Aina Zote' : 'All Types'}
                </SelectItem>
                <SelectItem value="New License">
                  {language === 'sw' ? APPLICATION_TYPES['New License'].nameSwahili : 'New License'}
                </SelectItem>
                <SelectItem value="License Renewal">
                  {language === 'sw' ? APPLICATION_TYPES['License Renewal'].nameSwahili : 'License Renewal'}
                </SelectItem>
                <SelectItem value="LATRA Exam">
                  {language === 'sw' ? APPLICATION_TYPES['LATRA Exam'].nameSwahili : 'LATRA Exam'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            {language === 'sw' ? 'Inapakia...' : 'Loading...'}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              {language === 'sw'
                ? 'Kuna tatizo la kupakia maombi. Tafadhali jaribu tena.'
                : 'Error loading applications. Please try again.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!filteredApplications || filteredApplications.length === 0) && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'sw' ? 'Hakuna Maombi' : 'No Applications'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'sw'
                ? 'Hujawasilisha maombi yoyote bado. Anza kwa kuomba leseni mpya.'
                : "You haven't submitted any applications yet. Start by applying for a new license."}
            </p>
            <Button onClick={() => navigate('/license')}>
              {language === 'sw' ? 'Omba Leseni' : 'Apply for License'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {!isLoading && !error && filteredApplications && filteredApplications.length > 0 && (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.name} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">
                            {language === 'sw'
                              ? APPLICATION_TYPES[application.application_type as ApplicationType]?.nameSwahili
                              : APPLICATION_TYPES[application.application_type as ApplicationType]?.name}
                          </h3>
                          {getStatusBadge(application.status as ApplicationStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {language === 'sw' ? 'Rejea' : 'Ref'}: <span className="font-mono font-medium">{application.name}</span>
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(application.submission_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {language === 'sw' ? 'Aina' : 'Category'}: {application.license_category}
                            </span>
                          </div>
                          {application.latra_type && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">LATRA: {application.latra_type}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/license/application/${application.name}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {language === 'sw' ? 'Angalia' : 'View'}
                    </Button>
                  </div>
                </div>

                {/* Additional Info */}
                {application.reviewer_notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-1">
                      {language === 'sw' ? 'Maelezo' : 'Notes'}:
                    </p>
                    <p className="text-sm text-muted-foreground">{application.reviewer_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && !error && applications && applications.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {language === 'sw' ? 'Muhtasari' : 'Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw' ? 'Jumla' : 'Total'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(a => a.status === 'Pending').length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw' ? 'Inasubiri' : 'Pending'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {applications.filter(a => a.status === 'Under Review').length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw' ? 'Inakaguliwa' : 'In Review'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(a => a.status === 'Approved').length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw' ? 'Imeidhinishwa' : 'Approved'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {applications.filter(a => a.status === 'Completed').length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw' ? 'Imekamilika' : 'Completed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
