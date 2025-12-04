import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, Phone, MapPin, Mail, Briefcase, Calendar, Award, 
  FileText, UserCheck, MessageSquare, ArrowLeft, Download 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const DriverProfile = () => {
  const navigate = useNavigate();
  const { driverId } = useParams();

  // TODO: Fetch driver data from API
  const driver = {
    id: driverId,
    name: 'John Mwamba',
    phone: '+255 712 345 678',
    email: 'john.mwamba@email.com',
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    licenseCategory: ['D', 'E'],
    experienceYears: 5,
    jiTestiPassed: true,
    elimikaCertified: true,
    cvUrl: '/cv/john-mwamba.pdf',
    bio: 'Experienced truck driver with 5 years of driving heavy vehicles across East Africa. Strong safety record and excellent navigation skills.',
    recentJobs: [
      { company: 'ABC Transport', position: 'Truck Driver', period: '2020 - 2024' },
      { company: 'XYZ Logistics', position: 'Delivery Driver', period: '2018 - 2020' },
    ],
    certificates: [
      { name: 'JiTesti - Category D', date: '2024-01-15', score: '92%' },
      { name: 'Elimika - Defensive Driving', date: '2023-12-10', progress: '100%' },
    ],
    skills: ['Heavy Vehicle Operation', 'Route Planning', 'Vehicle Maintenance', 'Safety Compliance'],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Driver Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-2xl">
                      {driver.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl">{driver.name}</CardTitle>
                  <CardDescription className="mt-2">Professional Driver</CardDescription>
                  <div className="flex gap-2 mt-3">
                    {driver.licenseCategory.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-lg px-3 py-1">
                        Category {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.region}, {driver.district}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.experienceYears} years experience</span>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {driver.jiTestiPassed && (
                      <Badge className="bg-success/10 text-success">
                        <Award className="h-3 w-3 mr-1" />
                        JiTesti Passed
                      </Badge>
                    )}
                    {driver.elimikaCertified && (
                      <Badge className="bg-blue-500/10 text-blue-500">
                        <Award className="h-3 w-3 mr-1" />
                        Elimika Certified
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Button className="w-full" onClick={() => navigate('/employer/interviews')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/employer/shortlist')}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Add to Shortlist
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/employer/messages')}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{driver.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {driver.recentJobs.map((job, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{job.position}</h4>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <p className="text-sm text-muted-foreground">{job.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificates & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {driver.certificates.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                          <Award className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{cert.name}</h4>
                          <p className="text-xs text-muted-foreground">{cert.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {cert.score && (
                          <Badge className="bg-success/10 text-success">{cert.score}</Badge>
                        )}
                        {cert.progress && (
                          <Badge className="bg-blue-500/10 text-blue-500">{cert.progress}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {driver.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume / CV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full md:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Download CV
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DriverProfile;
