import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Award, Briefcase, MapPin, Upload, Eye, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRegions } from '@/hooks/useLicense';
import type { DriverProfile } from '@/types/auth';

const DriverJobProfile = () => {
  const { toast } = useToast();
  const { user, profile, updateProfile, isLoading: authLoading } = useAuth();
  const { regions, isLoading: regionsLoading } = useRegions();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<DriverProfile>>({
    full_name: '',
    license_number: '',
    license_category: '',
    years_of_experience: 0,
    preferred_vehicle_types: [],
    preferred_region: '',
    languages: [],
  });

  useEffect(() => {
    if (user && user.roles.includes('Driver') && profile) {
      setFormData(profile as DriverProfile);
    }
  }, [user, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast({
        title: "Profile Updated",
        description: "Your driver profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadCV = () => {
    // This will be implemented later
    toast({
      title: "CV Uploaded",
      description: "Your CV has been uploaded successfully.",
    });
  };

  if (authLoading || regionsLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Driver Job Profile</h1>
          <p className="text-muted-foreground">Wasifu wa Ajira</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>Complete your profile to get matched with suitable jobs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="full_name" placeholder="John Mwamba" className="pl-10" value={formData.full_name} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone_number" placeholder="+255 XXX XXX XXX" disabled value={formData.phone_number} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license_number">License Number *</Label>
                    <div className="relative">
                      <Award className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="license_number" placeholder="TZ123456789" className="pl-10" value={formData.license_number} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_category">License Category *</Label>
                    <Select onValueChange={(value) => handleSelectChange('license_category', value)} value={formData.license_category}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Category A - Motorcycle</SelectItem>
                        <SelectItem value="B">Category B - Light Vehicle</SelectItem>
                        <SelectItem value="C">Category C - Medium Vehicle</SelectItem>
                        <SelectItem value="D">Category D - Heavy Vehicle</SelectItem>
                        <SelectItem value="E">Category E - Trailer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="years_of_experience">Years of Experience *</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="years_of_experience" type="number" placeholder="e.g., 5" className="pl-10" min="0" value={formData.years_of_experience} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_vehicle_types">Preferred Vehicle Type(s) *</Label>
                    <Select onValueChange={(value) => handleSelectChange('preferred_vehicle_types', value.split(','))} value={formData.preferred_vehicle_types?.join(',')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="trailer">Trailer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_region">Preferred Location - Region *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Select onValueChange={(value) => handleSelectChange('preferred_region', value)} value={formData.preferred_region}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map(region => (
                            <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages Spoken *</Label>
                    <Input id="languages" placeholder="e.g., English, Swahili" value={formData.languages?.join(', ')} onChange={(e) => handleSelectChange('languages', e.target.value.split(', ').map(s => s.trim()))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cv">Upload CV (Optional)</Label>
                  <div className="flex gap-2">
                    <Input id="cv" type="file" accept=".pdf,.doc,.docx" />
                    <Button variant="outline" onClick={handleUploadCV}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certificates & Badges</CardTitle>
                <CardDescription>Your achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium">JiTesti Passed</span>
                  </div>
                  <Badge className="bg-success/10 text-success">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium">Elimika Certified</span>
                  </div>
                  <Badge className="bg-success/10 text-success">Verified</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>85% Complete</span>
                    <span className="text-muted-foreground">Good</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: '85%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload your CV to reach 100%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => window.location.href = '/ajira/jobs'}>
                  Find Jobs
                </Button>
                <Button className="w-full" variant="outline" onClick={() => window.location.href = '/ajira/applications'}>
                  My Applications
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

export default DriverJobProfile;
