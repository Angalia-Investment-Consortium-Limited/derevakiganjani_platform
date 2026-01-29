import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  vehicleType: z.string().nonempty('Vehicle type is required'),
  licenseRequired: z.string().nonempty('License category is required'),
  location: z.string().nonempty('Location is required'),
  jobType: z.string().nonempty('Job type is required'),
  salary: z.string().nonempty('Salary is required'),
});

const CreateJob = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      vehicleType: '',
      licenseRequired: '',
      location: '',
      jobType: '',
      salary: '',
    }
  });

  const onSubmit = async (data: z.infer<typeof jobSchema>) => {
    if (!currentUser) {
      toast({ title: 'Error', description: 'You must be logged in to post a job.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        ...data,
        employerId: currentUser.uid,
        employerName: currentUser.displayName || 'Anonymous Employer',
        postedOn: serverTimestamp(),
        status: 'Open',
      });
      toast({ title: 'Success!', description: 'Your job has been posted.' });
      navigate('/ajira/employer/dashboard');
    } catch (error) {
      console.error("Error posting job:", error);
      toast({ title: 'Error', description: 'There was a problem posting your job.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Post a New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label>Job Title</label>
                <Controller name="title" control={control} render={({ field }) => <Input {...field} />} />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label>Job Description</label>
                <Controller name="description" control={control} render={({ field }) => <Textarea {...field} rows={6} />} />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label>Vehicle Type</label>
                  <Controller
                    name="vehicleType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select Vehicle Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Car">Car</SelectItem>
                          <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="Bus">Bus</SelectItem>
                          <SelectItem value="Truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType.message}</p>}
                </div>
                <div>
                  <label>License Category Required</label>
                  <Controller
                    name="licenseRequired"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select License" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.licenseRequired && <p className="text-red-500 text-sm mt-1">{errors.licenseRequired.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label>Location (Region)</label>
                      <Controller name="location" control={control} render={({ field }) => <Input {...field} />} />
                      {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                  </div>
                  <div>
                      <label>Job Type</label>
                      <Controller
                          name="jobType"
                          control={control}
                          render={({ field }) => (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger><SelectValue placeholder="Select Job Type" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="Full-time">Full-time</SelectItem>
                                      <SelectItem value="Contract">Contract</SelectItem>
                                      <SelectItem value="Temporary">Temporary</SelectItem>
                                      <SelectItem value="Part-time">Part-time</SelectItem>
                                  </SelectContent>
                              </Select>
                          )}
                      />
                      {errors.jobType && <p className="text-red-500 text-sm mt-1">{errors.jobType.message}</p>}
                  </div>
              </div>

              <div>
                  <label>Salary (TZS per month)</label>
                  <Controller name="salary" control={control} render={({ field }) => <Input {...field} placeholder="e.g., 500,000" />} />
                  {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary.message}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Job
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CreateJob;
