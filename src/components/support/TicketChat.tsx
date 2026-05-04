import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadFile } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Paperclip, ImageIcon, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: 'employer' | 'admin';
  attachmentUrl?: string;
  createdAt: any;
}

interface TicketChatProps {
  ticketId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'employer' | 'admin';
}

export function TicketChat({ ticketId, currentUserId, currentUserName, currentUserRole }: TicketChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!ticketId) return;

    const messagesRef = collection(db, `employer_tickets/${ticketId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setIsLoadingMessages(false);
      
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [ticketId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!newMessage.trim() && !attachment) || isSending) return;

    setIsSending(true);
    let attachmentUrl = '';

    try {
      if (attachment) {
        const path = `support_attachments/${ticketId}/${Date.now()}_${attachment.name}`;
        attachmentUrl = await uploadFile(attachment, path);
      }

      await addDoc(collection(db, `employer_tickets/${ticketId}/messages`), {
        text: newMessage.trim(),
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: currentUserRole,
        ...(attachmentUrl ? { attachmentUrl } : {}),
        createdAt: serverTimestamp()
      });

      setNewMessage('');
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      // Check size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setAttachment(file);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
            <FileText className="h-10 w-10 mb-2 opacity-20" />
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation below.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 ${isMe ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {!isMe && (
                      <div className="text-xs font-semibold mb-1 opacity-70">
                        {msg.senderName} ({msg.senderRole})
                      </div>
                    )}
                    {msg.attachmentUrl && (
                      <div className="mb-2">
                        <img 
                          src={msg.attachmentUrl} 
                          alt="Attachment" 
                          className="max-w-full rounded-md max-h-48 object-cover cursor-pointer"
                          onClick={() => window.open(msg.attachmentUrl, '_blank')}
                        />
                      </div>
                    )}
                    {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-100' : 'text-gray-500'}`}>
                      {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'MMM d, h:mm a') : 'Sending...'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t bg-background mt-auto">
        {attachment && (
          <div className="mb-2 flex items-center bg-gray-100 rounded-md p-2 relative w-max">
            <ImageIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-xs truncate max-w-[200px] text-gray-700">{attachment.name}</span>
            <button 
              onClick={() => setAttachment(null)}
              className="ml-2 text-gray-500 hover:text-red-500 text-lg leading-none"
            >
              &times;
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={(!newMessage.trim() && !attachment) || isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
