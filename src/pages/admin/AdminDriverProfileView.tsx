
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Award, Briefcase, MapPin, Phone, Mail, Loader2, AlertCircle } from 'lucide-react';

// Define a more comprehensive type for the merged profile data
interface DriverProfile {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  location: string;
  about: string;
  experience: string;
  license: {
    class: string;
    number: string;
    isVerified: boolean;
    status: string;
  };
  preferredVehicles: string[];
  languages: string[];
  certifications: { name: string; date: string; verified: boolean }[];
  workHistory: { company: string; position: string; duration: string; description: string }[];
  isVerified: boolean;
  badges: string[];
}

const AdminDriverProfileView = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
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
          throw new Error('Driver user record not found.');
        }

        const userData = userDocSnap.data();
        const driverProfileData = driverProfileDocSnap.exists() ? driverProfileDocSnap.data() : {};

        // Combine and structure the data
        const combinedProfile: DriverProfile = {
          uid: driverId,
          name: userData.full_name || 'N/A',
          email: userData.email || 'No email provided',
          phoneNumber: userData.phoneNumber || userData.mobile_no || 'No phone provided',
          avatar: driverProfileData.avatar_url || '',
          location: `${driverProfileData.location?.district || ''}, ${driverProfileData.location?.region || ''}`,
          about: driverProfileData.about_me || 'No biography provided.',
          experience: driverProfileData.years_of_experience || 'N/A',
          license: {
            class: driverProfileData.license?.class || 'N/A',
            number: driverProfileData.license?.number || 'N/A',
            isVerified: driverProfileData.license?.isVerified || false,
            status: driverProfileData.license?.status || 'Not Submitted',
          },
          preferredVehicles: driverProfileData.preferred_vehicles || [],
          languages: driverProfileData.languages || [],
          certifications: driverProfileData.certifications || [],
          workHistory: driverProfileData.work_history || [],
          isVerified: userData.isVerified || false, // Assuming a top-level verification status
          badges: [], // Logic for badges can be added here
        };

        // Example for dynamically adding badges
        if (driverProfileData.jitesti_passed) combinedProfile.badges.push('JiTesti Passed');
        if (driverProfileData.elimika_certified) combinedProfile.badges.push('Elimika Certified');


        setProfile(combinedProfile);
      } catch (e: any) {
        console.error("Error fetching driver profile:", e);
        setError(e.message || 'Failed to fetch driver profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverProfile();
  }, [driverId]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading driver profile...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
           <Card className="w-full max-w-lg bg-destructive/10">
                <CardHeader className="flex-row items-center gap-4">
                    <AlertCircle className="h-8 w-8 text-destructive"/>
                    <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        </div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout>
        <p>No profile data available for this driver.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
       <main className="flex-1 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    {profile.isVerified && (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {profile.badges.map((badge, i) => (
                      <Badge key={i} variant="secondary">
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
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
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
                    <p className="font-medium">Category {profile.license.class}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="font-medium">{profile.experience}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{profile.location}</p>
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
                <p className="text-muted-foreground">{profile.about}</p>
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
                      <p className="font-medium">{profile.license.number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">Category {profile.license.class}</p>
                    </div>
                     <div>
                      <p className="text-muted-foreground">Status</p>
                       <Badge variant={profile.license.isVerified ? 'default' : 'secondary'}>{profile.license.status}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Preferred Vehicles</h4>
                  <div className="flex gap-2 flex-wrap">
                    {profile.preferredVehicles.map((vehicle, i) => (
                      <Badge key={i} variant="outline">{vehicle}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Languages</h4>
                  <div className="flex gap-2 flex-wrap">
                    {profile.languages.map((lang, i) => (
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
                  {profile.certifications.length > 0 ? profile.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{cert.name}</p>
                          {cert.verified && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Obtained: {cert.date}</p>
                      </div>
                      {cert.verified && (
                        <Badge variant="secondary">Verified</Badge>
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
                  {profile.workHistory.length > 0 ? profile.workHistory.map((job, i) => (
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
    </AdminLayout>
  );
};

export default AdminDriverProfileView;
