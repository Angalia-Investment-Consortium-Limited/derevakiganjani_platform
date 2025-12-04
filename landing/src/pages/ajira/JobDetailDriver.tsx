import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, DollarSign, Calendar, Building2, Award, Users, Clock, BookmarkPlus, MessageCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const JobDetailDriver = () => {
  const navigate = useNavigate();
  const { jobId: _jobId } = useParams();
  const { toast } = useToast();

  const jobDetails = {
    title: 'Experienced Truck Driver',
    employer: 'ABC Transport Ltd',
    employerType: 'Transport Company',
    location: 'Dar es Salaam, Kinondoni',
    vehicleType: 'Truck',
    licenseRequired: 'D',
    jobType: 'Full-time',
    positions: 2,
    salary: '500,000 - 800,000 TZS',
    startDate: '2025-02-01',
    postedOn: '2025-01-20',
    deadline: '2025-01-31',
    applications: 8,
    description: `We are seeking experienced truck drivers for our logistics operations across Tanzania. The successful candidate will be responsible for transporting goods safely and efficiently while maintaining accurate records and adhering to traffic regulations.

Key Responsibilities:
• Safely operate heavy trucks across various routes
• Conduct pre-trip and post-trip vehicle inspections
• Maintain accurate delivery records and documentation
• Ensure cargo is properly secured before transit
• Communicate effectively with dispatch and customers`,
    requirements: `• Valid Category D driving license
• Minimum 3 years of truck driving experience
• Clean driving record with no major violations
• Good knowledge of road safety regulations
• Ability to work flexible hours and overnight trips
• Physical fitness for loading/unloading assistance
• Basic mechanical knowledge for minor repairs
• Good communication skills in Swahili and English`,
    benefits: `• Competitive salary with overtime pay
• Medical insurance coverage
• Paid annual leave
• Performance bonuses
• Career growth opportunities
• Training and development programs`,
  };

  const handleApply = () => {
    toast({
      title: "Application Submitted",
      description: "Your application has been sent to the employer.",
    });
    navigate('/ajira/applications');
  };

  const handleSaveJob = () => {
    toast({
      title: "Job Saved",
      description: "This job has been added to your saved jobs.",
    });
  };

  const handleContact = () => {
    const whatsappNumber = '255700000000'; // placeholder
    window.open(`https://wa.me/${whatsappNumber}?text=Hello, I'm interested in the ${jobDetails.title} position`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <Button variant="outline" onClick={() => navigate('/ajira/jobs')} className="mb-6">
          ← Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{jobDetails.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{jobDetails.employer}</span>
                      <span>•</span>
                      <span>{jobDetails.employerType}</span>
                    </div>
                    <CardDescription>Posted on {jobDetails.postedOn}</CardDescription>
                  </div>
                  <Badge className="bg-success/10 text-success">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{jobDetails.vehicleType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">License</p>
                      <p className="font-medium">Category {jobDetails.licenseRequired}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{jobDetails.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="font-medium">{jobDetails.salary}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Positions</p>
                      <p className="font-medium">{jobDetails.positions}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Job Type</p>
                      <p className="font-medium">{jobDetails.jobType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="font-medium">{jobDetails.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="font-medium">{jobDetails.deadline}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-3">Job Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{jobDetails.description}</p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-3">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{jobDetails.requirements}</p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-3">Benefits</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{jobDetails.benefits}</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Location Details</h4>
                    <p className="text-sm text-muted-foreground mb-2">{jobDetails.location}</p>
                    <div className="bg-muted h-48 rounded-md flex items-center justify-center text-muted-foreground">
                      Map Placeholder
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About {jobDetails.employer}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{jobDetails.employer}</h4>
                    <p className="text-sm text-muted-foreground">{jobDetails.employerType}</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  ABC Transport Ltd is a leading logistics company in Tanzania with over 15 years of experience 
                  in freight transport and distribution services.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/employer/1')}>
                    View Company Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    More Jobs from this Company
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Apply for this Job</CardTitle>
                <CardDescription>Submit your application now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg" onClick={handleApply}>
                  Apply Now
                </Button>
                <Button className="w-full" variant="outline" onClick={handleSaveJob}>
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save Job
                </Button>
                <Button className="w-full" variant="outline" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Employer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Ensure your profile is complete</li>
                  <li>✓ Upload your latest CV</li>
                  <li>✓ Highlight relevant experience</li>
                  <li>✓ Check license requirements</li>
                  <li>✓ Apply before the deadline</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Applications</span>
                  <span className="font-semibold">{jobDetails.applications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Days Left</span>
                  <Badge className="bg-warning/10 text-warning">11 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Posted</span>
                  <span className="font-semibold">2 days ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetailDriver;
