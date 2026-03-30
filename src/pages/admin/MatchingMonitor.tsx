import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Users, Target, Eye, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMatchingMonitor } from '@/hooks/useMatchingMonitor';
import { useMemo, useState } from 'react';

const MatchingMonitor = () => {
  const navigate = useNavigate();
  const { jobsWithMatches, isLoading, calculateMatches, isCalculating } = useMatchingMonitor();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const stats = useMemo(() => {
    let activeJobs = jobsWithMatches.length;
    let totalMatches = 0;
    
    let scoreSum = 0;
    let totalScoreCount = 0;

    jobsWithMatches.forEach(job => {
      if (job.matchData) {
        totalMatches += job.matchData.totalMatchesFound || 0;
        job.matchData.topMatches.forEach(match => {
          scoreSum += match.score;
          totalScoreCount++;
        });
      }
    });

    const avgScore = totalScoreCount > 0 ? Math.round(scoreSum / totalScoreCount) : 0;

    return [
      { title: 'Active Jobs', value: activeJobs.toString(), icon: Target, color: 'text-primary' },
      { title: 'Total AI Matches', value: totalMatches.toString(), icon: Users, color: 'text-success' },
      { title: 'Avg Match Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-blue-500' },
    ];
  }, [jobsWithMatches]);

  const filteredJobs = useMemo(() => {
    return jobsWithMatches.filter((job) => {
      const matchesSearch = job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.employer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [jobsWithMatches, searchTerm]);

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
                <Input 
                  placeholder="Search jobs or employers..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
              {isLoading ? (
                <div className="flex justify-center p-8">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center p-8 border rounded-md text-muted-foreground">
                  No active jobs found matching your criteria.
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {job.jobTitle}
                            <Badge variant={job.matchData ? "default" : "secondary"} className="ml-2 text-xs">
                              {job.matchData ? `${job.matchData.totalMatchesFound} AI Matches` : 'No AI Matches Yet'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {job.employer} • Posted: {job.postedDate ? new Date(job.postedDate.toMillis()).toLocaleDateString() : 'N/A'}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            disabled={isCalculating}
                            onClick={() => calculateMatches(job.id)}
                          >
                            {isCalculating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />}
                            {job.matchData ? 'Recalculate Matches' : 'Find Best Matches'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/job-management`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Job
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {job.matchData && job.matchData.topMatches.length > 0 && (
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">Rank</TableHead>
                                <TableHead>Driver Name</TableHead>
                                <TableHead>License</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead>Match Score</TableHead>
                                <TableHead className="hidden md:table-cell max-w-sm">AI Reasoning</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {job.matchData.topMatches.map((match, index) => (
                                <TableRow key={match.driverId || index}>
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
                                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-sm truncate" title={match.reasoning}>
                                    {match.reasoning}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => navigate(`/admin/driver/${match.driverId}`)}
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
                    )}
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default MatchingMonitor;
