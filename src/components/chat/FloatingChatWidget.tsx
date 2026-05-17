import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, X, Loader2, Minimize2, Maximize2, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

interface Conversation {
  id: string;
  employerId: string;
  employerName?: string;
  employerAvatar?: string;
  driverId: string;
  driverName: string;
  jobTitle: string;
  lastMessage: string;
  lastMessageTimestamp: any;
  unreadDriver: number;
  unreadEmployer: number;
  jobId: string;
}

interface Message {
  id: string;
  sender: 'employer' | 'driver';
  text: string;
  timestamp: any;
}

export const FloatingChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const unreadMessagesCount = useUnreadMessages();

  const userRole = user?.roles?.[0] as 'Employer' | 'Driver' | undefined;
  const isEmployer = userRole === 'Employer';
  const roleIdField = isEmployer ? 'employerId' : 'driverId';
  const myUnreadField = isEmployer ? 'unreadEmployer' : 'unreadDriver';
  const theirUnreadField = isEmployer ? 'unreadDriver' : 'unreadEmployer';

  useEffect(() => {
    if (!user || !userRole || !isOpen) return;

    setLoadingConvos(true);
    const q = query(
      collection(db, 'conversations'), 
      where(roleIdField, '==', user.uid), 
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos: Conversation[] = [];
      snapshot.forEach(doc => convos.push({ id: doc.id, ...doc.data() } as Conversation));
      setConversations(convos);
      setLoadingConvos(false);
    }, (err) => {
      console.error("Failed to load conversations:", err);
      setLoadingConvos(false);
    });

    return () => unsubscribe();
  }, [user, userRole, isOpen]);

  useEffect(() => {
    if (!selectedConversation || !isOpen) return;

    setLoadingMessages(true);
    const q = query(
      collection(db, 'conversations', selectedConversation.id, 'messages'), 
      orderBy('timestamp', 'asc')
    );

    const clearUnread = async () => {
      try {
        await updateDoc(doc(db, 'conversations', selectedConversation.id), { [myUnreadField]: 0 });
      } catch (err) {}
    };
    clearUnread();

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach(doc => msgs.push({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoadingMessages(false);
      setTimeout(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    }, (err) => {
      console.error(err);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedConversation, isOpen]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user) return;

    const conversationRef = doc(db, 'conversations', selectedConversation.id);
    const messagesColRef = collection(conversationRef, 'messages');

    try {
      await addDoc(messagesColRef, {
        text: messageText,
        sender: isEmployer ? 'employer' : 'driver',
        timestamp: serverTimestamp(),
      });

      await updateDoc(conversationRef, {
        lastMessage: messageText,
        lastMessageTimestamp: serverTimestamp(),
        [theirUnreadField]: increment(1),
        [myUnreadField]: 0,
      });

      setMessageText('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getOtherPartyName = (c: Conversation) => isEmployer ? c.driverName : (c.employerName || 'Employer');
  const getOtherPartyAvatar = (c: Conversation) => isEmployer ? undefined : c.employerAvatar;

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open-chat-widget', handleOpenChat);
    return () => window.removeEventListener('open-chat-widget', handleOpenChat);
  }, []);

  if (!user || (userRole !== 'Employer' && userRole !== 'Driver')) return null;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50 p-0 hover:scale-105 transition-transform"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadMessagesCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
            {unreadMessagesCount}
          </span>
        )}
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-6 right-6 w-72 shadow-xl z-50 cursor-pointer hover:shadow-2xl transition-all" onClick={() => setIsMinimized(false)}>
        <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 bg-primary text-primary-foreground rounded-t-xl">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            {unreadMessagesCount > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0 min-w-0 h-4 text-[10px]">
                {unreadMessagesCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 md:w-96 shadow-2xl z-50 flex flex-col overflow-hidden border-2 animate-in slide-in-from-bottom-5" style={{ height: '500px', maxHeight: '80vh' }}>
      <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 bg-primary text-primary-foreground shrink-0 rounded-none border-b-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedConversation ? (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-primary-foreground hover:bg-primary/80" onClick={() => setSelectedConversation(null)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="h-6 w-6 shrink-0 bg-primary-foreground/20">
                  <AvatarImage src={getOtherPartyAvatar(selectedConversation)} />
                  <AvatarFallback className="text-xs text-primary">{getOtherPartyName(selectedConversation).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <CardTitle className="text-sm font-medium truncate leading-tight">{getOtherPartyName(selectedConversation)}</CardTitle>
                  <span className="text-[10px] opacity-80 truncate leading-tight">{selectedConversation.jobTitle}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <MessageCircle className="h-5 w-5 shrink-0" />
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
            </>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={() => setIsMinimized(true)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-hidden relative flex flex-col bg-background">
        {!selectedConversation ? (
          <ScrollArea className="flex-1 p-2">
            {loadingConvos && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
            {!loadingConvos && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-70">
                <MessageCircle className="h-10 w-10 mb-2" />
                <p className="text-sm">No conversations yet.</p>
              </div>
            )}
            <div className="space-y-1">
              {conversations.map((c) => {
                const isUnread = (c as any)[myUnreadField] > 0;
                return (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedConversation(c)} 
                    className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${isUnread ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-muted'}`}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={getOtherPartyAvatar(c)} />
                      <AvatarFallback className="bg-muted text-muted-foreground">{getOtherPartyName(c).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className={`text-sm truncate mr-2 ${isUnread ? 'font-bold' : 'font-medium'}`}>{getOtherPartyName(c)}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{c.lastMessageTimestamp ? formatDistanceToNow(c.lastMessageTimestamp.toDate(), { addSuffix: true }) : ''}</span>
                      </div>
                      <p className={`text-xs truncate ${isUnread ? 'font-medium text-primary' : 'text-muted-foreground'}`}>{c.lastMessage || '...'}</p>
                    </div>
                    {isUnread && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <>
            <ScrollArea className="flex-1 p-3" ref={scrollAreaRef as any}>
              {loadingMessages && <div className="flex justify-center p-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
              <div className="space-y-3 pb-2">
                {messages.map(m => {
                  const isMe = m.sender === (isEmployer ? 'employer' : 'driver');
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {m.timestamp ? new Date(m.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'sending...'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="p-3 bg-background border-t mt-auto">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-end gap-2"
              >
                <Textarea 
                  placeholder="Type a message..." 
                  className="min-h-[40px] max-h-32 resize-none py-2 px-3 text-sm rounded-xl focus-visible:ring-1"
                  rows={1}
                  value={messageText} 
                  onChange={e => setMessageText(e.target.value)} 
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault(); 
                      handleSendMessage();
                    }
                  }} 
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-10 w-10 shrink-0 rounded-full" 
                  disabled={!messageText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
