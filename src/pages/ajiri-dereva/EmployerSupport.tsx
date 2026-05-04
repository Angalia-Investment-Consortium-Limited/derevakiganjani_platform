import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notificationService } from '@/services/notificationService';
import { Loader2, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TicketChat } from '@/components/support/TicketChat';

export default function EmployerSupport() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'employer_tickets'), where('employerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMyTickets(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !details || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, 'employer_tickets'), {
        employerId: user.uid,
        email: user.email,
        companyName: (user as any).company_name || user.full_name || 'N/A',
        subject,
        details,
        status: 'Open',
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
      
      try {
          await notificationService.sendSystem(user.uid, 'Support Ticket Created', `Your request "${subject}" has been submitted successfully. Our support team will get back to you soon.`, { ticketId: docRef.id });
      } catch (e) {
          console.error("Failed to notify", e);
      }

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Error submitting request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/employer/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contact Support</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isSuccess ? (
              <Card className="w-full text-center">
                <CardContent className="p-10">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Request Submitted Successfully</h2>
                  <p className="text-muted-foreground mb-6">Our admin team has received your ticket and will respond shortly.</p>
                  <div className="flex gap-4 max-w-sm mx-auto">
                    <Button onClick={() => {
                      setSubject('');
                      setDetails('');
                      setIsSuccess(false);
                    }} className="flex-1">Submit Another</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Submit Support Ticket</CardTitle>
                  <CardDescription>Need help or have a request? Submit a ticket to the admin team.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="subject" className="font-medium">Subject</label>
                      <Input
                        id="subject"
                        placeholder="E.g., Issue with job posting"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="details" className="font-medium">Details</label>
                      <Textarea
                        id="details"
                        placeholder="Please describe your issue or request in detail..."
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        required
                        rows={6}
                      />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" className="w-full" disabled={isLoading || !subject || !details}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Submit Ticket
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Recent Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                {myTickets.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No tickets yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myTickets.map(ticket => (
                      <div 
                        key={ticket.id} 
                        className="border-b pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setIsSheetOpen(true);
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm line-clamp-1">{ticket.subject}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' : ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{ticket.createdAt?.toDate ? new Date(ticket.createdAt.toDate()).toLocaleDateString() : 'Just now'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg flex flex-col p-0">
            <SheetHeader className="p-6 border-b pb-4">
              <SheetTitle>Ticket: {selectedTicket?.subject}</SheetTitle>
              <SheetDescription>
                Status: <span className="font-semibold">{selectedTicket?.status}</span>
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
              {selectedTicket && user && (
                <TicketChat
                  ticketId={selectedTicket.id}
                  currentUserId={user.uid}
                  currentUserName={(user as any).company_name || user.full_name || 'Employer'}
                  currentUserRole="employer"
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </main>
      <Footer />
    </div>
  );
}
