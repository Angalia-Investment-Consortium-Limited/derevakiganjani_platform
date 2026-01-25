import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  BookOpen,
  Briefcase,
  Wallet,
  Award,
  Download,
  Plus,
  Clock
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'All Users', href: '/admin/users', icon: Users },
  { title: 'Drivers', href: '/admin/learners', icon: Users },
  { title: 'License Requests', href: '/admin/license-requests', icon: FileText },
  { title: 'Question Bank', href: '/admin/questions', icon: GraduationCap },
  { title: 'Courses', href: '/admin/courses', icon: BookOpen },
  { title: 'Job Posts', href: '/admin/job-posts', icon: Briefcase },
  { title: 'Payments', href: '/admin/payments', icon: Wallet },
  { title: 'Certificates', href: '/admin/certificates', icon: Award },
  { title: 'Reports', href: '/admin/reports', icon: Download },
];

const quickActions = [
  { title: 'Add User', href: '/admin/users/new', icon: Plus },
  { title: 'Post Job', href: '/admin/jobs/new', icon: Plus },
  { title: 'Schedule Interview', href: '/employer/interviews', icon: Plus },
  { title: 'Create Course', href: '/admin/courses', icon: Plus },
  { title: 'Create Question', href: '/admin/questions', icon: Plus },
];

const recentPages = [
  { title: 'Driver Profile: John Doe', href: '/admin/learners', icon: Clock },
  { title: 'License Request #DRV-2025-0341', href: '/admin/license-requests', icon: Clock },
  { title: 'Job Post: Taxi Driver Needed', href: '/admin/job-posts', icon: Clock },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type to search or navigate..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => handleSelect(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {quickActions.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => handleSelect(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent Pages">
          {recentPages.map((item, index) => (
            <CommandItem
              key={index}
              onSelect={() => handleSelect(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
