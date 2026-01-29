import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, DollarSign, Award, GraduationCap, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const ReportsCenter = () => {
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-01-31');

  const handleExport = (reportType: string, format: 'csv' | 'pdf') => {
    toast({
      title: translations.exportStarted,
      description: `${translations.exporting} ${reportType} ${translations.as} ${format.toUpperCase()}...`,
    });
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
    value: string; 
    description: string; 
    color: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
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
      <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{translations.reportsAndExportCenter}</h1>
            <p className="text-muted-foreground">{translations.generateReportsAndAnalytics}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label>{translations.fromDate}</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{translations.toDate}</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{translations.region}</Label>
                  <Select defaultValue="all">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{translations.allRegions}</SelectItem>
                      <SelectItem value="nairobi">Nairobi</SelectItem>
                      <SelectItem value="mombasa">Mombasa</SelectItem>
                      <SelectItem value="kisumu">Kisumu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>{translations.applyFilters}</Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="overview">{translations.overview}</TabsTrigger>
              <TabsTrigger value="licenses">{translations.licenses}</TabsTrigger>
              <TabsTrigger value="tests">{translations.jiTesti}</TabsTrigger>
              <TabsTrigger value="courses">{translations.elimika}</TabsTrigger>
              <TabsTrigger value="recruitment">{translations.jobs}</TabsTrigger>
              <TabsTrigger value="finance">{translations.finance}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportCard icon={FileCheck} title={translations.totalLicenseRequests} value="2,543" description={`↑ 12% ${translations.fromLastMonth}`} color="text-blue-500" />
                <ReportCard icon={GraduationCap} title={translations.testsTaken} value="1,892" description={`↑ 8% ${translations.fromLastMonth}`} color="text-purple-500" />
                <ReportCard icon={Award} title={translations.certificatesIssued} value="856" description={`↑ 15% ${translations.fromLastMonth}`} color="text-green-500" />
                <ReportCard icon={DollarSign} title={translations.totalRevenue} value="KSh 2.4M" description={`↑ 18% ${translations.fromLastMonth}`} color="text-yellow-500" />
              </div>

              <Card>
                <CardHeader><CardTitle>{translations.quickStats}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><span className="text-sm">{translations.activeDrivers}</span><span className="font-bold">2,543</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm">{translations.pendingApprovals}</span><span className="font-bold">45</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm">{translations.activeJobPosts}</span><span className="font-bold">32</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm">{translations.completedCourses}</span><span className="font-bold">856</span></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="licenses" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport(translations.licenseReports, 'csv')}><Download className="mr-2 h-4 w-4" />{translations.exportCSV}</Button>
                <Button variant="outline" onClick={() => handleExport(translations.licenseReports, 'pdf')}><Download className="mr-2 h-4 w-4" />{translations.exportPDF}</Button>
              </div>

              <Card>
                <CardHeader><CardTitle>{translations.licenseRequestSummary}</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{translations.category}</TableHead>
                        <TableHead>{translations.newApplications}</TableHead>
                        <TableHead>{translations.renewals}</TableHead>
                        <TableHead>{translations.approved}</TableHead>
                        <TableHead>{translations.rejected}</TableHead>
                        <TableHead>{translations.pending}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell className="font-medium">{translations.classA}</TableCell><TableCell>245</TableCell><TableCell>123</TableCell><TableCell>320</TableCell><TableCell>18</TableCell><TableCell>30</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">{translations.classB}</TableCell><TableCell>892</TableCell><TableCell>456</TableCell><TableCell>1,145</TableCell><TableCell>52</TableCell><TableCell>151</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">{translations.classC}</TableCell><TableCell>156</TableCell><TableCell>78</TableCell><TableCell>198</TableCell><TableCell>12</TableCell><TableCell>24</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tests" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport(translations.jiTestiReports, 'csv')}><Download className="mr-2 h-4 w-4" />{translations.exportCSV}</Button>
                <Button variant="outline" onClick={() => handleExport(translations.jiTestiReports, 'pdf')}><Download className="mr-2 h-4 w-4" />{translations.exportPDF}</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardContent className="pt-6"><div className="text-center space-y-2"><p className="text-sm text-muted-foreground">{translations.totalAttempts}</p><p className="text-4xl font-bold">1,892</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center space-y-2"><p className="text-sm text-muted-foreground">{translations.passRate}</p><p className="text-4xl font-bold text-green-600">68.5%</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center space-y-2"><p className="text-sm text-muted-foreground">{translations.averageScore}</p><p className="text-4xl font-bold">72.3%</p></div></CardContent></Card>
              </div>

              <Card>
                <CardHeader><CardTitle>{translations.testPerformanceByCategory}</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{translations.category}</TableHead>
                        <TableHead>{translations.attempts}</TableHead>
                        <TableHead>{translations.passRate}</TableHead>
                        <TableHead>{translations.avgScore}</TableHead>
                        <TableHead>{translations.avgTime}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell className="font-medium">{translations.roadSigns}</TableCell><TableCell>543</TableCell><TableCell>72%</TableCell><TableCell>75.2%</TableCell><TableCell>18 min</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">{translations.trafficRules}</TableCell><TableCell>489</TableCell><TableCell>65%</TableCell><TableCell>70.8%</TableCell><TableCell>22 min</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">{translations.vehicleControls}</TableCell><TableCell>421</TableCell><TableCell>68%</TableCell><TableCell>71.5%</TableCell><TableCell>20 min</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-4">
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => handleExport(translations.elimikaReports, 'csv')}><Download className="mr-2 h-4 w-4" />{translations.exportCSV}</Button>
                    <Button variant="outline" onClick={() => handleExport(translations.elimikaReports, 'pdf')}><Download className="mr-2 h-4 w-4" />{translations.exportPDF}</Button>
                </div>
                <Card>
                    <CardHeader><CardTitle>{translations.courseEnrollmentAndCompletion}</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>{translations.courseName}</TableHead><TableHead>{translations.enrolled}</TableHead><TableHead>{translations.inProgress}</TableHead><TableHead>{translations.completed}</TableHead><TableHead>{translations.completionRate}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                <TableRow><TableCell className="font-medium">{translations.defensiveDriving}</TableCell><TableCell>324</TableCell><TableCell>145</TableCell><TableCell>179</TableCell><TableCell>55%</TableCell></TableRow>
                                <TableRow><TableCell className="font-medium">{translations.advancedTechniques}</TableCell><TableCell>256</TableCell><TableCell>98</TableCell><TableCell>158</TableCell><TableCell>62%</TableCell></TableRow>
                                <TableRow><TableCell className="font-medium">{translations.vehicleMaintenance}</TableCell><TableCell>189</TableCell><TableCell>67</TableCell><TableCell>122</TableCell><TableCell>65%</TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="recruitment" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport(translations.recruitmentReports, 'csv')}><Download className="mr-2 h-4 w-4" />{translations.exportCSV}</Button>
                <Button variant="outline" onClick={() => handleExport(translations.recruitmentReports, 'pdf')}><Download className="mr-2 h-4 w-4" />{translations.exportPDF}</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>{translations.jobPostsSummary}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between"><span className="text-sm">{translations.totalPosts}</span><span className="font-bold">127</span></div>
                      <div className="flex justify-between"><span className="text-sm">{translations.activePosts}</span><span className="font-bold">32</span></div>
                      <div className="flex justify-between"><span className="text-sm">{translations.filledPositions}</span><span className="font-bold">78</span></div>
                      <div className="flex justify-between"><span className="text-sm">{translations.expiredPosts}</span><span className="font-bold">17</span></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>{translations.applicationsSummary}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between"><span className="text-sm">{translations.totalApplications}</span><span className="font-bold">1,456</span></div>
                      <div className="flex justify-between"><span className="text-sm">{translations.pendingReview}</span><span className="font-bold">234</span></div>
                      <div className="flex justify-between"><span className="text-sm">{translations.shortlisted}</span><span className="font-bold">156</span></div>
                      <div className="flex justify-between"><span className="text-sm">{translations.hired}</span><span className="font-bold">78</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="finance" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport(translations.financeReports, 'csv')}><Download className="mr-2 h-4 w-4" />{translations.exportCSV}</Button>
                <Button variant="outline" onClick={() => handleExport(translations.financeReports, 'pdf')}><Download className="mr-2 h-4 w-4" />{translations.exportPDF}</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardContent className="pt-6"><div className="text-center space-y-2"><p className="text-sm text-muted-foreground">{translations.totalRevenue}</p><p className="text-3xl font-bold">KSh 2.4M</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center space-y-2"><p className="text-sm text-muted-foreground">{translations.jiTesti}</p><p className="text-3xl font-bold">KSh 946K</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center space-y-2"><p className="text-sm text-muted-foreground">{translations.elimika}</p><p className="text-3xl font-bold">KSh 1.03M</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center space-y-2"><p className="text-sm text-muted-foreground">{translations.licenses}</p><p className="text-3xl font-bold">KSh 424K</p></div></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle>{translations.revenueBreakdownByService}</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>{translations.service}</TableHead><TableHead>{translations.transactions}</TableHead><TableHead>{translations.revenue}</TableHead><TableHead>{translations.avgTransaction}</TableHead><TableHead>{translations.growth}</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell className="font-medium">{translations.jiTestiTests}</TableCell><TableCell>1,892</TableCell><TableCell>KSh 946,000</TableCell><TableCell>KSh 500</TableCell><TableCell className="text-green-600">+8%</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">{translations.elimikaCourses}</TableCell><TableCell>856</TableCell><TableCell>KSh 1,027,200</TableCell><TableCell>KSh 1,200</TableCell><TableCell className="text-green-600">+15%</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">{translations.licenseServices}</TableCell><TableCell>141</TableCell><TableCell>KSh 423,000</TableCell><TableCell>KSh 3,000</TableCell><TableCell className="text-green-600">+12%</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </AdminLayout>
  );
};

export default ReportsCenter;
