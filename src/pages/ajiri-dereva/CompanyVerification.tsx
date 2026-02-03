
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Upload, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import type { EmployerProfile } from '@/types/auth';
import { useRegions, useDistricts } from '@/hooks/useLicense';

const CompanyVerification = () => {
  const { toast } = useToast();
  const { profile, updateProfile, profileLoading } = useAuth();
  const employerProfile = profile as EmployerProfile;
  const { regions, isLoading: regionsLoading } = useRegions();
  const [selectedRegion, setSelectedRegion] = useState('');
  const { districts, isLoading: districtsLoading } = useDistricts(selectedRegion);

  const [formData, setFormData] = useState<Partial<EmployerProfile>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (employerProfile) {
      const initialData = {
        ...employerProfile,
        company_name: employerProfile.company_name || '',
        company_registration: employerProfile.company_registration || '',
        tin_number: employerProfile.tin_number || '',
        business_license_number: employerProfile.business_license_number || '',
        contact_person: employerProfile.contact_person || '',
        contact_person_position: employerProfile.contact_person_position || '',
        phone_number: employerProfile.phone_number || '',
        company_region: employerProfile.company_region || '',
        company_district: employerProfile.company_district || '',
        address: employerProfile.address || '',
      };
      setFormData(initialData);
      if (employerProfile.company_region) {
        setSelectedRegion(employerProfile.company_region);
      }
    }
  }, [employerProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (id === 'company_region') {
      setSelectedRegion(value);
      setFormData(prev => ({ ...prev, company_district: '' })); // Reset district on region change
    }
  };
  
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast({ title: "Draft Saved", description: "Your information has been saved." });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    // Basic validation could be added here
    setShowConfirmModal(true);
  };

  const confirmSubmission = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({ ...formData, verification_status: 'Pending' });
      setShowConfirmModal(false);
      toast({
        title: "Verification Submitted",
        description: "Your company verification request has been submitted for review.",
      });
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast({ title: "Error", description: "Failed to submit for verification.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const verificationStatus = employerProfile?.verification_status || 'Unverified';
  const isEditable = verificationStatus === 'Unverified';

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'Verified':
        return <Badge className="bg-success/10 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'Pending':
        return <Badge className="bg-warning/10 text-warning"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      default:
        return <Badge className="bg-destructive/10 text-destructive"><AlertCircle className="h-3 w-3 mr-1" />Unverified</Badge>;
    }
  };

  if (profileLoading || regionsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Company Verification</h1>
            <p className="text-muted-foreground">Uthibitisho wa Kampuni</p>
          </div>
          {getStatusBadge()}
        </div>

        {verificationStatus === 'Pending' && (
          <Card className="mb-6 border-warning"><CardContent className="pt-6"><div className="flex items-start gap-3"><Clock className="h-5 w-5 text-warning mt-0.5" /><div><p className="font-semibold">Verification Under Review</p><p className="text-sm text-muted-foreground">Your verification documents are being reviewed. This typically takes 2-3 business days.</p></div></div></CardContent></Card>
        )}

        {verificationStatus === 'Verified' && (
          <Card className="mb-6 border-success"><CardContent className="pt-6"><div className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-success mt-0.5" /><div><p className="font-semibold">Company Verified</p><p className="text-sm text-muted-foreground">You can now post jobs and contact drivers.</p></div></div></CardContent></Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Company Information</CardTitle>
            <CardDescription>Complete your company verification to gain access to all features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input id="company_name" value={formData.company_name || ''} onChange={handleInputChange} disabled={!isEditable} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_registration">Registration Number *</Label>
                <Input id="company_registration" value={formData.company_registration || ''} onChange={handleInputChange} disabled={!isEditable} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tin_number">TIN Number *</Label>
                <Input id="tin_number" value={formData.tin_number || ''} onChange={handleInputChange} disabled={!isEditable} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_license_number">Business License Number</Label>
                <Input id="business_license_number" value={formData.business_license_number || ''} onChange={handleInputChange} disabled={!isEditable} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documents">Company Documents *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">{isEditable ? 'Click to upload or drag and drop' : 'Documents submitted'}</p>
                <p className="text-xs text-muted-foreground">Registration Certificate, TIN, Business License (PDF, max 5MB)</p>
                {isEditable && <Button variant="outline" size="sm" className="mt-3"><Upload className="h-4 w-4 mr-2" />Choose Files</Button>}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Contact Person Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="contact_person">Full Name *</Label>
                      <Input id="contact_person" value={formData.contact_person || ''} onChange={handleInputChange} disabled={!isEditable} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="contact_person_position">Position *</Label>
                      <Input id="contact_person_position" value={formData.contact_person_position || ''} onChange={handleInputChange} disabled={!isEditable} />
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number *</Label>
                      <Input id="phone_number" value={formData.phone_number || ''} onChange={handleInputChange} disabled={!isEditable} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" value={employerProfile?.email || ''} disabled />
                  </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Company Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_region">Region *</Label>
                  <Select value={formData.company_region || ''} onValueChange={(v) => handleSelectChange('company_region', v)} disabled={!isEditable || regionsLoading}>
                    <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>
                      {regions.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_district">District *</Label>
                  <Select value={formData.company_district || ''} onValueChange={(v) => handleSelectChange('company_district', v)} disabled={!isEditable || districtsLoading || !selectedRegion}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>
                      {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="address">Physical Address *</Label>
                <Input id="address" value={formData.address || ''} onChange={handleInputChange} disabled={!isEditable} />
              </div>
            </div>

            {isEditable && (
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleSaveDraft} disabled={isSaving || isSubmitting}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Draft
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={isSaving || isSubmitting}>
                  Submit for Verification
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Verification Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit for verification? Please ensure all details are accurate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>Review Again</Button>
            <Button onClick={confirmSubmission} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CompanyVerification;
