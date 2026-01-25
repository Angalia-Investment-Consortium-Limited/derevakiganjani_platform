import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

const MyApplications = () => {
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const applications = [
    {
      id: 1,
      jobTitle: 'Experienced Truck Driver',
      employer: 'ABC Transport Ltd',
      appliedOn: '2025-01-22',
      status: 'Viewed',
      lastUpdate: '2025-01-23',
      timeline: [
        { date: '2025-01-22', event: 'Application Submitted', status: 'completed' },
        { date: '2025-01-23', event: 'Application Viewed by Employer', status: 'completed' },
        { date: '-', event: 'Interview Scheduled', status: 'pending' },
        { date: '-', event: 'Decision', status: 'pending' },
      ],
    },
    {
      id: 2,
      jobTitle: 'Company Car Driver',
      employer: 'TechCorp Tanzania',
      appliedOn: '2025-01-20',
      status: 'Interview',
      lastUpdate: '2025-01-24',
      timeline: [
        { date: '2025-01-20', event: 'Application Submitted', status: 'completed' },
        { date: '2025-01-21', event: 'Application Viewed by Employer', status: 'completed' },
        { date: '2025-01-24', event: 'Interview Scheduled - Jan 30, 2025', status: 'completed' },
        { date: '-', event: 'Decision', status: 'pending' },
      ],
      message: 'Interview scheduled for January 30, 2025 at 10:00 AM. Please bring your license and certificates.',
    },
    {
      id: 3,
      jobTitle: 'Bus Driver - Tourist Routes',
      employer: 'Safari Adventures',
      appliedOn: '2025-01-18',
      status: 'Submitted',
      lastUpdate: '2025-01-18',
      timeline: [
        { date: '2025-01-18', event: 'Application Submitted', status: 'completed' },
        { date: '-', event: 'Application Under Review', status: 'pending' },
      ],
    },
    {
      id: 4,
      jobTitle: 'Delivery Driver',
      employer: 'QuickDeliver',
      appliedOn: '2025-01-15',
      status: 'Rejected',
      lastUpdate: '2025-01-19',
      timeline: [
        { date: '2025-01-15', event: 'Application Submitted', status: 'completed' },
        { date: '2025-01-16', event: 'Application Viewed by Employer', status: 'completed' },
        { date: '2025-01-19', event: 'Application Not Successful', status: 'rejected' },
      ],
      message: 'Thank you for your application. Unfortunately, we have selected other candidates.',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-primary/10 text-primary';
      case 'Viewed':
        return 'bg-warning/10 text-warning';
      case 'Interview':
        return 'bg-success/10 text-success';
      case 'Accepted':
      case 'Hired':
        return 'bg-success/10 text-success';
      case 'Rejected':
        return 'bg-destructive/10 text-destructive';
      default:
        return '';
    }
  };

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Maombi Yangu ya Kazi</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Application History</CardTitle>
                <CardDescription>Track the status of your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Employer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Last Update</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.jobTitle}</TableCell>
                          <TableCell>{app.employer}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                          </TableCell>
                          <TableCell>{app.appliedOn}</TableCell>
                          <TableCell>{app.lastUpdate}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewDetails(app)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Applications</span>
                  <span className="font-semibold">{applications.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Under Review</span>
                  <span className="font-semibold">
                    {applications.filter(a => a.status === 'Submitted' || a.status === 'Viewed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Interviews</span>
                  <span className="font-semibold">
                    {applications.filter(a => a.status === 'Interview').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Response Rate</span>
                  <span className="font-semibold">75%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/ajira/jobs')}>
                  Find More Jobs
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate('/ajira/profile')}>
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Follow up on pending applications</li>
                  <li>• Prepare for upcoming interviews</li>
                  <li>• Keep your profile updated</li>
                  <li>• Apply to jobs that match your skills</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedApplication?.jobTitle}</DialogTitle>
            <DialogDescription>{selectedApplication?.employer}</DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Application Timeline</h4>
                <div className="space-y-3">
                  {selectedApplication.timeline.map((item: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'completed' ? 'bg-success' :
                          item.status === 'rejected' ? 'bg-destructive' :
                          'bg-muted'
                        }`} />
                        {index < selectedApplication.timeline.length - 1 && (
                          <div className="w-0.5 h-8 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{item.event}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApplication.message && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 mt-0.5" />
                    <h4 className="font-semibold">Message from Employer</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedApplication.message}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
                <Button className="flex-1" onClick={() => navigate(`/ajira/job/${selectedApplication.id}`)}>
                  View Job Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MyApplications;
