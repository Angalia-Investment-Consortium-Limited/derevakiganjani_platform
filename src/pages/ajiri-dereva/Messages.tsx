import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 1,
      driverName: 'John Mwamba',
      jobTitle: 'Truck Driver',
      lastMessage: 'Thank you for considering my application',
      lastMessageTime: '10 mins ago',
      unread: 2,
    },
    {
      id: 2,
      driverName: 'Mary Kamara',
      jobTitle: 'Company Car Driver',
      lastMessage: 'When should I come for the interview?',
      lastMessageTime: '1 hour ago',
      unread: 0,
    },
    {
      id: 3,
      driverName: 'David Luka',
      jobTitle: 'Bus Driver',
      lastMessage: 'I confirm my availability',
      lastMessageTime: '2 days ago',
      unread: 0,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'driver',
      text: 'Hello, I am interested in the Truck Driver position',
      time: '2 days ago',
    },
    {
      id: 2,
      sender: 'employer',
      text: 'Thank you for your interest. Can you tell me about your experience?',
      time: '2 days ago',
    },
    {
      id: 3,
      sender: 'driver',
      text: 'I have 5 years of experience driving heavy trucks across East Africa',
      time: '1 day ago',
    },
    {
      id: 4,
      sender: 'employer',
      text: 'That sounds great. We would like to schedule an interview.',
      time: '1 day ago',
    },
    {
      id: 5,
      sender: 'driver',
      text: 'Thank you for considering my application. I am available this week.',
      time: '10 mins ago',
    },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // TODO: API call to send message
      setMessageText('');
    }
  };

  const selectedConvo = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Ujumbe • Communicate with Candidates</p>
        </div>

        <Card className="h-[700px]">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r">
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-10" />
                </div>
              </CardHeader>
              <ScrollArea className="h-[580px]">
                <div className="space-y-1 p-4 pt-0">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-primary/10'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {conversation.driverName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{conversation.driverName}</p>
                            <p className="text-xs text-muted-foreground">{conversation.jobTitle}</p>
                          </div>
                        </div>
                        {conversation.unread > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conversation.lastMessageTime}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Message Thread */}
            <div className="md:col-span-2 flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedConvo?.driverName}</CardTitle>
                    <CardDescription>{selectedConvo?.jobTitle}</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://wa.me/?text=Hello`, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'employer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'employer'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === 'employer'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <CardContent className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={2}
                    className="resize-none"
                  />
                  <Button onClick={handleSendMessage} size="icon" className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </CardContent>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
