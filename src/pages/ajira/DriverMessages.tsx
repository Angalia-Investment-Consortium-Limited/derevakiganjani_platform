import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  employerName?: string;
  employerAvatar?: string;
  driverName: string;
  jobTitle: string;
  lastMessage: string;
  lastMessageTimestamp: any;
  unread: number;
  driverId: string;
  jobId: string;
}

interface Message {
  id: string;
  sender: 'employer' | 'driver';
  text: string;
  timestamp: any;
}

const DriverMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setError("You must be logged in.");
      setLoadingConvos(false);
      return;
    }

    const q = query(collection(db, 'conversations'), where('driverId', '==', user.uid), orderBy('lastMessageTimestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos: Conversation[] = [];
      snapshot.forEach(doc => convos.push({ id: doc.id, ...doc.data() } as Conversation));
      setConversations(convos);
      if (!selectedConversation && convos.length > 0) {
        setSelectedConversation(convos[0]);
      }
      setLoadingConvos(false);
    }, (err) => {
      console.error(err);
      setError("Failed to load messages.");
      setLoadingConvos(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedConversation) return;

    setLoadingMessages(true);
    const q = query(collection(db, 'conversations', selectedConversation.id, 'messages'), orderBy('timestamp', 'asc'));

    const clearUnread = async () => {
      try {
        await updateDoc(doc(db, 'conversations', selectedConversation.id), { unreadDriver: 0 });
      } catch (err) {}
    };
    clearUnread();

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach(doc => msgs.push({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoadingMessages(false);
      // Scroll to bottom
      setTimeout(() => scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' }), 100);
    }, (err) => {
      console.error(err);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user) return;

    const conversationRef = doc(db, 'conversations', selectedConversation.id);
    const messagesColRef = collection(conversationRef, 'messages');

    try {
      await addDoc(messagesColRef, {
        text: messageText,
        sender: 'driver',
        timestamp: serverTimestamp(),
      });

      await updateDoc(conversationRef, {
        lastMessage: messageText,
        lastMessageTimestamp: serverTimestamp(),
        unreadEmployer: increment(1),
        unreadDriver: 0,
      });

      setMessageText('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Messages</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <Card className="h-[700px]">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            <div className="border-r">
              <CardHeader><CardTitle className="text-lg">Inbox</CardTitle></CardHeader>
              <ScrollArea className="h-[620px]">
                {loadingConvos && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                {error && <div className="p-4 text-destructive">{error}</div>}
                {!loadingConvos && conversations.length === 0 && <p className="p-4 text-muted-foreground">No messages yet.</p>}
                <div className="space-y-1 p-4 pt-0">
                  {conversations.map((c) => (
                    <div key={c.id} onClick={() => setSelectedConversation(c)} className={`p-3 rounded-lg cursor-pointer ${selectedConversation?.id === c.id ? 'bg-primary/10' : 'hover:bg-muted'}`}>
                      <div className="flex items-center gap-3 mb-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={c.employerAvatar} />
                          <AvatarFallback>{(c.employerName || 'E').charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium text-sm truncate">{c.employerName || 'Employer'}</p>
                          <p className="text-xs font-semibold text-primary truncate">{c.jobTitle}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.lastMessageTimestamp ? formatDistanceToNow(c.lastMessageTimestamp.toDate()) : ''}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="md:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b flex flex-row items-center gap-4 py-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedConversation.employerAvatar} />
                      <AvatarFallback>{(selectedConversation.employerName || 'E').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedConversation.employerName || 'Employer'}</CardTitle>
                      <CardDescription>{selectedConversation.jobTitle}</CardDescription>
                    </div>
                  </CardHeader>
                  <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                    {loadingMessages && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                    <div className="space-y-4">
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-lg p-3 ${m.sender === 'driver' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm">{m.text}</p>
                                    <p className={`text-xs mt-1 ${m.sender === 'driver' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{m.timestamp ? formatDistanceToNow(m.timestamp.toDate()) : 'sending...'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                  </ScrollArea>
                  <CardContent className="border-t p-4">
                    <div className="flex gap-2">
                        <Textarea placeholder="Type a message..." value={messageText} onChange={e => setMessageText(e.target.value)} onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSendMessage();}}} />
                        <Button onClick={handleSendMessage} size="icon" className="self-end"><Send className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-16 w-16 text-muted-foreground/50" />
                    <h2 className="text-xl font-semibold mt-4">Select a Conversation</h2>
                    <p className="text-muted-foreground mt-1">Choose a conversation from the left to start chatting.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DriverMessages;
