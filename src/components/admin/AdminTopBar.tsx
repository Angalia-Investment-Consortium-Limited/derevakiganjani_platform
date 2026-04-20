import { useState, useEffect } from 'react';
import { Search, Bell, Globe, User, LogOut, Clock, Settings } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommandPalette } from './CommandPalette';
import { QuickCreate } from './QuickCreate';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminMovementLogs } from '@/hooks/useAdminMovement';
import { navigationGroups } from './AdminSidebar';

const timeAgo = (ms: number) => {
  const diff = Math.floor((Date.now() - ms) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} days ago`;
};

export function AdminTopBar() {
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const [pendingTickets, setPendingTickets] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    const qTickets = query(collection(db, 'license_requests'), where('status', '==', 'submitted'));
    const unsubscribeTickets = onSnapshot(qTickets, snap => {
        setPendingTickets(snap.docs.length);
    });

    const qPayments = query(collection(db, 'payments'), where('status', '==', 'Pending'));
    const unsubscribePayments = onSnapshot(qPayments, snap => {
        setPendingPayments(snap.docs.length);
    });

    return () => {
        unsubscribeTickets();
        unsubscribePayments();
    };
  }, []);

  const hasNotifs = pendingTickets > 0 || pendingPayments > 0;

  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    const names = user.full_name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const movementLogs = useAdminMovementLogs();
  
  const recentItems = [];
  const seenTitles = new Set<string>();
  
  for (const log of movementLogs) {
      let title = log.path;
      let found: any = null;
      
      for (const group of navigationGroups) {
          const item = group.items.find((i:any) => i.href === log.path);
          if (item) { found = item; break; }
      }
      if (!found) {
          for (const group of navigationGroups) {
              const item = group.items.find((i:any) => i.href !== '/admin' && String(log.path).startsWith(i.href + '/'));
              if (item) { found = item; break; }
          }
      }
      if (found) title = found.title;

      if (seenTitles.has(title)) continue;
      seenTitles.add(title);
      
      recentItems.push({
          title,
          href: log.path,
          time: timeAgo(log.timestamp)
      });
      
      if (recentItems.length >= 5) break;
  }

  if (recentItems.length === 0) {
      recentItems.push({ title: 'No recent activity recorded', href: '/admin', time: '' });
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background h-14 flex items-center gap-4 px-4">
        <SidebarTrigger className="-ml-1" />
        
        <div className="flex-1 flex items-center gap-4">
          {/* Global Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search drivers, employers, jobs... (Ctrl+K)"
              className="pl-9"
              onClick={() => setCommandOpen(true)}
              readOnly
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Create Menu */}
          <QuickCreate />

          {/* Recent Items */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Clock className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Recent Items</SheetTitle>
                <SheetDescription>Your recently viewed items</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {recentItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(item.href)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.time}</div>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {hasNotifs && <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Aggregated Alerts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                {pendingTickets > 0 && (
                  <div className="p-2 rounded-lg hover:bg-muted cursor-pointer" onClick={() => navigate('/admin/support-requests')}>
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive">New</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{pendingTickets} new support tickets</p>
                        <p className="text-xs text-muted-foreground">Action required</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {pendingPayments > 0 && (
                  <div className="p-2 rounded-lg hover:bg-muted cursor-pointer" onClick={() => navigate('/admin/payments')}>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary">Payment</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{pendingPayments} payments pending</p>
                        <p className="text-xs text-muted-foreground">Verification needed</p>
                      </div>
                    </div>
                  </div>
                )}

                {!hasNotifs && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    All caught up! No pending tasks.
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Language / Lugha</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                {language === 'en' && '✓ '}English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('sw')}>
                {language === 'sw' && '✓ '}Kiswahili
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_image} alt={user?.full_name} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                {t('myProfile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
