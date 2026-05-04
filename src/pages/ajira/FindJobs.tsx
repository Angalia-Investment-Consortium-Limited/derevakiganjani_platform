import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Briefcase, Building2, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '@/hooks/useJobs';
import { useRegions } from '@/hooks/useLicense';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const FindJobs = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({ searchTerm: '', vehicleType: '', licenseCategory: '', region: '', jobType: '' });
  
  // Job Alert State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    vehicleType: 'all',
    licenseCategory: 'all',
    region: 'all',
    jobType: 'all',
    email: true,
    sms: true,
    system: true,
  });

  // Since useJobs expects an array of Filter objects, we map our state to it:
  const jobFilters = useMemo(() => {
    const arr = [];
    if (filters.searchTerm) arr.push({ field: 'job_title', operator: '>=', value: filters.searchTerm });
    if (filters.vehicleType) arr.push({ field: 'vehicleType', operator: '==', value: filters.vehicleType });
    if (filters.licenseCategory) arr.push({ field: 'required_license_category', operator: 'array-contains', value: filters.licenseCategory });
    if (filters.region) arr.push({ field: 'region', operator: '==', value: filters.region });
    if (filters.jobType) arr.push({ field: 'job_type', operator: '==', value: filters.jobType });
    return arr as any;
  }, [filters]);
  
  const { jobs, isLoading: jobsLoading } = useJobs(jobFilters);
  const { regions, isLoading: regionsLoading } = useRegions();
  const [applying, setApplying] = useState<string | null>(null);
  const [savingAlert, setSavingAlert] = useState(false);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleAlertSettingChange = (settingName: string, value: any) => {
    setAlertSettings(prev => ({ ...prev, [settingName]: value }));
  };

  const handleApply = async (jobId: string) => {
    if (!currentUser) {
      toast({ title: 'Error', description: 'You must be logged in to apply.', variant: 'destructive' });
      return;
    }

    setApplying(jobId);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId,
        driverId: currentUser.uid,
        employerId: jobs.find(j => j.id === jobId)?.employerId, 
        status: 'Submitted',
        application_date: Timestamp.now(),
      });
      toast({ title: 'Success', description: 'Application submitted successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit application.', variant: 'destructive' });
    } finally {
      setApplying(null);
    }
  };

  const handleSaveAlert = async () => {
    if (!currentUser) {
      toast({ title: 'Error', description: 'You must be logged in to set a job alert.', variant: 'destructive' });
      return;
    }

    if (!alertSettings.email && !alertSettings.sms && !alertSettings.system) {
      toast({ title: 'Warning', description: 'Please select at least one notification method.', variant: 'destructive' });
      return;
    }

    setSavingAlert(true);
    try {
      await addDoc(collection(db, 'job_alerts'), {
        userId: currentUser.uid,
        filters: {
          vehicleType: alertSettings.vehicleType,
          licenseCategory: alertSettings.licenseCategory,
          region: alertSettings.region,
          jobType: alertSettings.jobType,
        },
        notifications: {
          email: alertSettings.email,
          sms: alertSettings.sms,
          system: alertSettings.system,
        },
        createdAt: Timestamp.now(),
        status: 'active'
      });
      
      toast({ title: 'Success', description: 'Job alert saved successfully!' });
      setIsAlertModalOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save job alert.', variant: 'destructive' });
    } finally {
      setSavingAlert(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Find Driver Jobs</h1>
          <p className="text-muted-foreground">Tafuta Ajira ya Udereva</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Jobs</CardTitle>
            <CardDescription>Narrow down your job search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search jobs..." className="pl-10" onChange={(e) => handleFilterChange('searchTerm', e.target.value)} />
              </div>
              <Select onValueChange={(value) => handleFilterChange('vehicleType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="Car">Car</SelectItem>
                  <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Truck">Truck</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleFilterChange('licenseCategory', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="License Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="A">Category A</SelectItem>
                  <SelectItem value="B">Category B</SelectItem>
                  <SelectItem value="C">Category C</SelectItem>
                  <SelectItem value="D">Category D</SelectItem>
                  <SelectItem value="E">Category E</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleFilterChange('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select onValueChange={(value) => handleFilterChange('jobType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{jobs.length} jobs found</p>
            </div>

            {jobsLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              jobs.map((job) => (
                <Card 
                  key={job.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                  onClick={() => navigate(`/ajira/job/${job.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{job.job_title}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>{job.employerName}</span>
                        </div>
                      </div>
                      <Badge variant="outline">Category {Array.isArray(job.required_license_category) ? job.required_license_category.join(', ') : (job.required_license_category || 'Any')}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{job.region}{job.district ? `, ${job.district}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{job.vehicleType} • {job.job_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{job.salary && typeof job.salary === 'object' && job.salary.from && job.salary.to ? `TZS ${job.salary.from.toLocaleString()} - ${job.salary.to.toLocaleString()}` : typeof job.salary === 'string' ? job.salary : 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Posted {job.posted_date && typeof job.posted_date === 'object' && 'seconds' in job.posted_date ? new Date((job.posted_date as any).seconds * 1000).toLocaleDateString() : typeof job.posted_date === 'string' ? job.posted_date : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-sm text-muted-foreground">
                      </span>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/ajira/job/${job.id}`); }}>
                        View Job Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )))
            }
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Alerts</CardTitle>
                <CardDescription>Get notified about new jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      Set Job Alert
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Set Job Alert</DialogTitle>
                      <DialogDescription>
                        Choose the criteria for jobs you want to be notified about.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Select value={alertSettings.vehicleType} onValueChange={(v) => handleAlertSettingChange('vehicleType', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Vehicle Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Vehicles</SelectItem>
                            <SelectItem value="Car">Car</SelectItem>
                            <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                            <SelectItem value="Bus">Bus</SelectItem>
                            <SelectItem value="Truck">Truck</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={alertSettings.licenseCategory} onValueChange={(v) => handleAlertSettingChange('licenseCategory', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="License Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="A">Category A</SelectItem>
                            <SelectItem value="B">Category B</SelectItem>
                            <SelectItem value="C">Category C</SelectItem>
                            <SelectItem value="D">Category D</SelectItem>
                            <SelectItem value="E">Category E</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={alertSettings.region} onValueChange={(v) => handleAlertSettingChange('region', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            {regions.map(region => (
                              <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select value={alertSettings.jobType} onValueChange={(v) => handleAlertSettingChange('jobType', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Job Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Temporary">Temporary</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-sm font-medium">Notification Methods</h4>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="alert-email" 
                            checked={alertSettings.email} 
                            onCheckedChange={(c) => handleAlertSettingChange('email', !!c)} 
                          />
                          <label htmlFor="alert-email" className="text-sm font-medium leading-none cursor-pointer">
                            Email Notification
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="alert-sms" 
                            checked={alertSettings.sms} 
                            onCheckedChange={(c) => handleAlertSettingChange('sms', !!c)} 
                          />
                          <label htmlFor="alert-sms" className="text-sm font-medium leading-none cursor-pointer">
                            SMS Notification
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="alert-system" 
                            checked={alertSettings.system} 
                            onCheckedChange={(c) => handleAlertSettingChange('system', !!c)} 
                          />
                          <label htmlFor="alert-system" className="text-sm font-medium leading-none cursor-pointer">
                            System Notification
                          </label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAlertModalOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveAlert} disabled={savingAlert}>
                        {savingAlert && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Alert
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profile Completion</span>
                  <span className="font-semibold">85%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: '85%' }} />
                </div>
                <Button className="w-full" variant="outline" onClick={() => navigate('/ajira/profile')}>
                  Complete Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Complete your profile to get better matches</li>
                  <li>• Apply early to increase your chances</li>
                  <li>• Keep your certificates up to date</li>
                  <li>• Check job requirements carefully</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default function FindJobsWrapped() {
  return (
    <ErrorBoundary>
      <FindJobs />
    </ErrorBoundary>
  );
}
