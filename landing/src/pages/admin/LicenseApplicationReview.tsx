import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle,
  Save,
  User,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApplicationDetails, useUpdateApplicationStatus } from '@/hooks/useLicense';
import { useLanguage } from '@/contexts/LanguageContext';
import { STATUS_TRANSLATIONS, APPLICATION_TYPES, STATUS_COLORS } from '@/types/license';
import type { ApplicationStatus, ApplicationType } from '@/types/license';

export default function LicenseApplicationReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const { application, isLoading, error, fetchDetails } = useApplicationDetails();
  const { updateStatus, isUpdating } = useUpdateApplicationStatus();
  
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [reviewerNotes, setReviewerNotes] = useState('');

  useEffect(() => {
    if (id) {
      fetchDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (application) {
      setNewStatus(application.status as ApplicationStatus);
      setReviewerNotes(application.reviewer_notes || '');
    }
  }, [application]);

  const handleUpdateStatus = async () => {
    if (!application || !newStatus) return;

    try {
      await updateStatus(application.name, newStatus, reviewerNotes);
      
      toast({
        title: language === 'sw' ? 'Imefanikiwa' : 'Success',
        description: language === 'sw' 
          ? 'Hali ya maombi imesasishwa'
          : 'Application status updated successfully',
      });

      // Refresh application details
      fetchDetails(application.name);
    } catch (err) {
      toast({
        title: language === 'sw' ? 'Hitilafu' : 'Error',
        description: language === 'sw'
          ? 'Imeshindwa kusasisha hali ya maombi'
          : 'Failed to update application status',
        variant: 'destructive',
      });
    }
  };

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
              <Button onClick={() => navigate('/admin/license-applications')}>
                {language === 'sw' ? 'Rudi Nyuma' : 'Go Back'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/license-applications')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {language === 'sw' ? 'Rudi kwa Orodha' : 'Back to List'}
      </Button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'sw' ? 'Kagua Maombi' : 'Review Application'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'sw' ? 'Rejea' : 'Reference'}: <span className="font-mono font-semibold">{application.name}</span>
            </p>
          </div>
          <Badge className={STATUS_COLORS[application.status as ApplicationStatus]}>
            {language === 'sw' 
              ? STATUS_TRANSLATIONS[application.status as ApplicationStatus]
              : application.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'sw' ? 'Taarifa za Maombi' : 'Application Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {language === 'sw' ? 'Taarifa Binafsi' : 'Personal Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'sw' ? 'Jina Kamili' : 'Full Name'}
                    </p>
                    <p className="font-medium">{application.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'sw' ? 'Simu' : 'Phone'}
                    </p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {application.phone_number}
                    </p>
                  </div>
                  {application.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'sw' ? 'Barua Pepe' : 'Email'}
                      </p>
                      <p className="font-medium">{application.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'sw' ? 'Mkoa' : 'Region'}
                    </p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {application.region}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'sw' ? 'Wilaya' : 'District'}
                    </p>
                    <p className="font-medium">{application.district}</p>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {language === 'sw' ? 'Taarifa za Leseni' : 'License Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'sw' ? 'Aina ya Maombi' : 'Application Type'}
                    </p>
                    <p className="font-medium">
                      {language === 'sw'
                        ? APPLICATION_TYPES[application.application_type as ApplicationType]?.nameSwahili
                        : APPLICATION_TYPES[application.application_type as ApplicationType]?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'sw' ? 'Aina ya Leseni' : 'License Category'}
                    </p>
                    <p className="font-medium text-lg">{application.license_category}</p>
                  </div>
                  {application.latra_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'sw' ? 'Aina ya LATRA' : 'LATRA Type'}
                      </p>
                      <Badge variant="outline">{application.latra_type}</Badge>
                    </div>
                  )}
                  {application.current_license_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'sw' ? 'Namba ya Leseni ya Sasa' : 'Current License Number'}
                      </p>
                      <p className="font-medium font-mono">{application.current_license_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'sw' ? 'Tarehe ya Kuwasilisha' : 'Submission Date'}
                    </p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(application.submission_date)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'sw' ? 'Nyaraka Zilizowasilishwa' : 'Submitted Documents'}
                </CardTitle>
                <CardDescription>
                  {language === 'sw'
                    ? 'Bonyeza kwa kuangalia au kupakua nyaraka'
                    : 'Click to view or download documents'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.documents.map((doc: any, index: number) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{doc.document_type}</p>
                            <p className="text-sm text-muted-foreground truncate">{doc.file_name}</p>
                          </div>
                        </div>
                      </div>
                      {doc.file_url && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              {language === 'sw' ? 'Angalia' : 'View'}
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.file_url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'sw' ? 'Sasisha Hali' : 'Update Status'}
              </CardTitle>
              <CardDescription>
                {language === 'sw'
                  ? 'Badilisha hali ya maombi na ongeza maelezo'
                  : 'Change application status and add notes'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">
                  {language === 'sw' ? 'Hali Mpya' : 'New Status'}
                </Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as ApplicationStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              </div>

              <div>
                <Label htmlFor="notes">
                  {language === 'sw' ? 'Maelezo ya Mkaguzi' : 'Reviewer Notes'}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={language === 'sw' 
                    ? 'Andika maelezo yako hapa...'
                    : 'Enter your notes here...'}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {language === 'sw'
                    ? 'Maelezo haya yataonekana kwa mwombaji'
                    : 'These notes will be visible to the applicant'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || !newStatus || newStatus === application.status}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating 
                    ? (language === 'sw' ? 'Inasasisha...' : 'Updating...') 
                    : (language === 'sw' ? 'Sasisha' : 'Update')}
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium mb-2">
                  {language === 'sw' ? 'Vitendo vya Haraka' : 'Quick Actions'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setNewStatus('Approved');
                    setReviewerNotes('Application approved. All documents verified.');
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  {language === 'sw' ? 'Idhinisha' : 'Approve'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setNewStatus('Rejected');
                    setReviewerNotes('');
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  {language === 'sw' ? 'Kataa' : 'Reject'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Review History */}
          {application.reviewer && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'sw' ? 'Historia ya Ukaguzi' : 'Review History'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'sw' ? 'Mkaguzi' : 'Reviewer'}
                  </p>
                  <p className="font-medium">{application.reviewer}</p>
                </div>
                {application.review_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'sw' ? 'Tarehe ya Ukaguzi' : 'Review Date'}
                    </p>
                    <p className="font-medium">{formatDate(application.review_date)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
