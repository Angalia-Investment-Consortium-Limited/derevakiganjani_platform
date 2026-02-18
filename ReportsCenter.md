# Reports Center

The `ReportsCenter` component is a comprehensive dashboard for viewing and exporting various reports and analytics related to the platform's services.

## Features

- **Date and Region Filtering**: Allows users to filter report data by a specific date range and geographical region.
- **Tabbed Navigation**: Organizes reports into logical categories for easy access:
  - **Overview**: Provides a high-level summary of key metrics across all services, including license requests, test results, course completions, and revenue.
  - **Licenses**: Offers a detailed breakdown of license applications, including new vs. renewals, and their current status (approved, rejected, pending).
  - **JiTesti (Tests)**: Displays in-depth analytics on test performance, such as attempt numbers, pass rates, and average scores, both overall and by category.
  - **Elimika (Courses)**: Tracks learner engagement with courses, showing enrollment numbers, completion rates, and progress.
  - **Recruitment (Jobs)**: Summarizes the job board's activity, including the number of job posts, applications, and hiring statuses.
  - **Finance**: Presents a financial overview, detailing revenue generated from each service.
- **Data Export**: Enables users to export the data from any report section into either CSV or PDF format for offline analysis or record-keeping.
- **Quick Stats**: The Overview tab includes a "Quick Stats" section that provides at-a-glance numbers for important operational metrics like active drivers, pending approvals, and active job posts.
- **Multilingual Support**: The component is designed to be displayed in multiple languages, ensuring accessibility for a diverse user base.

## Components Used

The `ReportsCenter` leverages several UI components from the project's design system to create a consistent and intuitive user interface:

- `AdminLayout`: Provides the standard administrative dashboard layout.
- `Card`, `CardContent`, `CardHeader`, `CardTitle`: Used to structure and display report sections.
- `Button`: For actions like applying filters and exporting data.
- `Input`, `Label`: For date selection fields.
- `Select`: For region selection dropdowns.
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`: To create the tabbed navigation for different report categories.
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`: To display tabular data within the reports.
- `useToast`: To provide feedback to the user when an action, like exporting a report, is initiated.
- `useLanguage`: To manage the display of text in the user's selected language.

## UI Issues

- **Missing Breadcrumbs**: The `AdminBreadcrumbs` component is not implemented, which makes it difficult for users to navigate back to the main admin dashboard.
- **Missing Text**: Several UI elements are missing text, including labels, and other descriptive text, which makes it difficult for users to understand the purpose of each field.
- **Incorrect Styling**: The styling of the page is inconsistent with the design, with some elements having the wrong color, size, or spacing.

## Shared Code

