import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, Calendar, DollarSign, MapPin, FileText, Loader2, PlusCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRegions, useDistricts } from '@/hooks/useLicense';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Job } from '@/types/jobs';
import type { EmployerProfile } from '@/types/auth';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const PostJob = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const employerProfile = profile as EmployerProfile;
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  type PostJobFormData = Omit<Job, 'salary' | 'posted_date'> & {
    salaryMin?: number;
    salaryMax?: number;
  };

  const initialFormData: Partial<PostJobFormData> = {
    job_title: '',
    job_type: 'Full-time',
    region: '',
    district: '',
    minimum_experience_years: 0,
    salaryMin: undefined,
    salaryMax: undefined,
    job_description: '',
    required_skills: [],
    benefits: [],
    required_license_category: [],
    application_deadline: '',
  };
  const [formData, setFormData] = useState<Partial<PostJobFormData>>(initialFormData);
  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const licenseCategories = [
    { id: 'A', label: 'A - Motorcycle' },
    { id: 'B', label: 'B - Car' },
    { id: 'C1', label: 'C1 - Medium Truck' },
    { id: 'C2', label: 'C2 - Medium Bus' },
    { id: 'C3', label: 'C3 - Medium Vehicle with Trailer' },
    { id: 'D', label: 'D - Heavy Bus' },
    { id: 'E', label: 'E - Heavy Truck with Trailer' },
  ];

  const { regions, isLoading: regionsLoading } = useRegions();
  const selectedRegion = useMemo(() => regions.find(r => r.name === formData.region), [regions, formData.region]);
  const { districts, isLoading: districtsLoading } = useDistricts(selectedRegion?.id || '');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'number' ? Number(value) : value }));
  };

  const handleSelectChange = (id: keyof PostJobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (id === 'region') {
      setFormData(prev => ({ ...prev, district: '' }));
    }
  };

  const handleAddItem = (field: 'required_skills' | 'benefits', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({...prev, [field]: [...(prev[field] || []), value.trim()]}));
      if (field === 'required_skills') setNewSkill('');
      if (field === 'benefits') setNewBenefit('');
    }
  };

  const handleRemoveItem = (field: 'required_skills' | 'benefits', index: number) => {
    setFormData(prev => ({...prev, [field]: (prev[field] || []).filter((_: any, i: any) => i !== index)}));
  };

  const handleLicenseCategoryChange = (category: string) => {
    setFormData(prev => {
      const existing = prev.required_license_category || [];
      if (existing.includes(category)) {
        return { ...prev, required_license_category: existing.filter(c => c !== category) };
      } else {
        return { ...prev, required_license_category: [...existing, category] };
      }
    });
  };

  const requiredFields: (keyof PostJobFormData)[] = ['job_title', 'job_type', 'region', 'district', 'job_description', 'application_deadline', 'required_license_category'];
  const isFormValid = useMemo(() => {
    return requiredFields.every(field => formData[field] && (Array.isArray(formData[field]) ? (formData[field] as any[]).length > 0 : true));
  }, [formData]);

  const handleSubmit = async (status: 'Published' | 'Draft') => {
    if (!employerProfile) {
      toast({ title: "Error", description: "Could not load employer profile.", variant: "destructive" });
      return;
    }
    if (status === 'Published' && !isFormValid) {
        toast({ title: "Missing Fields", description: "Please fill all required fields before publishing.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    try {
      const { salaryMin, salaryMax, ...jobData } = formData;
      await addDoc(collection(db, 'jobs'), {
        ...jobData,
        salary: {
            from: salaryMin || 0,
            to: salaryMax || 0
        },
        employerId: employerProfile.userId,
        employerName: employerProfile.company_name,
        posted_date: Timestamp.now(),
        status,
      });
      if (status === 'Published') {
        setShowSuccessModal(true);
      } else {
        toast({ title: "Draft Saved", description: "Your job post has been saved as a draft." });
        navigate('/ajiri-dereva/my-jobs');
      }
    } catch (error) {
      console.error("Error saving job post:", error);
      toast({ title: "Error", description: "Failed to save job post. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => setFormData(initialFormData);

  const formatDeadline = (deadline: string | Timestamp | undefined): string => {
    if (!deadline) return '';
    if (deadline instanceof Timestamp) {
      return deadline.toDate().toISOString().split('T')[0];
    }
    return deadline;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/ajiri-dereva/EmployerDashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Post Job</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Post a Job Vacancy</h1>
          <p className="text-muted-foreground">Chapisha Kazi</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Fill in the details to post your job vacancy. Fields marked with * are required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input id="job_title" value={formData.job_title} onChange={handleInputChange} disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type *</Label>
                <Select onValueChange={(v) => handleSelectChange('job_type', v)} value={formData.job_type} disabled={isSaving}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="region">Location - Region *</Label>
                <Select onValueChange={(v) => handleSelectChange('region', v)} value={formData.region} disabled={isSaving || regionsLoading}>
                  <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                  <SelectContent>
                    {regions.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Select onValueChange={(v) => handleSelectChange('district', v)} value={formData.district} disabled={isSaving || districtsLoading || !formData.region}>
                  <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Salary From (TZS)</Label>
                <Input id="salaryMin" type="number" value={formData.salaryMin} onChange={handleInputChange} disabled={isSaving} placeholder="e.g., 500,000"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Salary To (TZS)</Label>
                <Input id="salaryMax" type="number" value={formData.salaryMax} onChange={handleInputChange} disabled={isSaving} placeholder="e.g., 800,000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minExperience">Minimum Experience (Years)</Label>
                <Input id="minimum_experience_years" type="number" value={formData.minimum_experience_years} onChange={handleInputChange} disabled={isSaving} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline *</Label>
                <Input id="application_deadline" type="date" value={formatDeadline(formData.application_deadline)} onChange={handleInputChange} disabled={isSaving} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>License Category Required *</Label>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {licenseCategories.map(category => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`license-${category.id}`}
                      checked={formData.required_license_category?.includes(category.id)}
                      onCheckedChange={() => handleLicenseCategoryChange(category.id)}
                      disabled={isSaving}
                    />
                    <Label htmlFor={`license-${category.id}`} className="font-normal">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea id="job_description" rows={6} value={formData.job_description} onChange={handleInputChange} disabled={isSaving} />
            </div>

            <div className="space-y-4">
              <Label>Skills Required</Label>
              <div className="flex flex-wrap gap-2">
                {formData.required_skills?.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <XCircle className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveItem('required_skills', i)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g., Defensive Driving" />
                <Button variant="outline" size="icon" onClick={() => handleAddItem('required_skills', newSkill)}><PlusCircle className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Benefits</Label>
              <div className="flex flex-wrap gap-2">
                {formData.benefits?.map((benefit, i) => (
                  <Badge key={i} variant="default" className="flex items-center gap-1">
                    {benefit}
                    <XCircle className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveItem('benefits', i)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} placeholder="e.g., Health Insurance" />
                <Button variant="outline" size="icon" onClick={() => handleAddItem('benefits', newBenefit)}><PlusCircle className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={() => handleSubmit('Draft')} variant="outline" className="flex-1" disabled={isSaving || !formData.job_title}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save as Draft
              </Button>
              <Button onClick={() => handleSubmit('Published')} className="flex-1" disabled={isSaving || !isFormValid}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Publish Job
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Job Posted Successfully!</DialogTitle>
            <DialogDescription>Your job vacancy is now visible to qualified drivers.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setShowSuccessModal(false); resetForm(); }}>
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
