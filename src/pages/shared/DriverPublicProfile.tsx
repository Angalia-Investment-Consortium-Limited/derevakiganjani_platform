import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Award, Briefcase, MapPin, MessageCircle, Phone, Mail, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DriverPublicProfile = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) {
      setError('Driver ID is missing.');
      setIsLoading(false);
      return;
    }

    const fetchDriverProfile = async () => {
      setIsLoading(true);
      try {
        const userDocRef = doc(db, 'users', driverId);
        const driverProfileDocRef = doc(db, 'driver_profiles', driverId);

        const userDocSnap = await getDoc(userDocRef);
        const driverProfileDocSnap = await getDoc(driverProfileDocRef);

        if (!userDocSnap.exists()) {
          throw new Error('Driver not found.');
        }

        const userData = userDocSnap.data();
        const driverProfileData = driverProfileDocSnap.exists() ? driverProfileDocSnap.data() : {};

        const combinedProfile = {
          name: userData.full_name || 'N/A',
          license: driverProfileData.license_categories?.[0] || driverProfileData.license?.class || 'N/A',
          licenseNumber: driverProfileData.license_number || driverProfileData.license?.number || 'N/A',
          experience: driverProfileData.years_of_experience ? `${driverProfileData.years_of_experience} years` : 'N/A',
          location: driverProfileData.preferred_region || (driverProfileData.location ? `${driverProfileData.location?.district || ''}, ${driverProfileData.location?.region || ''}` : 'N/A'),
          preferredVehicles: driverProfileData.preferred_vehicle_types || driverProfileData.preferred_vehicles || [],
          languages: driverProfileData.languages || [],
          badges: [] as string[],
          avatar: driverProfileData.avatar_url || driverProfileData.profile_image || '',
          verified: userData.isVerified || false,
          phone: userData.phoneNumber || userData.mobile_no || 'N/A',
          email: userData.email || 'N/A',
          about: driverProfileData.bio || driverProfileData.about_me || 'No biography provided.',
          certifications: driverProfileData.certifications || [],
          workHistory: driverProfileData.work_history || [],
        };

        if (driverProfileData.jitesti_passed) combinedProfile.badges.push('JiTesti Passed');
        if (driverProfileData.elimika_certified) combinedProfile.badges.push('Elimika Certified');

        setDriverProfile(combinedProfile);
      } catch (e: any) {
        console.error("Error fetching driver profile:", e);
        setError(e.message || 'Failed to fetch driver profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverProfile();
  }, [driverId]);

  const handleContact = () => {
    if (driverProfile?.phone && driverProfile.phone !== 'N/A') {
      window.open(`https://wa.me/${driverProfile.phone.replace(/\s/g, '')}?text=Hello, I'm interested in your driver profile`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !driverProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex justify-center items-center">
          <p className="text-red-500">{error || 'Profile not found.'}</p>
        </main>
        <Footer />
      </div>
    );
  }

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
                      {driverProfile.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{driverProfile.name}</h2>
                    {driverProfile.verified && (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {driverProfile.badges.map((badge: string, i: number) => (
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
                <Button className="w-full" onClick={handleContact} disabled={!driverProfile.phone || driverProfile.phone === 'N/A'}>
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
                  <div className="flex gap-2 flex-wrap">
                    {driverProfile.preferredVehicles && driverProfile.preferredVehicles.length > 0 ? driverProfile.preferredVehicles.map((vehicle: string, i: number) => (
                      <Badge key={i} variant="outline">{vehicle}</Badge>
                    )) : <span className="text-sm text-muted-foreground">None specified</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Languages</h4>
                  <div className="flex gap-2 flex-wrap">
                    {driverProfile.languages && driverProfile.languages.length > 0 ? driverProfile.languages.map((lang: string, i: number) => (
                      <Badge key={i} variant="outline">{lang}</Badge>
                    )) : <span className="text-sm text-muted-foreground">None specified</span>}
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
                  {driverProfile.certifications && driverProfile.certifications.length > 0 ? driverProfile.certifications.map((cert: any, i: number) => (
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
                  )) : <p className="text-sm text-muted-foreground">No certifications listed.</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {driverProfile.workHistory && driverProfile.workHistory.length > 0 ? driverProfile.workHistory.map((job: any, i: number) => (
                    <div key={i} className="border-l-2 border-primary pl-4">
                      <h4 className="font-semibold">{job.position}</h4>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <p className="text-sm text-muted-foreground">{job.duration}</p>
                      <p className="text-sm mt-2">{job.description}</p>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No work history provided.</p>}
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