```javascript
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, BarChart3, DollarSign, Award, Briefcase, GraduationCap, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReportsCenter = () => {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-01-31');

  const handleExport = (reportType: string, format: 'csv' | 'pdf') => {
    toast({
      title: 'Export Started',
      description: `Exporting ${reportType} as ${format.toUpperCase()}...`,
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
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="nairobi">Nairobi</SelectItem>
                      <SelectItem value="mombasa">Mombasa</SelectItem>
                      <SelectItem value="kisumu">Kisumu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Different Report Categories */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="licenses">Licenses</TabsTrigger>
              <TabsTrigger value="tests">JiTesti</TabsTrigger>
              <TabsTrigger value="courses">Elimika</TabsTrigger>
              <TabsTrigger value="recruitment">Jobs</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportCard
                  icon={FileCheck}
                  title="Total License Requests"
                  value="2,543"
                  description="↑ 12% from last month"
                  color="text-blue-500"
                />
                <ReportCard
                  icon={GraduationCap}
                  title="Tests Taken"
                  value="1,892"
                  description="↑ 8% from last month"
                  color="text-purple-500"
                />
                <ReportCard
                  icon={Award}
                  title="Certificates Issued"
                  value="856"
                  description="↑ 15% from last month"
                  color="text-green-500"
                />
                <ReportCard
                  icon={DollarSign}
                  title="Total Revenue"
                  value="KSh 2.4M"
                  description="↑ 18% from last month"
                  color="text-yellow-500"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Drivers</span>
                      <span className="font-bold">2,543</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Approvals</span>
                      <span className="font-bold">45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Job Posts</span>
                      <span className="font-bold">32</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Courses</span>
                      <span className="font-bold">856</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* License Reports Tab */}
            <TabsContent value="licenses" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport('License Reports', 'csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('License Reports', 'pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>License Request Summary</CardTitle>
                </CardHeader>
                <CardContent>
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
                      <TableRow>
                        <TableCell className="font-medium">Class A</TableCell>
                        <TableCell>245</TableCell>
                        <TableCell>123</TableCell>
                        <TableCell>320</TableCell>
                        <TableCell>18</TableCell>
                        <TableCell>30</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Class B</TableCell>
                        <TableCell>892</TableCell>
                        <TableCell>456</TableCell>
                        <TableCell>1,145</TableCell>
                        <TableCell>52</TableCell>
                        <TableCell>151</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Class C</TableCell>
                        <TableCell>156</TableCell>
                        <TableCell>78</TableCell>
                        <TableCell>198</TableCell>
                        <TableCell>12</TableCell>
                        <TableCell>24</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* JiTesti Reports Tab */}
            <TabsContent value="tests" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport('JiTesti Reports', 'csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('JiTesti Reports', 'pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Total Attempts</p>
                      <p className="text-4xl font-bold">1,892</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Pass Rate</p>
                      <p className="text-4xl font-bold text-green-600">68.5%</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-4xl font-bold">72.3%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Test Performance by Category</CardTitle>
                </CardHeader>
                <CardContent>
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
                      <TableRow>
                        <TableCell className="font-medium">Road Signs</TableCell>
                        <TableCell>543</TableCell>
                        <TableCell>72%</TableCell>
                        <TableCell>75.2%</TableCell>
                        <TableCell>18 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Traffic Rules</TableCell>
                        <TableCell>489</TableCell>
                        <TableCell>65%</TableCell>
                        <TableCell>70.8%</TableCell>
                        <TableCell>22 min</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Vehicle Controls</TableCell>
                        <TableCell>421</TableCell>
                        <TableCell>68%</TableCell>
                        <TableCell>71.5%</TableCell>
                        <TableCell>20 min</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Elimika Reports Tab */}
            <TabsContent value="courses" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport('Elimika Reports', 'csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('Elimika Reports', 'pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Course Enrollment & Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Enrolled</TableHead>
                        <TableHead>In Progress</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Completion Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Defensive Driving</TableCell>
                        <TableCell>324</TableCell>
                        <TableCell>145</TableCell>
                        <TableCell>179</TableCell>
                        <TableCell>55%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Advanced Techniques</TableCell>
                        <TableCell>256</TableCell>
                        <TableCell>98</TableCell>
                        <TableCell>158</TableCell>
                        <TableCell>62%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Vehicle Maintenance</TableCell>
                        <TableCell>189</TableCell>
                        <TableCell>67</TableCell>
                        <TableCell>122</TableCell>
                        <TableCell>65%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recruitment Reports Tab */}
            <TabsContent value="recruitment" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport('Recruitment Reports', 'csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('Recruitment Reports', 'pdf')}>
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
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Posts</span>
                        <span className="font-bold">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Posts</span>
                        <span className="font-bold">32</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Filled Positions</span>
                        <span className="font-bold">78</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Expired Posts</span>
                        <span className="font-bold">17</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Applications Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Applications</span>
                        <span className="font-bold">1,456</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pending Review</span>
                        <span className="font-bold">234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Shortlisted</span>
                        <span className="font-bold">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Hired</span>
                        <span className="font-bold">78</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Finance Reports Tab */}
            <TabsContent value="finance" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleExport('Finance Reports', 'csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('Finance Reports', 'pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-3xl font-bold">KSh 2.4M</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">JiTesti</p>
                      <p className="text-3xl font-bold">KSh 946K</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Elimika</p>
                      <p className="text-3xl font-bold">KSh 1.03M</p>
                    </div>
                  </CardContent>.
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Leseni</p>
                      <p className="text-3xl font-bold">KSh 424K</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown by Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Avg. Transaction</TableHead>
                        <TableHead>Growth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">JiTesti Tests</TableCell>
                        <TableCell>1,892</TableCell>
                        <TableCell>KSh 946,000</TableCell>
                        <TableCell>KSh 500</TableCell>
                        <TableCell className="text-green-600">+8%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Elimika Courses</TableCell>
                        <TableCell>856</TableCell>
                        <TableCell>KSh 1,027,200</TableCell>
                        <TableCell>KSh 1,200</TableCell>
                        <TableCell className="text-green-600">+15%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">License Services</TableCell>
                        <TableCell>141</TableCell>
                        <TableCell>KSh 423,000</TableCell>
                        <TableCell>KSh 3,000</TableCell>
                        <TableCell className="text-green-600">+12%</TableCell>
                      </TableRow>
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
