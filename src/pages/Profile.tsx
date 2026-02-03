import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';
import { useState } from 'react';
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
  const { user, profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: (profile as any)?.phone_number || user?.mobile_no || '',
    address: (profile as any)?.address || '',
  });

  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    const names = user.full_name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast({
        title: t('success'),
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone_number: (profile as any)?.phone_number || user?.mobile_no || '',
      address: (profile as any)?.address || '',
    });
    setIsEditing(false);
  };

  const getUserTypeLabel = () => {
    switch (user?.user_type) {
      case 'Driver':
        return 'Driver';
      case 'Employer':
        return 'Employer';
      case 'Admin':
      case 'Staff':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  const getUserTypeBadgeColor = () => {
    switch (user?.user_type) {
      case 'Driver':
        return 'bg-primary/10 text-primary';
      case 'Employer':
        return 'bg-secondary/10 text-secondary';
      case 'Admin':
      case 'Staff':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('myProfile')}</h1>
          <p className="text-muted-foreground mt-1">View and manage your profile information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.user_image} alt={user?.full_name} />
                  <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{user?.full_name}</CardTitle>
                <CardDescription className="mt-1">{user?.email}</CardDescription>
                <Badge className={`mt-3 ${getUserTypeBadgeColor()}`}>
                  {getUserTypeLabel()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user?.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{user?.mobile_no || 'Not provided'}</span>
                </div>
                {(profile as any)?.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium">{(profile as any).address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.full_name || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.email || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{(profile as any)?.phone_number || user?.mobile_no || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter your address"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{(profile as any)?.address || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* User Type Specific Information */}
                {user?.user_type === 'Driver' && profile && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-semibold">Driver Information</h3>
                      {(profile as DriverProfile).national_id && (
                        <div className="space-y-2">
                          <Label>National ID</Label>
                          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                            <span>{(profile as DriverProfile).national_id}</span>
                          </div>
                        </div>
                      )}
                      {(profile as any).status && (
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Badge variant="outline">{(profile as any).status}</Badge>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {user?.user_type === 'Employer' && profile && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-semibold">Company Information</h3>
                      {(profile as EmployerProfile).company_name && (
                        <div className="space-y-2">
                          <Label>Company Name</Label>
                          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                            <span>{(profile as EmployerProfile).company_name}</span>
                          </div>
                        </div>
                      )}
                      {(profile as EmployerProfile).company_registration && (
                        <div className="space-y-2">
                          <Label>Registration Number</Label>
                          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                            <span>{(profile as EmployerProfile).company_registration}</span>
                          </div>
                        </div>
                      )}
                      {(profile as EmployerProfile).verification_status && (
                        <div className="space-y-2">
                          <Label>Verification Status</Label>
                          <Badge variant="outline">{(profile as EmployerProfile).verification_status}</Badge>
                        </div>
                      )}
                    </div>
                  </>
                )}
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
