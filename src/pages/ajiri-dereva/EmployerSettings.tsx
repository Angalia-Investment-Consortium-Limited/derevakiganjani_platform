import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Building2, Bell, Lock, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const EmployerSettings = () => {
  const { toast } = useToast();
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    contactPerson: '',
    position: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    smsEnabled: true,
    emailEnabled: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: (profile as any).company_name || '',
        industry: (profile as any).industry || '',
        contactPerson: (profile as any).contactPerson || '',
        position: (profile as any).position || '',
        email: (profile as any).company_email || user?.email || '',
        phone: (profile as any).company_phone || (user as any)?.mobile_no || '',
        website: (profile as any).website || '',
        description: (profile as any).description || '',
        smsEnabled: (profile as any).notificationPreferences?.smsEnabled !== false,
        emailEnabled: (profile as any).notificationPreferences?.emailEnabled !== false,
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        company_name: formData.companyName,
        industry: formData.industry,
        contactPerson: formData.contactPerson,
        position: formData.position,
        company_email: formData.email,
        company_phone: formData.phone,
        website: formData.website,
        description: formData.description,
        notificationPreferences: {
          smsEnabled: formData.smsEnabled,
          emailEnabled: formData.emailEnabled,
        }
      });
      await refreshProfile();
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to save settings.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Employer Settings</h1>
          <p className="text-muted-foreground">Mipangilio ya Mwajiri</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <Building2 className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Manage your company information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" value={formData.companyName} onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" value={formData.industry} onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input id="contactPerson" value={formData.contactPerson} onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" value={formData.position} onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Company Website</Label>
                  <Input id="website" value={formData.website} onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))} placeholder="https://www.company.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Input id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Brief description of your company" />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
                     <div className="space-y-0.5">
                         <Label className="text-base font-medium">Text Messages (SMS)</Label>
                         <p className="text-sm text-muted-foreground">Receive critical updates and OTPs via SMS.</p>
                     </div>
                     <Switch
                         checked={formData.smsEnabled}
                         onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsEnabled: checked }))}
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
                     />
                 </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Change Password</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <PasswordInput id="currentPassword" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <PasswordInput id="newPassword" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <PasswordInput id="confirmPassword" />
                  </div>

                  <Button>Update Password</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactor">Enable 2FA</Label>
                      <p className="text-sm text-muted-foreground">
                        Require a code in addition to your password
                      </p>
                    </div>
                    <Switch id="twoFactor" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Active Sessions</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your active sessions across different devices
                  </p>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">
                          Chrome on Windows • Dar es Salaam, Tanzania
                        </p>
                      </div>
                      <Badge className="bg-success/10 text-success">Active</Badge>
                    </div>
                  </div>

                  <Button variant="outline">Log Out All Other Sessions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default EmployerSettings;
