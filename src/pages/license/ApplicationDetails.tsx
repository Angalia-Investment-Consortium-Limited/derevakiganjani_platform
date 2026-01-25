import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Calendar, User, Phone, MapPin, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApplicationDetails } from '@/hooks/useLicense';
import { useLanguage } from '@/contexts/LanguageContext';
import { STATUS_TRANSLATIONS, APPLICATION_TYPES, STATUS_COLORS } from '@/types/license';
import type { ApplicationStatus, ApplicationType } from '@/types/license';

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { application, isLoading, error, fetchDetails } = useApplicationDetails();

  useEffect(() => {
    if (id) {
      fetchDetails(id);
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'Under Review':
        return <AlertCircle className="h-6 w-6 text-blue-500" />;
      case 'Approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'Completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            {language === 'sw' ? 'Inapakia...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center mb-4">
              {language === 'sw'
                ? 'Maombi hayajapatikana au kuna tatizo la kupakia.'
                : 'Application not found or error loading details.'}
            </p>
            <div className="text-center">
              <Button onClick={() => navigate('/license/my-applications')}>
                {language === 'sw' ? 'Rudi Nyuma' : 'Go Back'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/license/my-applications')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {language === 'sw' ? 'Rudi Nyuma' : 'Back to Applications'}
      </Button>

      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getStatusIcon(application.status)}
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">
                  {language === 'sw'
                    ? APPLICATION_TYPES[application.application_type as ApplicationType]?.nameSwahili
                    : APPLICATION_TYPES[application.application_type as ApplicationType]?.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {language === 'sw' ? 'Namba ya Rejea' : 'Reference Number'}: 
                  <span className="font-mono font-semibold ml-2">{application.name}</span>
                </CardDescription>
              </div>
            </div>
            <Badge className={STATUS_COLORS[application.status as ApplicationStatus]}>
              {language === 'sw' 
                ? STATUS_TRANSLATIONS[application.status as ApplicationStatus]
                : application.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {language === 'sw' ? 'Taarifa Binafsi' : 'Personal Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Jina Kamili' : 'Full Name'}
                  </p>
                  <p className="font-medium">{application.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {application.phone_number}
                  </p>
                </div>
                {application.email && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'sw' ? 'Barua Pepe' : 'Email'}
                    </p>
                    <p className="font-medium">{application.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Mkoa' : 'Region'}
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {application.region}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Wilaya' : 'District'}
                  </p>
                  <p className="font-medium">{application.district}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* License Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {language === 'sw' ? 'Taarifa za Leseni' : 'License Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Aina ya Leseni' : 'License Category'}
                  </p>
                  <p className="font-medium text-lg">{application.license_category}</p>
                </div>
                {application.latra_type && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'sw' ? 'Aina ya LATRA' : 'LATRA Type'}
                    </p>
                    <Badge variant="outline" className="text-base">
                      {application.latra_type}
                    </Badge>
                  </div>
                )}
                {application.current_license_number && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'sw' ? 'Namba ya Leseni ya Sasa' : 'Current License Number'}
                    </p>
                    <p className="font-medium font-mono">{application.current_license_number}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {language === 'sw' ? 'Nyaraka Zilizowasilishwa' : 'Submitted Documents'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.documents.map((doc: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.document_type}</p>
                          <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                        </div>
                      </div>
                      {doc.file_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            {language === 'sw' ? 'Pakua' : 'Download'}
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviewer Notes */}
          {application.reviewer_notes && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'sw' ? 'Maelezo ya Mkaguzi' : 'Reviewer Notes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{application.reviewer_notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {language === 'sw' ? 'Mchakato' : 'Timeline'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Submitted */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    {['Under Review', 'Approved', 'Rejected', 'Completed'].includes(application.status) && (
                      <div className="w-0.5 h-12 bg-border mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-sm">
                      {language === 'sw' ? 'Imewasilishwa' : 'Submitted'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(application.submission_date)}
                    </p>
                  </div>
                </div>

                {/* Under Review */}
                {['Under Review', 'Approved', 'Rejected', 'Completed'].includes(application.status) && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        application.status === 'Under Review' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {application.status === 'Under Review' ? (
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      {['Approved', 'Rejected', 'Completed'].includes(application.status) && (
                        <div className="w-0.5 h-12 bg-border mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-sm">
                        {language === 'sw' ? 'Inakaguliwa' : 'Under Review'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {application.review_date ? formatDate(application.review_date) : '-'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Approved/Rejected */}
                {['Approved', 'Rejected', 'Completed'].includes(application.status) && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        application.status === 'Rejected' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {application.status === 'Rejected' ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      {application.status === 'Completed' && (
                        <div className="w-0.5 h-12 bg-border mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-sm">
                        {application.status === 'Rejected'
                          ? (language === 'sw' ? 'Imekataliwa' : 'Rejected')
                          : (language === 'sw' ? 'Imeidhinishwa' : 'Approved')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {application.review_date ? formatDate(application.review_date) : '-'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Completed */}
                {application.status === 'Completed' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {language === 'sw' ? 'Imekamilika' : 'Completed'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'sw'
                          ? 'Unaweza kuchukua leseni yako'
                          : 'You can collect your license'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'sw' ? 'Vitendo' : 'Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/license/track')}
              >
                {language === 'sw' ? 'Fuatilia Hali' : 'Track Status'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/license')}
              >
                {language === 'sw' ? 'Omba Leseni Nyingine' : 'Apply for Another License'}
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'sw' ? 'Msaada' : 'Need Help?'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'sw'
                  ? 'Una swali kuhusu maombi yako? Wasiliana nasi.'
                  : 'Have questions about your application? Contact us.'}
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/contact')}>
                {language === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
