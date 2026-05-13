import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, writeBatch, doc, Timestamp, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Megaphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Broadcasts() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a title and message.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSending(true);
      
      let q;
      if (audience === 'drivers') {
        q = query(collection(db, 'users'), where('roles', 'array-contains', 'Driver'));
      } else if (audience === 'employers') {
        q = query(collection(db, 'users'), where('roles', 'array-contains', 'Employer'));
      } else {
        q = query(collection(db, 'users'));
      }

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => doc.id);
      
      if (users.length === 0) {
        toast({ title: 'Info', description: 'No users found for this audience.' });
        setIsSending(false);
        return;
      }

      const chunks = [];
      const batchSize = 400; // Safe batch size
      for (let i = 0; i < users.length; i += batchSize) {
        chunks.push(users.slice(i, i + batchSize));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(userId => {
          const notifRef = doc(collection(db, 'notifications'));
          batch.set(notifRef, {
            type: 'SYSTEM',
            status: 'PENDING',
            userId: userId,
            title: title,
            message: message,
            createdAt: Timestamp.now(),
            read: false,
            isRead: false
          });
        });
        await batch.commit();
      }

      toast({
        title: 'Broadcast Sent',
        description: `Successfully sent to ${users.length} user(s). Push notifications have been triggered.`,
      });
      
      setTitle('');
      setMessage('');
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send broadcast.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            {t('Broadcasts') || 'Broadcast Announcements'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Send push notifications and in-app alerts to users.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>
              Messages will be delivered via Push Notifications and will appear in the users' in-app notification center.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience</label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="drivers">Drivers Only</SelectItem>
                  <SelectItem value="employers">Employers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Title</label>
              <Input 
                placeholder="e.g., Important System Update" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                maxLength={100}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Content</label>
              <Textarea 
                placeholder="Type your message here..." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
            </div>
            
            <Button onClick={handleSendBroadcast} disabled={isSending} className="w-full sm:w-auto">
              {isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Megaphone className="mr-2 h-4 w-4" /> Send Broadcast</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
