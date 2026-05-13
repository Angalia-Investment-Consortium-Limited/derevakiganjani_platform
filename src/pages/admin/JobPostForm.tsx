import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

// Define a type for the form data that is different from the Job type
// because the form uses strings for skills and benefits.
type JobPostFormData = Omit<Job, 'required_skills' | 'benefits' | 'posted_date' | 'salary'> & {
  required_skills: string;
  benefits: string;
  salaryMin: number;
  salaryMax: number;
};

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
    required_skills: '',
    region: '',
    district: '',
    salaryMin: 0,
    salaryMax: 0,
    benefits: '',
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
      const { required_skills, benefits, posted_date, salary, ...restOfJob } = job;

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
        required_skills: Array.isArray(required_skills) ? required_skills.join(', ') : '',
        benefits: Array.isArray(benefits) ? benefits.join(', ') : '',
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
      required_skills: typeof formData.required_skills === 'string' ? formData.required_skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      benefits: typeof formData.benefits === 'string' ? formData.benefits.split(',').map(b => b.trim()).filter(Boolean) : [],
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
                  {['A', 'A1', 'A2', 'A3', 'B', 'B1', 'C', 'C1', 'C2', 'C3', 'D', 'E'].map(cat => {
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
              <div><Label htmlFor="skills">{t('Skills Requirements')}</Label><Textarea id="skills" value={formData.required_skills || ''} onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })} placeholder={t('Skills Placeholder')} rows={4} /></div>
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
              <div><Label htmlFor="benefits">{t('Benefits')}</Label><Textarea id="benefits" value={formData.benefits || ''} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} placeholder={t('Benefits Placeholder')} rows={3} /></div>
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
