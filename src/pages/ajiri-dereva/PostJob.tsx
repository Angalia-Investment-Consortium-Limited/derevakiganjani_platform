import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Calendar, DollarSign, MapPin, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRegions } from '@/hooks/useLicense';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PostJob = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { regions } = useRegions();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    vehicleType: '', 
    licenseRequired: '', 
    jobType: '', 
    positions: 1, 
    salary: '', 
    location: '', 
    district: '', 
    startDate: '', 
    description: '', 
    requirements: '', 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (status: 'Published' | 'Draft') => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to post a job.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        ...formData,
        employerId: currentUser.uid,
        employerName: currentUser.displayName, // Assumes displayName is available
        postedOn: Timestamp.now(),
        status,
        requirements: formData.requirements.split('\n'), // Split requirements into an array
      });
      if (status === 'Published') {
        setShowSuccessModal(true);
      } else {
        toast({
          title: "Draft Saved",
          description: "Your job post has been saved as a draft.",
        });
        navigate('/ajiri-dereva/my-jobs');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save job post.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Post a Job Vacancy</h1>
          <p className="text-muted-foreground">Chapisha Kazi</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Fill in the details to post your job vacancy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="title" placeholder="e.g., Experienced Truck Driver" className="pl-10" value={formData.title} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Select onValueChange={(value) => handleSelectChange('vehicleType', value)} value={formData.vehicleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Trailer">Trailer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseRequired">License Category Required *</Label>
                <Select onValueChange={(value) => handleSelectChange('licenseRequired', value)} value={formData.licenseRequired}>
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

              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type *</Label>
                <Select onValueChange={(value) => handleSelectChange('jobType', value)} value={formData.jobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="positions">Number of Positions *</Label>
                <Input id="positions" type="number" placeholder="e.g., 2" min="1" value={formData.positions} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range (TZS) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="salary" placeholder="e.g., 500,000 - 800,000" className="pl-10" value={formData.salary} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location - Region *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select onValueChange={(value) => handleSelectChange('location', value)} value={formData.location}>
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
                <Label htmlFor="district">District *</Label>
                 <Input id="district" placeholder="e.g., Kinondoni" value={formData.district} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Expected Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="startDate" type="date" className="pl-10" value={formData.startDate} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea 
                  id="description" 
                  placeholder="Describe the job role, responsibilities, and working conditions..."
                  rows={5}
                  className="pl-10 pt-3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements * (one per line)</Label>
              <Textarea 
                id="requirements" 
                placeholder="List the qualifications, experience, and skills required..."
                rows={4}
                value={formData.requirements}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => handleSubmit('Draft')} variant="outline" className="flex-1" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save as Draft
              </Button>
              <Button onClick={() => handleSubmit('Published')} className="flex-1" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Publish Job
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Job Posted Successfully!</DialogTitle>
            <DialogDescription>
              Your job vacancy has been published and is now visible to qualified drivers.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setShowSuccessModal(false); setFormData({ title: '', vehicleType: '', licenseRequired: '', jobType: '', positions: 1, salary: '', location: '', district: '', startDate: '', description: '', requirements: '' }); }}>
              Post Another Job
            </Button>
            <Button className="flex-1" onClick={() => navigate('/ajiri-dereva/my-jobs')}>
              View My Jobs
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PostJob;
