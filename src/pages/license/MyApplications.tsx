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
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { STATUS_TRANSLATIONS, APPLICATION_TYPES, STATUS_COLORS } from '@/types/license';
import type { ApplicationStatus, ApplicationType, LicenseApplication } from '@/types/license';
import { useMyApplications } from '@/hooks/useLicense';
import useDebounce from '@/hooks/useDebounce';

export default function MyApplications() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Use the new hook
  const { applications, isLoading, error, refetch } = useMyApplications({
    status: statusFilter,
    application_type: typeFilter,
    search: debouncedSearch,
  });

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === 'all' ? '' : status);
    // In a real scenario, you'd refetch here
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type === 'all' ? '' : type);
    // In a real scenario, you'd refetch here
  };

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

      {/* Filters (UI remains the same) */}
      <Card className="mb-6">
        {/* ... filter UI ... */}
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
              Error loading applications. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!applications || applications.length === 0) && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications</h3>
            <p className="text-muted-foreground mb-6">
              You haven't submitted any applications yet.
            </p>
            <Button onClick={() => navigate('/license')}>Apply for License</Button>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {!isLoading && !error && applications && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.name} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                      {/* ... application details ... */}
                  </div>

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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
