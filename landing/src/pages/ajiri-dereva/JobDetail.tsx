import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, MapPin, DollarSign, CheckCircle2, Award, MessageCircle, UserPlus, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const JobDetail = () => {
  const navigate = useNavigate();
  const { jobId: _jobId } = useParams();

  const jobDetails = {
    title: 'Experienced Truck Driver',
    vehicleType: 'Truck',
    licenseCategory: 'D',
    jobType: 'Full-time',
    positions: 2,
    salary: '500,000 - 800,000 TZS',
    location: 'Dar es Salaam, Kinondoni',
    startDate: '2025-02-01',
    postedOn: '2025-01-20',
    applications: 8,
    description: 'We are seeking experienced truck drivers for our logistics operations...',
    requirements: 'Valid Category D license, 3+ years experience, clean driving record...',
  };

  const suggestedDrivers = [
    {
      id: 1,
      name: 'John Mwamba',
      license: 'D',
      experience: '5 years',
      location: 'Dar es Salaam',
      badges: ['JiTesti Passed', 'Elimika Certified'],
      avatar: '',
      verified: true,
    },
    {
      id: 2,
      name: 'Sarah Kimaro',
      license: 'D',
      experience: '4 years',
      location: 'Dar es Salaam',
      badges: ['JiTesti Passed'],
      avatar: '',
      verified: true,
    },
    {
      id: 3,
      name: 'Mohamed Ali',
      license: 'D',
      experience: '6 years',
      location: 'Mwanza',
      badges: ['Elimika Certified'],
      avatar: '',
      verified: false,
    },
  ];

  const handleContact = (_driverId: number) => {
    const whatsappNumber = '255700000000'; // placeholder
    window.open(`https://wa.me/${whatsappNumber}?text=Hello, I'm interested in your driver profile`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <Button variant="outline" onClick={() => navigate('/ajiri-dereva/my-jobs')} className="mb-6">
          ← Back to My Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{jobDetails.title}</CardTitle>
                    <CardDescription className="mt-2">Posted on {jobDetails.postedOn}</CardDescription>
                  </div>
                  <Badge className="bg-success/10 text-success">Published</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{jobDetails.vehicleType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">License</p>
                      <p className="font-medium">Category {jobDetails.licenseCategory}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{jobDetails.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="font-medium">{jobDetails.salary}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Job Description</h3>
                  <p className="text-muted-foreground">{jobDetails.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-muted-foreground">{jobDetails.requirements}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium">{jobDetails.jobType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Positions</p>
                    <p className="font-medium">{jobDetails.positions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{jobDetails.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applications</p>
                    <p className="font-medium">{jobDetails.applications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suggested Drivers</CardTitle>
                <CardDescription>Matched by license category and location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestedDrivers.map((driver) => (
                    <div key={driver.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={driver.avatar} />
                          <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{driver.name}</h4>
                            {driver.verified && (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            License {driver.license} • {driver.experience} • {driver.location}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {driver.badges.map((badge, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/driver/${driver.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate('/ajiri-dereva/shortlist')}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Shortlist
                        </Button>
                        <Button size="sm" onClick={() => handleContact(driver.id)}>
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/ajiri-dereva/shortlist')}>
                  View Shortlist
                </Button>
                <Button className="w-full" variant="outline">
                  Edit Job Post
                </Button>
                <Button className="w-full" variant="outline">
                  Close Job
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Applications</span>
                  <span className="font-semibold">{jobDetails.applications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Shortlisted</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Contacted</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Interviewed</span>
                  <span className="font-semibold">1</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetail;
