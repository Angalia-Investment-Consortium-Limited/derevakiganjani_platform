import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Users, Target, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MatchingMonitor = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Active Jobs', value: '45', icon: Target, color: 'text-primary' },
    { title: 'Total Matches', value: '320', icon: Users, color: 'text-success' },
    { title: 'Avg Match Score', value: '87%', icon: TrendingUp, color: 'text-blue-500' },
  ];

  const jobMatches = [
    {
      id: 1,
      jobTitle: 'Experienced Truck Driver',
      employer: 'ABC Transport',
      totalMatches: 12,
      topMatches: [
        { name: 'John Mwamba', score: 95, category: 'D', experience: '5 yrs' },
        { name: 'David Luka', score: 92, category: 'D', experience: '7 yrs' },
        { name: 'Peter Juma', score: 88, category: 'D', experience: '4 yrs' },
      ],
    },
    {
      id: 2,
      jobTitle: 'Company Car Driver',
      employer: 'TechCorp Tanzania',
      totalMatches: 18,
      topMatches: [
        { name: 'Mary Kamara', score: 96, category: 'B', experience: '3 yrs' },
        { name: 'Sarah Ali', score: 94, category: 'B', experience: '6 yrs' },
        { name: 'James Otieno', score: 90, category: 'B', experience: '4 yrs' },
      ],
    },
    {
      id: 3,
      jobTitle: 'Bus Driver - Tourist Routes',
      employer: 'Safari Adventures',
      totalMatches: 8,
      topMatches: [
        { name: 'Robert Kioko', score: 93, category: 'C', experience: '8 yrs' },
        { name: 'Hassan Musa', score: 89, category: 'C', experience: '5 yrs' },
        { name: 'Daniel Wafula', score: 85, category: 'C', experience: '6 yrs' },
      ],
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-success/10 text-success';
    if (score >= 75) return 'bg-warning/10 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Matching Monitor</h1>
          <p className="text-muted-foreground">AI-powered job-driver matching analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Matches</CardTitle>
            <CardDescription>Top driver matches for each job posting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search jobs..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="A">Category A</SelectItem>
                  <SelectItem value="B">Category B</SelectItem>
                  <SelectItem value="C">Category C</SelectItem>
                  <SelectItem value="D">Category D</SelectItem>
                  <SelectItem value="E">Category E</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Match Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="90+">90%+</SelectItem>
                  <SelectItem value="75-89">75% - 89%</SelectItem>
                  <SelectItem value="60-74">60% - 74%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {jobMatches.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{job.jobTitle}</CardTitle>
                        <CardDescription>
                          {job.employer} • {job.totalMatches} total matches
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/jobs/${job.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Job
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Driver Name</TableHead>
                            <TableHead>License</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Match Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {job.topMatches.map((match, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Badge variant="outline">#{index + 1}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">{match.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">Cat {match.category}</Badge>
                              </TableCell>
                              <TableCell>{match.experience}</TableCell>
                              <TableCell>
                                <Badge className={getScoreColor(match.score)}>
                                  {match.score}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigate(`/driver/${index + 1}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default MatchingMonitor;
