import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Upload, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CompanyVerification = () => {
  const { toast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');

  const handleSubmit = () => {
    setShowConfirmModal(true);
  };

  const confirmSubmission = () => {
    // TODO: API call to submit verification
    setVerificationStatus('pending');
    setShowConfirmModal(false);
    toast({
      title: "Verification Submitted",
      description: "Your company verification request has been submitted for review.",
    });
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge className="bg-success/10 text-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-warning/10 text-warning">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      default:
        return (
          <Badge className="bg-destructive/10 text-destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unverified
          </Badge>
        );
    }
  };

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

        {verificationStatus === 'pending' && (
          <Card className="mb-6 border-warning">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-semibold">Verification Under Review</p>
                  <p className="text-sm text-muted-foreground">
                    Your verification documents are being reviewed by our team. This typically takes 2-3 business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {verificationStatus === 'verified' && (
          <Card className="mb-6 border-success">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-semibold">Company Verified</p>
                  <p className="text-sm text-muted-foreground">
                    Your company has been successfully verified. You can now post jobs and contact drivers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Complete your company verification to gain access to all features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input 
                  id="companyName" 
                  placeholder="ABC Transport Ltd" 
                  defaultValue="ABC Transport Ltd"
                  disabled={verificationStatus !== 'unverified'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regNumber">Registration Number *</Label>
                <Input 
                  id="regNumber" 
                  placeholder="REG-12345-2023" 
                  disabled={verificationStatus !== 'unverified'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tin">TIN Number *</Label>
                <Input 
                  id="tin" 
                  placeholder="123-456-789" 
                  disabled={verificationStatus !== 'unverified'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Business License Number</Label>
                <Input 
                  id="licenseNumber" 
                  placeholder="BL-2023-456" 
                  disabled={verificationStatus !== 'unverified'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documents">Company Documents *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  {verificationStatus === 'unverified' ? 'Click to upload or drag and drop' : 'Documents submitted'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Registration Certificate, TIN Certificate, Business License (PDF, max 5MB each)
                </p>
                {verificationStatus === 'unverified' && (
                  <Button variant="outline" size="sm" className="mt-3">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Contact Person Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Full Name *</Label>
                  <Input 
                    id="contactName" 
                    placeholder="John Doe" 
                    disabled={verificationStatus !== 'unverified'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input 
                    id="position" 
                    placeholder="HR Manager" 
                    disabled={verificationStatus !== 'unverified'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    placeholder="+255 712 345 678" 
                    disabled={verificationStatus !== 'unverified'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="contact@company.com" 
                    disabled={verificationStatus !== 'unverified'}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Company Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select disabled={verificationStatus !== 'unverified'}>
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select disabled={verificationStatus !== 'unverified'}>
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

              <div className="space-y-2 mt-4">
                <Label htmlFor="address">Physical Address *</Label>
                <Input 
                  id="address" 
                  placeholder="Street, Building, Floor" 
                  disabled={verificationStatus !== 'unverified'}
                />
              </div>
            </div>

            {verificationStatus === 'unverified' && (
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1">
                  Save Draft
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
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
              Are you sure you want to submit your company information for verification? 
              Please ensure all details are accurate as changes cannot be made while under review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Review Again
            </Button>
            <Button onClick={confirmSubmission}>
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
