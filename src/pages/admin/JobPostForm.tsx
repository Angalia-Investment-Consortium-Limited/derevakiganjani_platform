import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { useAdminJob, useCreateJob, useUpdateJob } from '@/hooks/useAdminJobs';
import { useLanguage } from '@/contexts/LanguageContext';
import { tanzanianRegions } from '@/lib/regions';
import type { Job } from '@/types/jobs';
import { notificationService } from '@/services/notificationService';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

type JobPostFormData = Omit<Job, 'posted_date' | 'salary'> & {
  salaryMin: number;
  salaryMax: number;
};

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
  { id: 'G', label: 'G - Earth-moving equipment' }
];

const JobPostForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { t } = useLanguage();
  const { toast } = useToast();

  const { job, isLoading: loadingJob, error: loadError } = useAdminJob(id || null);
  const { createJob, loading: creating } = useCreateJob();
  const { updateJob, loading: updating } = useUpdateJob();

  const [formData, setFormData] = useState<Partial<JobPostFormData>>({
    employerId: '',
    job_title: '',
    job_type: 'Full-time',
    positions: 1,
    vehicleType: '',
    required_license_category: [],
    minimum_experience_years: 0,
    required_skills: [],
    skills_required_html: '',
    required_qualification_and_experience: [],
    required_training_and_certification: [],
    how_to_apply: '',
    region: '',
    district: '',
    salaryMin: 0,
    salaryMax: 0,
    benefits: [],
    job_description: '',
    application_deadline: undefined,
    startDate: undefined,
    status: 'Draft'
  });

  const [employers, setEmployers] = useState<{id: string, name: string}[]>([]);
  const [employersLoading, setEmployersLoading] = useState(true);

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'users'), where("roles", "array-contains", "Employer")));
        const empList = snapshot.docs.map(d => ({
          id: d.id,
          name: d.data().company_name || d.data().full_name || d.data().email || d.id
        }));
        // Sort alphabetically by name
        empList.sort((a, b) => a.name.localeCompare(b.name));
        console.log("Admin Job Post: Loaded Employers from DB:", empList);
        setEmployers(empList);
      } catch (err) {
        console.error("Failed to fetch employers", err);
      } finally {
        setEmployersLoading(false);
      }
    };
    fetchEmployers();
  }, []);

  useEffect(() => {
    if (isEditMode && job) {
      const { posted_date, salary, ...restOfJob } = job;

      const formatToYYYYMMDD = (val: any) => {
        if (!val) return '';
        try {
          if (typeof val === 'string') return val.split('T')[0];
          if (val.seconds) return new Date(val.seconds * 1000).toISOString().split('T')[0];
          if (val instanceof Date) return val.toISOString().split('T')[0];
          return new Date(val).toISOString().split('T')[0];
        } catch (e) {
          console.error("Invalid date value:", val);
          return '';
        }
      };

      setFormData({
        ...restOfJob,
        salaryMin: salary?.from || 0,
        salaryMax: salary?.to || 0,
        skills_required_html: restOfJob.skills_required_html || '',
        required_qualification_and_experience: restOfJob.required_qualification_and_experience || [],
        required_training_and_certification: restOfJob.required_training_and_certification || [],
        how_to_apply: restOfJob.how_to_apply || '',
        benefits: [],
        required_skills: [],
        application_deadline: formatToYYYYMMDD(job.application_deadline),
        startDate: formatToYYYYMMDD(job.startDate),
      });
    }
  }, [isEditMode, job]);

  const handleSubmit = async (action: 'draft' | 'published') => {
    if (!formData.job_title || !formData.employerId || !formData.vehicleType || !formData.required_license_category || formData.required_license_category.length === 0 || !formData.region || !formData.job_type || !formData.job_description) {
      toast({ title: t('validationError'), description: t('fillAllRequiredFields'), variant: "destructive" });
      return;
    }

    const status = action === 'published' ? 'Open' : 'Draft';
    const { salaryMin, salaryMax, ...restFormData } = formData;

    const selectedEmployer = employers.find(e => e.id === formData.employerId);

    const jobData: Partial<Job> = {
      ...restFormData,
      company_name: selectedEmployer?.name || 'Unknown',
      salary: { from: salaryMin || 0, to: salaryMax || 0 },
      skills_required_html: formData.skills_required_html || '',
      required_qualification_and_experience: formData.required_qualification_and_experience || [],
      required_training_and_certification: formData.required_training_and_certification || [],
      how_to_apply: formData.how_to_apply || '',
      benefits: [],
      required_skills: [],
      status
    };

    try {
      if (isEditMode && id) {
        await updateJob({ id, ...jobData });
      } else {
        await createJob(jobData);
      }

      // Notify the Employer
      try {
        if (formData.employerId) {
          const employerDoc = await getDoc(doc(db, 'employer_profiles', formData.employerId));
          let employerEmail = null;
          if (employerDoc.exists()) {
            employerEmail = employerDoc.data().email || employerDoc.data().registration_email;
          }

          const actionVerb = action === 'published' ? 'approved and published' : 'saved as draft';
          const message = `Your job post for "${formData.job_title}" has been ${actionVerb}.`;

          await notificationService.sendSystem(formData.employerId, 'Job Post Updated', message, { jobId: id || 'new' });

          if (employerEmail) {
            await notificationService.sendEmail(
              employerEmail,
              `Job Post ${action === 'published' ? 'Published' : 'Updated'}`,
              message,
              formData.employerId
            );
          }
        }
      } catch (notifErr) {
        console.error('Failed to notify employer:', notifErr);
      }

      const toastAction = action === 'published' ? t('published') : t('savedAsDraft');
      toast({ title: t('success'), description: `${t('jobPost')} ${toastAction} ${t('successfully')}` });
      navigate('/admin/job-management');
    } catch (err: any) {
      toast({ title: t('error'), description: err.message || t('failedToSaveJobPost'), variant: 'destructive' });
    }
  };

  const isSubmitting = creating || updating;

  return (
    <AdminLayout>
      <Button variant="ghost" onClick={() => navigate('/admin/job-management')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('Back To Job Posts')}
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{isEditMode ? t('Edit Job Post') : t('Create New Job Post')}</h1>
        <p className="text-muted-foreground">{isEditMode ? t('Update Job Post Details') : t('Fill Job Post Details')}</p>
      </div>

      {loadingJob && <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto my-16" />}
      {loadError && <p className="text-destructive text-center">{loadError}</p>}

      {!loadingJob && !loadError && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('Employer And Role')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="employer">{t('Employer')} *</Label>
                <Select disabled={employersLoading} value={formData.employerId || ''} onValueChange={(val) => setFormData({ ...formData, employerId: val })}>
                  <SelectTrigger id="employer" className="w-full">
                    <SelectValue placeholder={employersLoading ? t('Loading Employers...') : t('Select Or SearchEmployer')} />
                  </SelectTrigger>
                  <SelectContent>
                    {employers.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="jobTitle">{t('Job Title')} *</Label><Input id="jobTitle" value={formData.job_title || ''} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} placeholder={t('Job Title Placeholder')} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobType">{t('Job Type')} *</Label>
                  <Select value={formData.job_type || ''} onValueChange={(value) => setFormData({ ...formData, job_type: value as Job['job_type'] })}><SelectTrigger id="jobType"><SelectValue placeholder={t('Select Job Type')} /></SelectTrigger><SelectContent><SelectItem value="Full-time">{t('fullTime')}</SelectItem><SelectItem value="Contract">{t('contract')}</SelectItem><SelectItem value="Temporary">{t('temporary')}</SelectItem></SelectContent></Select>
                </div>
                <div><Label htmlFor="positions">{t('Number Of Positions')} *</Label><Input id="positions" type="number" min="1" value={formData.positions || 1} onChange={(e) => setFormData({ ...formData, positions: parseInt(e.target.value) || 1 })} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('Requirements')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vehicleType">{t('Vehicle Type')} *</Label>
                <Select value={formData.vehicleType || ''} onValueChange={(value) => setFormData({ ...formData, vehicleType: value as Job['vehicleType'] })}><SelectTrigger id="vehicleType"><SelectValue placeholder={t('Select Vehicle Type')} /></SelectTrigger><SelectContent><SelectItem value="car">{t('car')}</SelectItem><SelectItem value="motorcycle">{t('motorcycle')}</SelectItem><SelectItem value="bus">{t('bus')}</SelectItem><SelectItem value="truck">{t('truck')}</SelectItem><SelectItem value="other">{t('other')}</SelectItem></SelectContent></Select>
              </div>
              <div>
                <Label className="mb-2 block">{t('License Category (Select all that apply)')}</Label>
                <div className="flex flex-wrap gap-3">
                  {licenseCategories.map(catObj => {
                    const cat = catObj.id;
                    const isSelected = (formData.required_license_category || []).includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                             const current = formData.required_license_category || [];
                             if (!isSelected) {
                                 setFormData({ ...formData, required_license_category: [...current, cat] });
                             } else {
                                 setFormData({ ...formData, required_license_category: current.filter(c => c !== cat) });
                             }
                        }}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center font-semibold text-sm transition-colors ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                            : 'bg-background text-foreground border-border hover:bg-muted'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div><Label htmlFor="minExperience">{t('Minimum Experience Years')}</Label><Input id="minExperience" type="number" min="0" value={formData.minimum_experience_years || 0} onChange={(e) => setFormData({ ...formData, minimum_experience_years: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2">
                <Label>Required Qualification and Experience</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {qualificationsOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`qual-${option}`}
                        checked={formData.required_qualification_and_experience?.includes(option)}
                        onCheckedChange={() => {
                          const current = formData.required_qualification_and_experience || [];
                          if (current.includes(option)) setFormData({ ...formData, required_qualification_and_experience: current.filter(c => c !== option) });
                          else setFormData({ ...formData, required_qualification_and_experience: [...current, option] });
                        }}
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
                        onCheckedChange={() => {
                          const current = formData.required_training_and_certification || [];
                          if (current.includes(option)) setFormData({ ...formData, required_training_and_certification: current.filter(c => c !== option) });
                          else setFormData({ ...formData, required_training_and_certification: [...current, option] });
                        }}
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
                    onChange={(content) => setFormData({ ...formData, skills_required_html: content })} 
                    className="min-h-[150px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="howToApply">How to Apply (Optional)</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, how_to_apply: v })} value={formData.how_to_apply || ''}>
                  <SelectTrigger><SelectValue placeholder="Select how candidates should apply" /></SelectTrigger>
                  <SelectContent>
                    {howToApplyOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('Location And Compensation')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region">{t('Region')} *</Label>
                  <Select value={formData.region || ''} onValueChange={(value) => setFormData({ ...formData, region: value })}><SelectTrigger id="region"><SelectValue placeholder={t('Select Region')} /></SelectTrigger><SelectContent>{tanzanianRegions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
                </div>
                <div><Label htmlFor="district">{t('District')} *</Label><Input id="district" value={formData.district || ''} onChange={(e) => setFormData({ ...formData, district: e.target.value })} placeholder={t('Enter District')} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="salaryMin">{t('Minimum Salary')}</Label><Input id="salaryMin" value={String(formData.salaryMin || 0)} onChange={(e) => setFormData({ ...formData, salaryMin: parseInt(e.target.value) || 0 })} placeholder="e.g., 500000" /></div>
                <div><Label htmlFor="salaryMax">{t('Maximum Salary')}</Label><Input id="salaryMax" value={String(formData.salaryMax || 0)} onChange={(e) => setFormData({ ...formData, salaryMax: parseInt(e.target.value) || 0 })} placeholder="e.g., 800000" /></div>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('Description And Dates')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="description">{t('Job Summary')} *</Label><Textarea id="description" value={formData.job_description || ''} onChange={(e) => setFormData({ ...formData, job_description: e.target.value })} placeholder={t('Job Summary Placeholder')} rows={6} /></div>
              
              <div>
                <Label htmlFor="responsibilities">{t('Job Responsibilities')}</Label>
                <Textarea 
                  id="responsibilities" 
                  value={formData.responsibilities ? (Array.isArray(formData.responsibilities) ? formData.responsibilities.join('\n') : formData.responsibilities) : ''} 
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })} 
                  placeholder="List responsibilities using bullet points. For example: Qualification and experience, Required training and certification etc." 
                  rows={6} 
                />
              </div>

              <div>
                <Label htmlFor="application_link">{t('External Application Link (Optional)')}</Label>
                <Input 
                  id="application_link" 
                  type="url"
                  value={formData.application_link as string || ''} 
                  onChange={(e) => setFormData({ ...formData, application_link: e.target.value })} 
                  placeholder="https://yourcompany.com/careers/apply" 
                />
                <p className="text-xs text-muted-foreground mt-1">If provided, drivers will be redirected to this link to apply instead of applying within the MDV platform.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="deadline">{t('Application Deadline')}</Label><Input id="deadline" type="date" value={formData.application_deadline as string || ''} onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })} /></div>
                <div><Label htmlFor="startDate">{t('Start Date (Optional)')}</Label><Input id="startDate" type="date" value={formData.startDate as string || ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 bg-background border-t p-4 flex gap-4 justify-end">
            <Button variant="outline" onClick={() => navigate('/admin/job-management')} disabled={isSubmitting}>{t('Cancel')}</Button>
            <Button variant="secondary" onClick={() => handleSubmit('draft')} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} {t('Save As Draft')}</Button>
            <Button onClick={() => handleSubmit('published')} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />} {t('Publish')}</Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default JobPostForm;
