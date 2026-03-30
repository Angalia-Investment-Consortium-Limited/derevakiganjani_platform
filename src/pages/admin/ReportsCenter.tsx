import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, DollarSign, Award, GraduationCap, FileCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { useAdminReports } from '@/hooks/useAdminReports';
import { exportToCSV, exportToPDF } from '@/utils/exportUtils';

const ReportsCenter = () => {
  const { toast } = useToast();
  // Get start of current month and today for default dates
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [dateFrom, setDateFrom] = useState(startOfMonth.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0]);
  const [region, setRegion] = useState('all');

  // Triggering a refetch when necessary handles state. In `useAdminReports` we bound it directly to variables.
  const { data, isLoading, error, refetch } = useAdminReports(dateFrom, dateTo, region);

  const handleApplyFilters = () => {
    refetch();
  };

  const handleExport = async (reportType: string, format: 'csv' | 'pdf', tableData: any[], elementId?: string) => {
    toast({
      title: 'Export Started',
      description: `Exporting ${reportType} as ${format.toUpperCase()}...`,
    });

    try {
      if (format === 'csv') {
        exportToCSV(tableData, `${reportType.replace(/\\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`);
      } else if (format === 'pdf' && elementId) {
        await exportToPDF(elementId, `${reportType.replace(/\\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`);
      }
      toast({
        title: 'Export Successful',
        description: `Your ${format.toUpperCase()} file has been downloaded.`,
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: e.message || 'An error occurred while exporting',
      });
    }
  };

  const ReportCard = ({ 
    icon: Icon, 
    title, 
    value, 
    description, 
    color 
  }: { 
    icon: any; 
    title: string; 
    value: string | number; 
    description?: string; 
    color: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : value}
            </p>
            {description && !isLoading && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className={`p-3 rounded-full bg-primary/10 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <AdminBreadcrumbs />
      <div className="space-y-6 mt-4">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Reports & Export Center</h1>
            <p className="text-muted-foreground">Generate comprehensive reports and analytics</p>
          </div>

          {/* Date Range Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Regions"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="Dar es Salaam">Dar es Salaam</SelectItem>
                      <SelectItem value="Mwanza">Mwanza</SelectItem>
                      <SelectItem value="Arusha">Arusha</SelectItem>
                      <SelectItem value="Dodoma">Dodoma</SelectItem>
                      <SelectItem value="Mbeya">Mbeya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleApplyFilters} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-500 bg-red-50">
              <CardContent className="pt-6 text-red-700">
                Failed to load reports. Please try again.
              </CardContent>
            </Card>
          )}

          {/* Tabs for Different Report Categories */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="licenses">Licenses</TabsTrigger>
              <TabsTrigger value="tests">JiTesti</TabsTrigger>
              <TabsTrigger value="recruitment">Jobs</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportCard
                  icon={FileCheck}
                  title="Total License Requests"
                  value={data?.licenses.total || 0}
                  color="text-blue-500"
                />
                <ReportCard
                  icon={GraduationCap}
                  title="Tests Taken"
                  value={data?.jitesti.totalAttempts || 0}
                  color="text-purple-500"
                />
                <ReportCard
                  icon={Award}
                  title="Active Jobs"
                  value={data?.jobs.activePosts || 0}
                  color="text-green-500"
                />
                <ReportCard
                  icon={DollarSign}
                  title="Total Revenue"
                  value={`TZS ${data?.finance.totalRevenue.toLocaleString() || 0}`}
                  color="text-yellow-500"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Active Drivers</span>
                        <span className="font-bold">{data?.overview.totalActiveDrivers || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pending License Approvals</span>
                        <span className="font-bold">{data?.overview.pendingApprovals || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active Job Posts</span>
                        <span className="font-bold">{data?.overview.totalActivePosts || 0}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* License Reports Tab */}
            <TabsContent value="licenses" className="space-y-4" id="licenses-report-section">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport('License Reports', 'csv', Object.values(data?.licenses.byCategory || {}))} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('License Reports', 'pdf', [], 'licenses-report-section')} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>License Request Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>New Applications</TableHead>
                          <TableHead>Renewals</TableHead>
                          <TableHead>Approved</TableHead>
                          <TableHead>Rejected</TableHead>
                          <TableHead>Pending</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.values(data?.licenses.byCategory || {}).map((cat: any) => (
                          <TableRow key={cat.category}>
                            <TableCell className="font-medium">Class {cat.category}</TableCell>
                            <TableCell>{cat.new}</TableCell>
                            <TableCell>{cat.renewals}</TableCell>
                            <TableCell className="text-green-600">{cat.approved}</TableCell>
                            <TableCell className="text-red-500">{cat.rejected}</TableCell>
                            <TableCell className="text-yellow-600">{cat.pending}</TableCell>
                          </TableRow>
                        ))}
                        {Object.keys(data?.licenses.byCategory || {}).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">No data found for this period.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* JiTesti Reports Tab */}
            <TabsContent value="tests" className="space-y-4" id="tests-report-section">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport('JiTesti Reports', 'csv', Object.values(data?.jitesti.byCategory || {}))} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('JiTesti Reports', 'pdf', [], 'tests-report-section')} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Total Attempts</p>
                      <p className="text-4xl font-bold">
                        {isLoading ? <Loader2 className="h-8 w-8 mx-auto animate-spin" /> : data?.jitesti.totalAttempts || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Pass Rate</p>
                      <p className="text-4xl font-bold text-green-600">
                        {isLoading ? <Loader2 className="h-8 w-8 mx-auto animate-spin" /> : `${data?.jitesti.passRate.toFixed(1) || 0}%`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-4xl font-bold">
                        {isLoading ? <Loader2 className="h-8 w-8 mx-auto animate-spin" /> : `${data?.jitesti.avgScore.toFixed(1) || 0}%`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Test Performance by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Attempts</TableHead>
                          <TableHead>Pass Rate</TableHead>
                          <TableHead>Avg. Score</TableHead>
                          <TableHead>Avg. Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.values(data?.jitesti.byCategory || {}).map((cat: any) => (
                           <TableRow key={cat.id}>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell>{cat.attempts}</TableCell>
                            <TableCell>{cat.passRate.toFixed(1)}%</TableCell>
                            <TableCell>{cat.avgScore.toFixed(1)}%</TableCell>
                            <TableCell>{Math.round(cat.avgTimeMinutes)} min</TableCell>
                          </TableRow>
                        ))}
                        {Object.keys(data?.jitesti.byCategory || {}).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">No data found for this period.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recruitment Reports Tab */}
            <TabsContent value="recruitment" className="space-y-4" id="recruitment-report-section">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport('Recruitment Reports', 'csv', [data?.jobs || {}])} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('Recruitment Reports', 'pdf', [], 'recruitment-report-section')} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Posts Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-sm">Total Posts</span>
                          <span className="font-bold">{data?.jobs.totalPosts || 0}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-sm">Active Posts</span>
                          <span className="font-bold text-green-600">{data?.jobs.activePosts || 0}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-sm">Filled Positions</span>
                          <span className="font-bold">{data?.jobs.filledPositions || 0}</span>
                        </div>
                        <div className="flex justify-between pb-2">
                          <span className="text-sm">Expired Posts</span>
                          <span className="font-bold text-red-500">{data?.jobs.expiredPosts || 0}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Applications Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-sm">Total Applications</span>
                          <span className="font-bold">{data?.jobs.totalApplications || 0}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-sm">Pending Review</span>
                          <span className="font-bold">{data?.jobs.pendingReview || 0}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-sm">Shortlisted</span>
                          <span className="font-bold text-blue-500">{data?.jobs.shortlisted || 0}</span>
                        </div>
                        <div className="flex justify-between pb-2">
                          <span className="text-sm">Hired</span>
                          <span className="font-bold text-green-600">{data?.jobs.hired || 0}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Finance Reports Tab */}
            <TabsContent value="finance" className="space-y-4" id="finance-report-section">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport('Finance Reports', 'csv', Object.values(data?.finance.byService || {}))} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('Finance Reports', 'pdf', [], 'finance-report-section')} disabled={isLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="col-span-full md:col-span-1 border-primary/50 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm font-semibold text-primary">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? <Loader2 className="h-6 w-6 mx-auto animate-spin" /> : `TZS ${data?.finance.totalRevenue.toLocaleString() || 0}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                {Object.values(data?.finance.byService || {}).slice(0, 3).map((srv: any) => (
                  <Card key={srv.service}>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">{srv.service}</p>
                        <p className="text-2xl font-bold">
                          TZS {srv.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown by Service</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Transactions</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Avg. Transaction</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.values(data?.finance.byService || {}).map((srv: any) => (
                          <TableRow key={srv.service}>
                            <TableCell className="font-medium">{srv.service}</TableCell>
                            <TableCell>{srv.transactions}</TableCell>
                            <TableCell className="font-semibold text-green-700">TZS {srv.totalAmount.toLocaleString()}</TableCell>
                            <TableCell>TZS {Math.round(srv.avgTransaction).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        {Object.keys(data?.finance.byService || {}).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">No transactions found for this period.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </AdminLayout>
  );
};

export default ReportsCenter;
