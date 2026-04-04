import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Phone, MapPin, Edit, Save, X, Briefcase, Car, Building, FileText, Globe, UserCheck, Loader2, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import type { DriverProfile, EmployerProfile } from '@/types/auth';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const Profile = () => {
  const { user, profile, updateUser, updateProfile, refreshProfile, userType } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    bio: '',
    licenseNumber: '',
    company_name: '',
    companyRegistration: '',
    contactPerson: '',
    website: '',
    smsEnabled: true,
    emailEnabled: true,
  });

  useEffect(() => {
    if (user || profile) {
      const driverProfile = profile as DriverProfile;
      const employerProfile = profile as EmployerProfile;
      
      setFormData({
        full_name: user?.full_name || driverProfile?.fullName || '',
        email: user?.email || '',
        phone_number: (profile as any)?.phone_number || user?.mobile_no || '',
        address: (profile as any)?.address || '',
        bio: driverProfile?.bio || '',
        licenseNumber: driverProfile?.licenseNumber || '',
        company_name: employerProfile?.company_name || '',
        companyRegistration: employerProfile?.companyRegistration || '',
        contactPerson: employerProfile?.contactPerson || '',
        website: employerProfile?.website || '',
        smsEnabled: (profile as DriverProfile | EmployerProfile)?.notificationPreferences?.smsEnabled !== false,
        emailEnabled: (profile as DriverProfile | EmployerProfile)?.notificationPreferences?.emailEnabled !== false,
      });
    }
  }, [user, profile]);

  const getUserInitials = () => {
    if (!formData.full_name) return 'U';
    const names = formData.full_name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const clean = (obj: any) => JSON.parse(JSON.stringify(obj));

      const userData = clean({
        full_name: formData.full_name,
      });

      let profileData: any = clean({
        phone_number: formData.phone_number,
        address: formData.address,
      });

      if (userType === 'Driver') {
        profileData = {
          ...profileData,
          fullName: formData.full_name,
          bio: formData.bio,
          licenseNumber: formData.licenseNumber,
        };
      } else if (userType === 'Employer') {
        profileData = {
          ...profileData,
          company_name: formData.company_name,
          companyRegistration: formData.companyRegistration,
          contactPerson: formData.contactPerson,
          website: formData.website,
        };
      }
      
      profileData.notificationPreferences = {
        smsEnabled: formData.smsEnabled,
        emailEnabled: formData.emailEnabled,
      };
      
      await updateUser(userData);
      await updateProfile(clean(profileData));
      await refreshProfile();

      setIsEditing(false);
      toast({ title: t('success'), description: 'Profile updated successfully' });
    } catch (error: any) {
      toast({ title: t('error'), description: error.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (user || profile) {
         const driverProfile = profile as DriverProfile;
         const employerProfile = profile as EmployerProfile;
         setFormData({
            full_name: user?.full_name || driverProfile?.fullName || '',
            email: user?.email || '',
            phone_number: (profile as any)?.phone_number || user?.mobile_no || '',
            address: (profile as any)?.address || '',
            bio: driverProfile?.bio || '',
            licenseNumber: driverProfile?.licenseNumber || '',
            company_name: employerProfile?.company_name || '',
            companyRegistration: employerProfile?.companyRegistration || '',
            contactPerson: employerProfile?.contactPerson || '',
            website: employerProfile?.website || '',
            smsEnabled: (profile as DriverProfile | EmployerProfile)?.notificationPreferences?.smsEnabled !== false,
            emailEnabled: (profile as DriverProfile | EmployerProfile)?.notificationPreferences?.emailEnabled !== false,
         });
    }
    setIsEditing(false);
  };

  const getUserTypeLabel = () => {
    return userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'User';
  };

  const renderDriverFields = () => (
    <div className='space-y-6'>
        <h3 className="font-semibold text-lg">Driver Details</h3>
        <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
            <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="A brief introduction about yourself" />
            ) : (
            <p className="text-sm text-muted-foreground pt-2">{formData.bio || 'Not provided'}</p>
            )}
        </div>
        <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            {isEditing ? (
            <Input id="licenseNumber" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} placeholder="e.g., DL12345" />
            ) : (
            <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50"><Car className="h-4 w-4 text-muted-foreground" /><span>{formData.licenseNumber || 'Not provided'}</span></div>
            )}
        </div>
    </div>
  );

  const renderEmployerFields = () => (
    <div className='space-y-6'>
        <h3 className="font-semibold text-lg">Company Information</h3>
        <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            {isEditing ? (
                <Input id="company_name" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
            ) : (
                <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50"><Building className="h-4 w-4 text-muted-foreground" /><span>{formData.company_name || 'Not provided'}</span></div>
            )}
        </div>
        <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            {isEditing ? (
                <Input id="contactPerson" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
            ) : (
                <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50"><UserCheck className="h-4 w-4 text-muted-foreground" /><span>{formData.contactPerson || 'Not provided'}</span></div>
            )}
        </div>
        <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            {isEditing ? (
                <Input id="website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
            ) : (
                <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50"><Globe className="h-4 w-4 text-muted-foreground" /><span>{formData.website || 'Not provided'}</span></div>
            )}
        </div>
         <div className="space-y-2">
            <Label htmlFor="companyRegistration">Company Registration</Label>
            {isEditing ? (
                <Input id="companyRegistration" value={formData.companyRegistration} onChange={(e) => setFormData({ ...formData, companyRegistration: e.target.value })} />
            ) : (
                <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50"><FileText className="h-4 w-4 text-muted-foreground" /><span>{formData.companyRegistration || 'Not provided'}</span></div>
            )}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/dashboard">Home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>My Profile</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4"><AvatarImage src={user?.user_image} alt={formData.full_name} /><AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback></Avatar>
                <CardTitle className="text-xl">{formData.full_name}</CardTitle>
                <CardDescription className="mt-1">{formData.email}</CardDescription>
                <Badge className={`mt-3`}>{getUserTypeLabel()}</Badge>
              </div>
            </CardHeader>
             <CardContent>
                <Separator className="mb-4" />
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Email:</span><span className="font-medium">{formData.email || 'Not provided'}</span></div>
                    <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Phone:</span><span className="font-medium">{formData.phone_number || 'Not provided'}</span></div>
                    {(formData.address) && (
                        <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Address:</span><span className="font-medium">{formData.address}</span></div>
                    )}
                </div>
             </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your personal and professional information</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSubmitting}><X className="h-4 w-4 mr-2" />Cancel</Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  {isEditing ? (
                    <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50"><User className="h-4 w-4 text-muted-foreground" /><span>{formData.full_name || 'Not provided'}</span></div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50"><Mail className="h-4 w-4 text-muted-foreground" /><span>{formData.email || 'Not provided'}</span></div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone</Label>
                   {isEditing ? (
                    <Input id="phone_number" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50"><Phone className="h-4 w-4 text-muted-foreground" /><span>{formData.phone_number || 'Not provided'}</span></div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                   {isEditing ? (
                    <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="e.g., 123 Main St, Arusha" />
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{formData.address || 'Not provided'}</span></div>
                  )}
                </div>
                
                <Separator />

                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Notification Preferences</h3>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
                        <div className="space-y-0.5">
                            <Label className="text-base font-medium">Text Messages (SMS)</Label>
                            <p className="text-sm text-muted-foreground">Receive critical updates and OTPs via SMS.</p>
                        </div>
                        <Switch
                            checked={formData.smsEnabled}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsEnabled: checked }))}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
                        <div className="space-y-0.5">
                            <Label className="text-base font-medium">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive receipts, reports, and detailed alerts via email.</p>
                        </div>
                        <Switch
                            checked={formData.emailEnabled}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailEnabled: checked }))}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <Separator />

                {userType === 'Driver' && renderDriverFields()}
                {userType === 'Employer' && renderEmployerFields()}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
