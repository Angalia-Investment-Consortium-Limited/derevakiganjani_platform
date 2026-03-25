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
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const DriverProfile = () => {
  const navigate = useNavigate();
  const { driverId } = useParams();

  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriverData = async () => {
      if (!driverId) return;
      try {
        setLoading(true);
        const driverRef = doc(db, 'driver_profiles', driverId);
        const driverSnap = await getDoc(driverRef);
        
        if (driverSnap.exists()) {
          const data = driverSnap.data();
          const driverName = data.fullName || data.full_name || (data.first_name ? `${data.first_name} ${data.last_name}` : 'Unknown Driver');
          let lic = data.license_category || data.categories || [];
          if (typeof lic === 'string') lic = [lic];

          let jiTestiPassed = false;
          let elimikaCertified = false;
          let certsList = data.certificates || [];

          try {
             const certsQ = query(collection(db, 'certificates'), where('userId', '==', driverId));
             const certsSnap = await getDocs(certsQ);
             jiTestiPassed = !certsSnap.empty;
             certsSnap.docs.forEach(d => {
               certsList.push({ name: 'JiTesti Certificate', date: new Date((d.data().issuedAt || d.data().date)?.seconds * 1000).toLocaleDateString() || 'Recent', score: d.data().score || 'Passed' });
             });
          } catch(e) { console.error("Error checking certificates", e) }

          try {
             // Let's just check course_enrollments instead of elimika specific because of schemas
             const enrollQ = query(collection(db, 'course_enrollments'), where('userId', '==', driverId));
             const enrollSnap = await getDocs(enrollQ);
             if (!enrollSnap.empty) {
                // If they have any enrollments that are completed
                elimikaCertified = enrollSnap.docs.some(d => d.data().status === 'completed' || d.data().status === 'Completed' || d.data().progress === 100);
             }
          } catch(e) { console.error("Error checking enrollments", e) }

          setDriver({
            id: driverId,
            name: driverName,
            phone: data.phone || data.mobile || 'N/A',
            email: data.email || 'N/A',
            region: data.region || 'N/A',
            district: data.district || '',
            licenseCategory: lic,
            experienceYears: data.experience_years || data.experience || 0,
            jiTestiPassed,
            elimikaCertified,
            bio: data.bio || data.about || 'Professional driver registered on Dereva Kiganjani.',
            skills: data.skills || ['Driving', 'Safety Compliance', 'Vehicle Maintenance'],
            certificates: certsList,
            recentJobs: data.recentJobs || data.work_experience || [],
            cvUrl: data.cvUrl || null
          });
        } else {
          setError("Driver profile not found.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to load driver details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [driverId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 text-center mt-20">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error || "Could not load profile."}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </main>
        <Footer />
      </div>
    );
  }

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
                  {driver.recentJobs.length > 0 ? driver.recentJobs.map((job: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{job.position || job.title}</h4>
                        <p className="text-sm text-muted-foreground">{job.company || job.company_name}</p>
                        <p className="text-sm text-muted-foreground">{job.period || job.duration}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground">No specific work experience listed.</p>
                  )}
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
                  {driver.certificates.length > 0 ? driver.certificates.map((cert: any, index: number) => (
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
                  )) : (
                    <p className="text-muted-foreground">No certificates uploaded.</p>
                  )}
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
                  {driver.skills.map((skill: string, index: number) => (
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
                <Button variant="outline" className="w-full md:w-auto" disabled={!driver.cvUrl} onClick={() => driver.cvUrl && window.open(driver.cvUrl, '_blank')}>
                  <Download className="h-4 w-4 mr-2" />
                  {driver.cvUrl ? 'Download CV' : 'No CV Uploaded'}
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
