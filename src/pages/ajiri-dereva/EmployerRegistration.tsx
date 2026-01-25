import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const EmployerRegistration = () => {
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(false);

  const handleSave = () => {
    toast({
      title: "Profile Saved",
      description: "Your employer profile has been saved successfully.",
    });
  };

  const handleVerifyEmail = () => {
    setIsVerified(true);
    toast({
      title: "Email Verified",
      description: "Your email has been verified successfully.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Employer Registration</h1>
          <p className="text-muted-foreground">Usajili wa Mwajiri</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Provide your organization details to hire drivers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="companyName" placeholder="ABC Transport Ltd" className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyType">Company Type *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transport">Transport Company</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="individual">Individual Employer</SelectItem>
                        <SelectItem value="government">Government Agency</SelectItem>
                        <SelectItem value="ngo">NGO/Organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input id="contactPerson" placeholder="John Doe" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" placeholder="+255 XXX XXX XXX" className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="contact@company.co.tz" className="pl-10" />
                  </div>
                  {isVerified && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      Email verified
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Select>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dar">Dar es Salaam</SelectItem>
                          <SelectItem value="arusha">Arusha</SelectItem>
                          <SelectItem value="mwanza">Mwanza</SelectItem>
                          <SelectItem value="dodoma">Dodoma</SelectItem>
                          <SelectItem value="mbeya">Mbeya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kinondoni">Kinondoni</SelectItem>
                        <SelectItem value="ilala">Ilala</SelectItem>
                        <SelectItem value="temeke">Temeke</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any additional information about your company..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSave} className="flex-1">
                    Save Profile
                  </Button>
                  {!isVerified && (
                    <Button onClick={handleVerifyEmail} variant="outline">
                      Verify Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Post a Job</CardTitle>
                <CardDescription>Start hiring qualified drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => window.location.href = '/ajiri-dereva/post-job'}>
                  Post Job Vacancy
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Jobs</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Applications</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Shortlisted</span>
                  <span className="font-semibold">5</span>
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

export default EmployerRegistration;
