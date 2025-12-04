import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Calendar, DollarSign, MapPin, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PostJob = () => {
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your job post has been saved as draft.",
    });
  };

  const handlePublish = () => {
    setShowSuccessModal(true);
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
                <Label htmlFor="jobTitle">Job Title *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="jobTitle" placeholder="e.g., Experienced Truck Driver" className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
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
                <Label htmlFor="licenseCategory">License Category Required *</Label>
                <Select>
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulltime">Full-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="parttime">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="positions">Number of Positions *</Label>
                <Input id="positions" type="number" placeholder="e.g., 2" min="1" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range (TZS) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="salary" placeholder="e.g., 500,000 - 800,000" className="pl-10" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Location - Region *</Label>
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
              <Label htmlFor="startDate">Expected Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="startDate" type="date" className="pl-10" />
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea 
                id="requirements" 
                placeholder="List the qualifications, experience, and skills required..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveDraft} variant="outline" className="flex-1">
                Save as Draft
              </Button>
              <Button onClick={handlePublish} className="flex-1">
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
            <Button variant="outline" className="flex-1" onClick={() => setShowSuccessModal(false)}>
              Post Another Job
            </Button>
            <Button className="flex-1" onClick={() => window.location.href = '/ajiri-dereva/my-jobs'}>
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
