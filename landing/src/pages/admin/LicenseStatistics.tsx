import { BarChart3, TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplicationStatistics } from '@/hooks/useLicense';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LicenseStatistics() {
  const { language } = useLanguage();
  const { statistics, isLoading, error } = useApplicationStatistics();

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

  if (error || !statistics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              {language === 'sw'
                ? 'Imeshindwa kupakia takwimu'
                : 'Failed to load statistics'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionRate = statistics.total > 0 
    ? ((statistics.completed / statistics.total) * 100).toFixed(1)
    : '0';

  const approvalRate = statistics.total > 0
    ? (((statistics.approved + statistics.completed) / statistics.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'sw' ? 'Takwimu za Maombi' : 'Application Statistics'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'sw'
            ? 'Angalia takwimu na uchambuzi wa maombi ya leseni'
            : 'View statistics and analytics for license applications'}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'sw' ? 'Jumla ya Maombi' : 'Total Applications'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'sw' ? 'Maombi yote' : 'All applications'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'sw' ? 'Kiwango cha Uidhinishaji' : 'Approval Rate'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {statistics.approved + statistics.completed} {language === 'sw' ? 'imeidhinishwa' : 'approved'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'sw' ? 'Inasubiri' : 'Pending'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'sw' ? 'Inahitaji ukaguzi' : 'Needs review'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'sw' ? 'Imekamilika' : 'Completed'}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.completed}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% {language === 'sw' ? 'ya jumla' : 'of total'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'sw' ? 'Maombi kwa Hali' : 'Applications by Status'}
            </CardTitle>
            <CardDescription>
              {language === 'sw' ? 'Mgawanyo wa hali' : 'Status distribution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-32 text-sm font-medium">
                  {language === 'sw' ? 'Inasubiri' : 'Pending'}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 flex items-center justify-end pr-2"
                      style={{ width: `${(statistics.pending / statistics.total) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{statistics.pending}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-32 text-sm font-medium">
                  {language === 'sw' ? 'Inakaguliwa' : 'Under Review'}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 flex items-center justify-end pr-2"
                      style={{ width: `${(statistics.under_review / statistics.total) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{statistics.under_review}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-32 text-sm font-medium">
                  {language === 'sw' ? 'Imeidhinishwa' : 'Approved'}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 flex items-center justify-end pr-2"
                      style={{ width: `${(statistics.approved / statistics.total) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{statistics.approved}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-32 text-sm font-medium">
                  {language === 'sw' ? 'Imekataliwa' : 'Rejected'}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 flex items-center justify-end pr-2"
                      style={{ width: `${(statistics.rejected / statistics.total) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{statistics.rejected}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-32 text-sm font-medium">
                  {language === 'sw' ? 'Imekamilika' : 'Completed'}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 flex items-center justify-end pr-2"
                      style={{ width: `${(statistics.completed / statistics.total) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{statistics.completed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'sw' ? 'Maombi kwa Aina' : 'Applications by Type'}
            </CardTitle>
            <CardDescription>
              {language === 'sw' ? 'Mgawanyo wa aina' : 'Type distribution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-40 text-sm font-medium">
                  {language === 'sw' ? 'Leseni Mpya' : 'New License'}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary flex items-center justify-end pr-2"
                      style={{ width: `${(statistics.by_type.new_license / statistics.total) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{statistics.by_type.new_license}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-40 text-sm font-medium">
                  {language === 'sw' ? 'Kufanya Upya' : 'Renewal'}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary flex items-center justify-end pr-2"
                      style={{ width: `${(statistics.by_type.renewal / statistics.total) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{statistics.by_type.renewal}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-40 text-sm font-medium">
                  {language === 'sw' ? 'Mtihani wa LATRA' : 'LATRA Exam'}
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary flex items-center justify-end pr-2"
                      style={{ width: `${(statistics.by_type.latra_exam / statistics.total) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{statistics.by_type.latra_exam}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {language === 'sw' ? 'Muhtasari' : 'Summary'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'sw' ? 'Maombi Yanayohitaji Ukaguzi' : 'Applications Needing Review'}
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {statistics.pending + statistics.under_review}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'sw' ? 'Kiwango cha Mafanikio' : 'Success Rate'}
              </p>
              <p className="text-3xl font-bold text-green-600">{approvalRate}%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'sw' ? 'Kiwango cha Ukamilishaji' : 'Completion Rate'}
              </p>
              <p className="text-3xl font-bold text-purple-600">{completionRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
