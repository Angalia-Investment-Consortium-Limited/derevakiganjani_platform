import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Briefcase, Building2, DollarSign, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FindJobs = () => {
  const navigate = useNavigate();

  const jobs = [
    {
      id: 1,
      title: 'Experienced Truck Driver',
      employer: 'ABC Transport Ltd',
      location: 'Dar es Salaam, Kinondoni',
      vehicleType: 'Truck',
      licenseRequired: 'D',
      salary: '500,000 - 800,000 TZS',
      jobType: 'Full-time',
      postedOn: '2 days ago',
      applications: 8,
    },
    {
      id: 2,
      title: 'Company Car Driver',
      employer: 'TechCorp Tanzania',
      location: 'Dar es Salaam, Ilala',
      vehicleType: 'Car',
      licenseRequired: 'B',
      salary: '400,000 - 600,000 TZS',
      jobType: 'Full-time',
      postedOn: '4 days ago',
      applications: 15,
    },
    {
      id: 3,
      title: 'Bus Driver - Tourist Routes',
      employer: 'Safari Adventures',
      location: 'Arusha',
      vehicleType: 'Bus',
      licenseRequired: 'C',
      salary: '600,000 - 900,000 TZS',
      jobType: 'Contract',
      postedOn: '1 week ago',
      applications: 12,
    },
    {
      id: 4,
      title: 'Delivery Motorcycle Rider',
      employer: 'QuickDeliver',
      location: 'Dar es Salaam',
      vehicleType: 'Motorcycle',
      licenseRequired: 'A',
      salary: '300,000 - 450,000 TZS',
      jobType: 'Part-time',
      postedOn: '3 days ago',
      applications: 23,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Find Driver Jobs</h1>
          <p className="text-muted-foreground">Tafuta Ajira ya Udereva</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Jobs</CardTitle>
            <CardDescription>Narrow down your job search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search jobs..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="License Category" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="dar">Dar es Salaam</SelectItem>
                  <SelectItem value="arusha">Arusha</SelectItem>
                  <SelectItem value="mwanza">Mwanza</SelectItem>
                  <SelectItem value="dodoma">Dodoma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fulltime">Full-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="parttime">Part-time</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Salary Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salaries</SelectItem>
                  <SelectItem value="300-500">300k - 500k TZS</SelectItem>
                  <SelectItem value="500-700">500k - 700k TZS</SelectItem>
                  <SelectItem value="700-1000">700k - 1M TZS</SelectItem>
                  <SelectItem value="1000+">1M+ TZS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{jobs.length} jobs found</p>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {jobs.map((job) => (
              <Card 
                key={job.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                onClick={() => navigate(`/ajira/job/${job.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{job.employer}</span>
                      </div>
                    </div>
                    <Badge variant="outline">Category {job.licenseRequired}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{job.vehicleType} • {job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Posted {job.postedOn}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      {job.applications} applications
                    </span>
                    <Button size="sm">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Alerts</CardTitle>
                <CardDescription>Get notified about new jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Set Job Alert
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profile Completion</span>
                  <span className="font-semibold">85%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: '85%' }} />
                </div>
                <Button className="w-full" variant="outline" onClick={() => navigate('/ajira/profile')}>
                  Complete Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Complete your profile to get better matches</li>
                  <li>• Apply early to increase your chances</li>
                  <li>• Keep your certificates up to date</li>
                  <li>• Check job requirements carefully</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FindJobs;
