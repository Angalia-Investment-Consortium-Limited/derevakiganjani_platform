import { useState } from 'react';
import { Search, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTrackApplication } from '@/hooks/useLicense';
import { useLanguage } from '@/contexts/LanguageContext';
import { STATUS_TRANSLATIONS, APPLICATION_TYPES } from '@/types/license';
import type { ApplicationStatus, ApplicationType } from '@/types/license';

export default function TrackStatus() {
  const { language } = useLanguage();
  const [refNo, setRefNo] = useState('');
  const { application, isLoading, error, trackApplication } = useTrackApplication();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (refNo.trim()) {
      trackApplication(refNo.trim());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Under Review':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'sw' ? 'Fuatilia Maombi Yako' : 'Track Your Application'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'sw' 
            ? 'Ingiza namba ya rejea ya maombi yako kuona hali yake'
            : 'Enter your application reference number to check its status'}
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {language === 'sw' ? 'Tafuta Maombi' : 'Search Application'}
          </CardTitle>
          <CardDescription>
            {language === 'sw'
              ? 'Namba ya rejea inaonekana kama: LIC-2025-00001'
              : 'Reference number looks like: LIC-2025-00001'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder={language === 'sw' ? 'Ingiza namba ya rejea' : 'Enter reference number'}
              value={refNo}
              onChange={(e) => setRefNo(e.target.value.toUpperCase())}
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !refNo.trim()}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading 
                ? (language === 'sw' ? 'Inatafuta...' : 'Searching...') 
                : (language === 'sw' ? 'Tafuta' : 'Search')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {language === 'sw'
              ? 'Maombi hayajapatikana. Tafadhali hakikisha namba ya rejea ni sahihi.'
              : 'Application not found. Please check the reference number.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Application Details */}
      {application && (
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {language === 'sw' ? 'Hali ya Maombi' : 'Application Status'}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {language === 'sw' ? 'Namba ya Rejea' : 'Reference Number'}: <span className="font-mono font-semibold">{application.name}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(application.status)}
                  <Badge className={getStatusColor(application.status)}>
                    {language === 'sw' 
                      ? STATUS_TRANSLATIONS[application.status as ApplicationStatus] 
                      : application.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Aina ya Maombi' : 'Application Type'}
                  </p>
                  <p className="font-medium">
                    {language === 'sw'
                      ? APPLICATION_TYPES[application.application_type as ApplicationType]?.nameSwahili
                      : APPLICATION_TYPES[application.application_type as ApplicationType]?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Jina Kamili' : 'Full Name'}
                  </p>
                  <p className="font-medium">{application.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Simu' : 'Phone'}
                  </p>
                  <p className="font-medium">{application.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Mkoa' : 'Region'}
                  </p>
                  <p className="font-medium">{application.region}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Wilaya' : 'District'}
                  </p>
                  <p className="font-medium">{application.district}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Aina ya Leseni' : 'License Category'}
                  </p>
                  <p className="font-medium">{application.license_category}</p>
                </div>
                {application.latra_type && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'sw' ? 'Aina ya LATRA' : 'LATRA Type'}
                    </p>
                    <p className="font-medium">{application.latra_type}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'sw' ? 'Tarehe ya Kuwasilisha' : 'Submission Date'}
                  </p>
                  <p className="font-medium">{formatDate(application.submission_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'sw' ? 'Mchakato wa Maombi' : 'Application Timeline'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Submitted */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {language === 'sw' ? 'Imewasilishwa' : 'Submitted'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(application.submission_date)}
                    </p>
                  </div>
                </div>

                {/* Under Review */}
                {['Under Review', 'Approved', 'Rejected', 'Completed'].includes(application.status) && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        application.status === 'Under Review' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {application.status === 'Under Review' ? (
                          <AlertCircle className="h-5 w-5 text-blue-600" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {language === 'sw' ? 'Inakaguliwa' : 'Under Review'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.review_date ? formatDate(application.review_date) : '-'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Approved/Rejected */}
                {['Approved', 'Rejected', 'Completed'].includes(application.status) && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        application.status === 'Rejected' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {application.status === 'Rejected' ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {application.status === 'Rejected'
                          ? (language === 'sw' ? 'Imekataliwa' : 'Rejected')
                          : (language === 'sw' ? 'Imeidhinishwa' : 'Approved')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.review_date ? formatDate(application.review_date) : '-'}
                      </p>
                      {application.reviewer_notes && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">
                            {language === 'sw' ? 'Maelezo' : 'Notes'}:
                          </p>
                          <p className="text-sm">{application.reviewer_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Completed */}
                {application.status === 'Completed' && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {language === 'sw' ? 'Imekamilika' : 'Completed'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'sw'
                          ? 'Maombi yako yamekamilika. Unaweza kuchukua leseni yako.'
                          : 'Your application is complete. You can collect your license.'}
                      </p>
                    </div>
                  </div>
                )}
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
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.document_type}</p>
                          <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                        </div>
                      </div>
                      {doc.file_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            {language === 'sw' ? 'Angalia' : 'View'}
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'sw' ? 'Hatua Zinazofuata' : 'Next Steps'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {application.status === 'Pending' && (
                  <p className="text-sm">
                    {language === 'sw'
                      ? 'Maombi yako yanasubiri kukaguliwa. Tutakujulisha mara tu tutakapoanza kukagua.'
                      : 'Your application is pending review. We will notify you once we start processing it.'}
                  </p>
                )}
                {application.status === 'Under Review' && (
                  <p className="text-sm">
                    {language === 'sw'
                      ? 'Maombi yako yanakaguliwa. Tafadhali subiri kwa muda mfupi.'
                      : 'Your application is under review. Please wait for our response.'}
                  </p>
                )}
                {application.status === 'Approved' && (
                  <p className="text-sm">
                    {language === 'sw'
                      ? 'Hongera! Maombi yako yameidhinishwa. Tutakujulisha hatua za kuchukua leseni yako.'
                      : 'Congratulations! Your application has been approved. We will notify you about the next steps to collect your license.'}
                  </p>
                )}
                {application.status === 'Rejected' && (
                  <p className="text-sm">
                    {language === 'sw'
                      ? 'Samahani, maombi yako yamekataliwa. Tafadhali angalia maelezo hapo juu na jaribu tena.'
                      : 'Sorry, your application has been rejected. Please check the notes above and try again.'}
                  </p>
                )}
                {application.status === 'Completed' && (
                  <p className="text-sm">
                    {language === 'sw'
                      ? 'Maombi yako yamekamilika. Unaweza kuchukua leseni yako katika ofisi yetu.'
                      : 'Your application is complete. You can collect your license at our office.'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help Section */}
      {!application && !error && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'sw' ? 'Msaada' : 'Help'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">
                  {language === 'sw' ? 'Je, sijapata namba ya rejea?' : "Don't have a reference number?"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw'
                    ? 'Namba ya rejea inatumwa kwa barua pepe na SMS baada ya kuwasilisha maombi. Angalia barua pepe yako au ujumbe wako.'
                    : 'The reference number is sent via email and SMS after submitting your application. Check your email or messages.'}
                </p>
              </div>
              <div>
                <p className="font-medium mb-2">
                  {language === 'sw' ? 'Namba ya rejea inaonekana vipi?' : 'What does a reference number look like?'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw'
                    ? 'Namba ya rejea inaanza na "LIC-" ikifuatiwa na mwaka na namba ya kipekee. Mfano: LIC-2025-00001'
                    : 'Reference numbers start with "LIC-" followed by the year and a unique number. Example: LIC-2025-00001'}
                </p>
              </div>
              <div>
                <p className="font-medium mb-2">
                  {language === 'sw' ? 'Je, nina swali?' : 'Have a question?'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'sw'
                    ? 'Wasiliana nasi kupitia simu au barua pepe kwa msaada zaidi.'
                    : 'Contact us via phone or email for more assistance.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
