import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, Calendar, DollarSign, MapPin, FileText, Loader2, PlusCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRegions, useDistricts } from '@/hooks/useLicense';
import { collection, addDoc, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { notificationService } from '@/services/notificationService';
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
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  type PostJobFormData = Omit<Job, 'salary' | 'posted_date'> & {
    salaryMin?: number;
    salaryMax?: number;
    job_industry_specified?: string;
  };

  const jobIndustries = [
    "Transportation & Logistics",
    "Construction",
    "Agriculture",
    "Tourism & Hospitality",
    "Manufacturing",
    "Retail & Trade",
    "Public Sector",
    "Others"
  ];

  const initialFormData: Partial<PostJobFormData> = {
    job_title: '',
    job_type: 'Full-time',
    region: '',
    district: '',
    minimum_experience_years: 0,
    salaryMin: undefined,
    salaryMax: undefined,
    job_description: '',
    responsibilities: '',
    application_link: '',
    required_skills: [],
    skills_required_html: '',
    benefits: [],
    required_license_category: [],
    required_qualification_and_experience: [],
    required_training_and_certification: [],
    how_to_apply: '',
    application_deadline: '',
    job_industry: '',
    job_industry_specified: '',
  };
  const [formData, setFormData] = useState<Partial<PostJobFormData>>(initialFormData);
  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  useEffect(() => {
    if (editId) {
      const fetchJob = async () => {
        try {
          const docRef = doc(db, 'jobs', editId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Job;
            const fetchedData: Partial<PostJobFormData> = {
              job_title: data.job_title || '',
              job_type: data.job_type || 'Full-time',
              region: data.region || '',
              district: data.district || '',
              minimum_experience_years: data.minimum_experience_years || 0,
              salaryMin: data.salary?.from || 0,
              salaryMax: data.salary?.to || 0,
              job_description: data.job_description || '',
              responsibilities: data.responsibilities ? (Array.isArray(data.responsibilities) ? data.responsibilities.join('\n') : data.responsibilities) : '',
              application_link: data.application_link || '',
              required_skills: data.required_skills || [],
              skills_required_html: data.skills_required_html || '',
              benefits: data.benefits || [],
              required_license_category: data.required_license_category || [],
              required_qualification_and_experience: data.required_qualification_and_experience || [],
              required_training_and_certification: data.required_training_and_certification || [],
              how_to_apply: data.how_to_apply || '',
              application_deadline: data.application_deadline || '',
              job_industry: (data.job_industry && !jobIndustries.includes(data.job_industry)) ? 'Others' : (data.job_industry || ''),
              job_industry_specified: (data.job_industry && !jobIndustries.includes(data.job_industry)) ? data.job_industry : '',
            };
            setFormData(fetchedData);
          }
        } catch (e) {
          console.error(e);
          toast({ title: 'Error', description: 'Failed to load job details.', variant: 'destructive' });
        }
      };
      fetchJob();
    }
  }, [editId, toast]);

  const licenseCategories = [
    { id: 'A', label: 'A - Motorcycles' },
    { id: 'A1', label: 'A1 - Motor tricycle' },
    { id: 'A2', label: 'A2 - Light motorcycle' },
    { id: 'A3', label: 'A3 - Motorcycle (disable)' },
    { id: 'B', label: 'B - Light vehicles' },
    { id: 'B1', label: 'B1 - Light vehicle (disable)' },
    { id: 'C', label: 'C - Trucks' },
    { id: 'C1', label: 'C1 - Medium trucks' },
    { id: 'C2', label: 'C2 - Medium buses' },
    { id: 'C3', label: 'C3 - Medium vehicle with trailer' },
    { id: 'D', label: 'D - Heavy buses' },
    { id: 'E', label: 'E - Heavy trucks with trailer' },
    { id: 'F', label: 'F - Tractors' },
    { id: 'G', label: 'G - Earth-moving equipment' },
  ];

  const qualificationsOptions = [
    "Primary Education (STD VII)",
    "Secondary Education (Form IV)",
    "Advance Secondary Education (Form VI)",
    "Certificate",
    "Diploma",
    "Advance Diploma",
    "Bachelor's Degree",
    "Valid driver’s license with clean records",
    "Experience in driving heavy goods vehicles",
    "Experience in driving light vehicles",
    "Experience in driving buses"
  ];

  const trainingOptions = [
    "VIP grade II certificate from NIT",
    "VIP grade I certificate from NIT",
    "Senior Driver certificate from NIT",
    "PSV certificate from NIT",
    "PSV certificate from VETA",
    "PSV certificate from NIT or VETA",
    "An HGV certificate from NIT",
    "An HGV certificate from VETA",
    "An HGV certificate from NIT or VETA",
    "Defensive Driving Certificate",
    "GCLA Certificate",
    "Knowledge of Four-Wheel Drive (4WD) System",
    "Knowledge of First Aid and CPR procedures",
    "OSHA Fit for Job test report/certificate",
    "LATRA certification",
    "Travel Passport/National ID"
  ];

  const howToApplyOptions = [
    "Clicking this link to apply (directs driver to the employer’s platform)",
    "Attach CV to apply",
    "Use the driver job profile to apply"
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

  const handleMultiSelectChange = (field: 'required_qualification_and_experience' | 'required_training_and_certification', value: string) => {
    setFormData(prev => {
      const existing = prev[field] || [];
      if (existing.includes(value)) {
        return { ...prev, [field]: existing.filter((v: string) => v !== value) };
      } else {
        return { ...prev, [field]: [...existing, value] };
      }
    });
  };

  const requiredFields: (keyof PostJobFormData)[] = ['job_title', 'job_type', 'region', 'district', 'job_description', 'application_deadline', 'required_license_category', 'job_industry'];
  const isFormValid = useMemo(() => {
    return requiredFields.every(field => formData[field] && (Array.isArray(formData[field]) ? (formData[field] as any[]).length > 0 : true)) &&
      (formData.job_industry === 'Others' ? !!formData.job_industry_specified : true);
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
      const { salaryMin, salaryMax, job_industry_specified, ...jobData } = formData;
      const finalIndustry = jobData.job_industry === 'Others' ? job_industry_specified : jobData.job_industry;
      const jobPayload = {
        ...jobData,
        job_industry: finalIndustry,
        salary: {
            from: salaryMin || 0,
            to: salaryMax || 0
        },
        employerId: employerProfile.userId,
        employerName: employerProfile.company_name,
        status,
      };

      if (editId) {
        await updateDoc(doc(db, 'jobs', editId), jobPayload);
      } else {
        await addDoc(collection(db, 'jobs'), {
          ...jobPayload,
          posted_date: Timestamp.now(),
        });
      }
      
      if (status === 'Published') {
          const verb = editId ? "updated" : "published";
          try {
             await notificationService.sendSystem(employerProfile.userId, `Job ${verb}`, `Your job post '${jobPayload.job_title}' has been successfully ${verb}.`, { jobId: editId || "" });
             if (employerProfile.company_email) {
                 await notificationService.sendEmail(employerProfile.company_email, `Job ${verb}`, `Hello ${employerProfile.company_name}, your job post '${jobPayload.job_title}' is now ${verb} and visible.`, employerProfile.userId);
             }
             
             // Send system-wide alert to all drivers
             if (!editId) {
               await notificationService.sendSystem('ALL_DRIVERS', `New Job Alert: ${jobPayload.job_title}`, `${employerProfile.company_name} is looking for a driver. Tap to view details and apply!`, { jobId: jobPayload.job_title, isGlobal: true });
             }
          } catch(e) { console.error("Notification fail: ", e) }
      }

      if (status === 'Published') {
        setShowSuccessModal(true);
      } else {
        toast({ title: "Draft Saved", description: "Your job post has been saved as a draft." });
        navigate('/employer/jobs');
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
            <BreadcrumbItem><BreadcrumbLink href="/employer/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
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
                <Label htmlFor="jobIndustry">Job Industry *</Label>
                <Select onValueChange={(v) => handleSelectChange('job_industry', v)} value={formData.job_industry} disabled={isSaving}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {jobIndustries.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {formData.job_industry === 'Others' && (
                <div className="space-y-2">
                  <Label htmlFor="job_industry_specified">Specify Industry *</Label>
                  <Input id="job_industry_specified" value={formData.job_industry_specified} onChange={handleInputChange} disabled={isSaving} placeholder="Enter custom industry" />
                </div>
              )}
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
              <Label htmlFor="description">Job Summary *</Label>
              <Textarea id="job_description" rows={6} value={formData.job_description} onChange={handleInputChange} disabled={isSaving} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Job Responsibilities</Label>
              <Textarea 
                id="responsibilities" 
                rows={6} 
                value={formData.responsibilities as string || ''} 
                onChange={handleInputChange} 
                disabled={isSaving} 
                placeholder="List responsibilities using bullet points (e.g. -, *, or numbers). For example: Qualification and experience, Required training and certification etc." 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="application_link">External Application Link (Optional)</Label>
              <Input 
                id="application_link" 
                type="url" 
                value={formData.application_link as string || ''} 
                onChange={handleInputChange} 
                disabled={isSaving} 
                placeholder="https://yourcompany.com/careers/apply" 
              />
              <p className="text-xs text-muted-foreground">If provided, drivers will be redirected to this link to apply instead of applying within the MDV platform.</p>
            </div>

            <div className="space-y-2">
              <Label>Required Qualification and Experience</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {qualificationsOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`qual-${option}`}
                      checked={formData.required_qualification_and_experience?.includes(option)}
                      onCheckedChange={() => handleMultiSelectChange('required_qualification_and_experience', option)}
                      disabled={isSaving}
                    />
                    <Label htmlFor={`qual-${option}`} className="font-normal text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Required Training and Certification</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {trainingOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`train-${option}`}
                      checked={formData.required_training_and_certification?.includes(option)}
                      onCheckedChange={() => handleMultiSelectChange('required_training_and_certification', option)}
                      disabled={isSaving}
                    />
                    <Label htmlFor={`train-${option}`} className="font-normal text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills Required</Label>
              <div className="bg-background rounded-md border">
                <ReactQuill 
                  theme="snow" 
                  value={formData.skills_required_html || ''} 
                  onChange={(content) => setFormData(prev => ({...prev, skills_required_html: content}))} 
                  readOnly={isSaving}
                  className="min-h-[150px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="howToApply">How to Apply (Optional)</Label>
              <Select onValueChange={(v) => handleSelectChange('how_to_apply', v)} value={formData.how_to_apply || ''} disabled={isSaving}>
                <SelectTrigger><SelectValue placeholder="Select how candidates should apply" /></SelectTrigger>
                <SelectContent>
                  {howToApplyOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button className="flex-1" onClick={() => navigate('/employer/jobs')}>
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
