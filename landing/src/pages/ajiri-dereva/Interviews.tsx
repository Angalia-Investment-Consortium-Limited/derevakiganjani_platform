import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Edit, XCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Interviews = () => {
  const { toast } = useToast();
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const interviews = [
    {
      id: 1,
      candidate: 'John Mwamba',
      job: 'Truck Driver',
      date: '2025-02-05',
      time: '10:00 AM',
      mode: 'In-person',
      status: 'Confirmed',
      notes: 'Interview at office',
    },
    {
      id: 2,
      candidate: 'Mary Kamara',
      job: 'Company Car Driver',
      date: '2025-02-06',
      time: '2:00 PM',
      mode: 'Phone',
      status: 'Requested',
      notes: '',
    },
    {
      id: 3,
      candidate: 'David Luka',
      job: 'Bus Driver',
      date: '2025-02-03',
      time: '9:00 AM',
      mode: 'Online',
      status: 'Completed',
      notes: 'Zoom meeting',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-success/10 text-success';
      case 'Requested':
        return 'bg-warning/10 text-warning';
      case 'Completed':
        return 'bg-blue-500/10 text-blue-500';
      case 'Cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return '';
    }
  };

  const handleSchedule = () => {
    // TODO: API call to schedule interview
    setShowScheduleModal(false);
    toast({
      title: "Interview Scheduled",
      description: "The candidate will be notified about the interview.",
    });
  };

  const handleAction = (_interviewId: number, action: string, candidateName: string) => {
    toast({
      title: `Interview ${action}`,
      description: `Interview with ${candidateName} has been ${action.toLowerCase()}.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Interview Scheduling</h1>
            <p className="text-muted-foreground">Ratiba za Mahojiano</p>
          </div>
          <Button onClick={() => setShowScheduleModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Interviews</CardTitle>
            <CardDescription>Manage all interview appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Input placeholder="Search candidates..." className="flex-1" />
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="inperson">In-person</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job Position</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">{interview.candidate}</TableCell>
                      <TableCell>{interview.job}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {interview.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {interview.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{interview.mode}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {interview.status !== 'Completed' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleAction(interview.id, 'Rescheduled', interview.candidate)}
                                title="Reschedule"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleAction(interview.id, 'Cancelled', interview.candidate)}
                                title="Cancel"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          {interview.status === 'Confirmed' && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleAction(interview.id, 'Marked as Completed', interview.candidate)}
                              title="Mark Completed"
                            >
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Set up an interview with a candidate
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="candidate">Candidate *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">John Mwamba</SelectItem>
                    <SelectItem value="2">Mary Kamara</SelectItem>
                    <SelectItem value="3">David Luka</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job">Job Position *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Truck Driver</SelectItem>
                    <SelectItem value="2">Company Car Driver</SelectItem>
                    <SelectItem value="3">Bus Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Interview Date *</Label>
                <Input id="date" type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Interview Time *</Label>
                <Input id="time" type="time" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Interview Mode *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inperson">In-person</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="online">Online (Zoom/Meet)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Location, meeting link, special instructions..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule}>
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Interviews;
