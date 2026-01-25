import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Briefcase, MessageCircle, Phone, Mail, Globe } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const EmployerProfile = () => {
  const navigate = useNavigate();
  const { employerId: _employerId } = useParams();

  const employerProfile = {
    companyName: 'ABC Transport Ltd',
    industry: 'Transport & Logistics',
    companyType: 'Transport Company',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    activeJobs: 5,
    totalHires: 28,
    memberSince: '2020',
    phone: '+255 700 000 000',
    email: 'hr@abctransport.co.tz',
    website: 'www.abctransport.co.tz',
    about: `ABC Transport Ltd is a leading logistics and freight company in Tanzania with over 15 years of experience. We specialize in long-haul transportation, warehousing, and distribution services across East Africa. 

Our commitment to safety, reliability, and customer satisfaction has made us one of the most trusted names in the industry. We maintain a modern fleet of vehicles and employ highly trained professional drivers.

We are always looking for talented, safety-conscious drivers to join our growing team.`,
    services: [
      'Long-haul Freight Transport',
      'Regional Distribution',
      'Warehousing Solutions',
      'Fleet Management',
    ],
    activeJobPostings: [
      {
        id: 1,
        title: 'Experienced Truck Driver',
        location: 'Dar es Salaam',
        vehicleType: 'Truck',
        license: 'D',
        postedOn: '2 days ago',
      },
      {
        id: 2,
        title: 'Delivery Van Driver',
        location: 'Arusha',
        vehicleType: 'Van',
        license: 'B',
        postedOn: '1 week ago',
      },
      {
        id: 3,
        title: 'Regional Bus Driver',
        location: 'Mwanza',
        vehicleType: 'Bus',
        license: 'C',
        postedOn: '3 days ago',
      },
    ],
  };

  const handleContact = () => {
    window.open(`https://wa.me/${employerProfile.phone.replace(/\s/g, '')}?text=Hello, I'm interested in driver opportunities at ${employerProfile.companyName}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-32 w-32 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Building2 className="h-16 w-16 text-primary" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">{employerProfile.companyName}</h2>
                  <Badge className="mb-4">{employerProfile.industry}</Badge>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{employerProfile.region}, {employerProfile.district}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">Member since {employerProfile.memberSince}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{employerProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{employerProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{employerProfile.website}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Jobs</span>
                  <span className="font-semibold text-lg">{employerProfile.activeJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Hires</span>
                  <span className="font-semibold text-lg">{employerProfile.totalHires}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Years in Business</span>
                  <span className="font-semibold text-lg">15+</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {employerProfile.companyName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{employerProfile.about}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {employerProfile.services.map((service, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-lg border">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Job Openings</CardTitle>
                <CardDescription>{employerProfile.activeJobs} active positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employerProfile.activeJobPostings.map((job) => (
                    <div 
                      key={job.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/ajira/job/${job.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{job.title}</h4>
                        <Badge variant="outline">Category {job.license}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{job.vehicleType}</span>
                        </div>
                        <span>Posted {job.postedOn}</span>
                      </div>
                      <Button size="sm" className="mt-3">
                        Apply Now
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/ajira/jobs')}
                >
                  View All Jobs from this Company
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Work With Us?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Competitive salary and benefits package</li>
                  <li>✓ Modern, well-maintained fleet of vehicles</li>
                  <li>✓ Comprehensive training and development programs</li>
                  <li>✓ Clear career progression opportunities</li>
                  <li>✓ Safe working environment with proper equipment</li>
                  <li>✓ Regular performance reviews and bonuses</li>
                  <li>✓ Medical insurance and retirement benefits</li>
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

export default EmployerProfile;
