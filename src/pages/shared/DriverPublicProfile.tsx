import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Award, Briefcase, MapPin, MessageCircle, Phone, Mail } from 'lucide-react';
import { useParams } from 'react-router-dom';

const DriverPublicProfile = () => {
  const { driverId: _driverId } = useParams();

  const driverProfile = {
    name: 'John Mwamba',
    license: 'D',
    licenseNumber: 'TZ123456789',
    experience: '5 years',
    location: 'Dar es Salaam, Kinondoni',
    preferredVehicles: ['Truck', 'Trailer'],
    languages: ['English', 'Swahili'],
    badges: ['JiTesti Passed', 'Elimika Certified'],
    avatar: '',
    verified: true,
    phone: '+255 700 000 000',
    email: 'john.mwamba@example.com',
    about: 'Experienced truck driver with over 5 years in long-haul transportation. Proven track record of safe driving and timely deliveries. Familiar with routes across Tanzania and East Africa.',
    certifications: [
      { name: 'JiTesti - Category D', date: '2024', verified: true },
      { name: 'Elimika Defensive Driving', date: '2024', verified: true },
      { name: 'First Aid Certificate', date: '2023', verified: false },
    ],
    workHistory: [
      {
        company: 'XYZ Logistics',
        position: 'Heavy Truck Driver',
        duration: '2021 - 2024',
        description: 'Long-haul transportation across East Africa',
      },
      {
        company: 'ABC Transport',
        position: 'Delivery Driver',
        duration: '2019 - 2021',
        description: 'Local and regional deliveries',
      },
    ],
  };

  const handleContact = () => {
    window.open(`https://wa.me/${driverProfile.phone.replace(/\s/g, '')}?text=Hello, I'm interested in your driver profile`, '_blank');
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
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={driverProfile.avatar} />
                    <AvatarFallback className="text-2xl">
                      {driverProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{driverProfile.name}</h2>
                    {driverProfile.verified && (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {driverProfile.badges.map((badge, i) => (
                      <Badge key={i} className="bg-success/10 text-success">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact via WhatsApp
                </Button>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{driverProfile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{driverProfile.email}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">License</p>
                    <p className="font-medium">Category {driverProfile.license}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="font-medium">{driverProfile.experience}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{driverProfile.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{driverProfile.about}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">License Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">License Number</p>
                      <p className="font-medium">{driverProfile.licenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">Category {driverProfile.license}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Preferred Vehicles</h4>
                  <div className="flex gap-2">
                    {driverProfile.preferredVehicles.map((vehicle, i) => (
                      <Badge key={i} variant="outline">{vehicle}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Languages</h4>
                  <div className="flex gap-2">
                    {driverProfile.languages.map((lang, i) => (
                      <Badge key={i} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {driverProfile.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{cert.name}</p>
                          {cert.verified && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Obtained: {cert.date}</p>
                      </div>
                      {cert.verified && (
                        <Badge className="bg-success/10 text-success">Verified</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {driverProfile.workHistory.map((job, i) => (
                    <div key={i} className="border-l-2 border-primary pl-4">
                      <h4 className="font-semibold">{job.position}</h4>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <p className="text-sm text-muted-foreground">{job.duration}</p>
                      <p className="text-sm mt-2">{job.description}</p>
                    </div>
                  ))}
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

export default DriverPublicProfile;
