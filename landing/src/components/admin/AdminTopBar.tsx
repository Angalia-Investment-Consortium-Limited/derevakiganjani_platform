import { useState } from 'react';
import { Search, Plus, Bell, Globe, User, HelpCircle, LogOut, Clock } from 'lucide-react';
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
import { CommandPalette } from './CommandPalette';
import { useNavigate } from 'react-router-dom';

export function AdminTopBar() {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();

  const recentItems = [
    { title: 'Driver Profile: John Doe', href: '/admin/learners', time: '2 min ago' },
    { title: 'License Request #DRV-2025-0341', href: '/admin/license-requests', time: '15 min ago' },
    { title: 'Job Post: Taxi Driver Needed', href: '/admin/job-posts', time: '1 hour ago' },
    { title: 'Course: Road Safety Basics', href: '/admin/courses', time: '2 hours ago' },
  ];

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/courses')}>
                <Plus className="w-4 h-4 mr-2" />
                Course Manager
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin/job-posts')}>
                <Plus className="w-4 h-4 mr-2" />
                Job Post Management
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin/questions')}>
                <Plus className="w-4 h-4 mr-2" />
                Question Bank Manager
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div className="p-2 rounded-lg hover:bg-muted">
                  <div className="flex items-start gap-2">
                    <Badge variant="destructive">New</Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">12 new license requests</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-lg hover:bg-muted">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary">Payment</Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">8 payments pending verification</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
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
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <div className="font-semibold">Admin User</div>
                  <div className="text-xs text-muted-foreground">admin@derevahaduma.go.tz</div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Docs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
