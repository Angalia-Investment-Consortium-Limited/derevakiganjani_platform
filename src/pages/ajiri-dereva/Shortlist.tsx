import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, MessageCircle, Calendar, UserCheck, MapPin, Award, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Shortlist = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const shortlistedDrivers = [
    {
      id: 1,
      name: 'John Mwamba',
      license: 'D',
      experience: '5 years',
      location: 'Dar es Salaam, Kinondoni',
      preferredVehicle: 'Truck',
      badges: ['JiTesti Passed', 'Elimika Certified'],
      languages: ['English', 'Swahili'],
      avatar: '',
      verified: true,
      status: 'shortlisted',
    },
    {
      id: 2,
      name: 'Sarah Kimaro',
      license: 'D',
      experience: '4 years',
      location: 'Dar es Salaam, Ilala',
      preferredVehicle: 'Truck',
      badges: ['JiTesti Passed'],
      languages: ['Swahili'],
      avatar: '',
      verified: true,
      status: 'contacted',
    },
    {
      id: 3,
      name: 'Mohamed Ali',
      license: 'D',
      experience: '6 years',
      location: 'Mwanza',
      preferredVehicle: 'Truck, Trailer',
      badges: ['Elimika Certified'],
      languages: ['English', 'Swahili', 'French'],
      avatar: '',
      verified: false,
      status: 'interviewed',
    },
  ];

  const handleSendRequest = (_driverId: number, driverName: string) => {
    toast({
      title: "Request Sent",
      description: `Interview request sent to ${driverName}`,
    });
  };

  const handleScheduleInterview = (_driverId: number) => {
    toast({
      title: "Interview Scheduled",
      description: "Interview details have been sent to the driver",
    });
  };

  const handleMarkHired = (_driverId: number, driverName: string) => {
    toast({
      title: "Driver Hired",
      description: `${driverName} has been marked as hired`,
    });
  };

  const handleContact = (_driverId: number) => {
    const whatsappNumber = '255700000000'; // placeholder
    window.open(`https://wa.me/${whatsappNumber}?text=Hello, I'm interested in hiring you as a driver`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-primary/10 text-primary';
      case 'contacted':
        return 'bg-warning/10 text-warning';
      case 'interviewed':
        return 'bg-success/10 text-success';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Shortlisted Drivers</h1>
          <p className="text-muted-foreground">Dereva Waliochaguliwa</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {shortlistedDrivers.map((driver) => (
              <Card key={driver.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={driver.avatar} />
                      <AvatarFallback className="text-lg">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold">{driver.name}</h3>
                          {driver.verified && (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {driver.badges.map((badge, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                          <Badge className={getStatusColor(driver.status)}>
                            {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">License:</span>
                          <span className="font-medium">Category {driver.license}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="font-medium">{driver.experience}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{driver.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Vehicle:</span>
                          <span className="font-medium">{driver.preferredVehicle}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Languages:</span>
                        <span className="font-medium">{driver.languages.join(', ')}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button size="sm" onClick={() => navigate(`/driver/${driver.id}`)}>
                          View Full Profile
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendRequest(driver.id, driver.name)}
                        >
                          Send Request
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleScheduleInterview(driver.id)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule Interview
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleContact(driver.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-success hover:bg-success/90"
                          onClick={() => handleMarkHired(driver.id, driver.name)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Mark Hired
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shortlist Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Shortlisted</span>
                  <span className="font-semibold">{shortlistedDrivers.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Contacted</span>
                  <span className="font-semibold">
                    {shortlistedDrivers.filter(d => d.status === 'contacted' || d.status === 'interviewed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Interviewed</span>
                  <span className="font-semibold">
                    {shortlistedDrivers.filter(d => d.status === 'interviewed').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/ajiri-dereva/my-jobs')}>
                  Back to My Jobs
                </Button>
                <Button className="w-full" variant="outline">
                  Export List
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

export default Shortlist;
