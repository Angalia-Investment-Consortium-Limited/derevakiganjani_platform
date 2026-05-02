import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  GraduationCap,
  BarChart3,
  Settings2,
  BookOpen,
  FileEdit,
  TrendingUp,
  Briefcase,
  ClipboardList,
  Target,
  Wallet,
  Award,
  Download,
  Shield,
  Cog,
  Star,
  LucideGraduationCap,
  TableConfig,
  MessageSquare,
  Eye,
  Sparkles
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminMovementLogs, getTopFrequented } from '@/hooks/useAdminMovement';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const navigationGroups = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, href: '/admin', badge: null }
    ]
  },
  {
    label: 'Users',
    items: [
      { title: 'All Users', icon: Users, href: '/admin/users', badge: null },
      { title: 'Drivers', icon: Users, href: '/admin/drivers', badge: null },
      { title: 'Employers', icon: Building2, href: '/admin/employers', badge: null },
      { title: 'Employer Verification', icon: Shield, href: '/admin/employer-verification', badge: null }
    ]
  },

  {
    label: 'Leseni (Licenses)',
    items: [
      { title: 'Applications', icon: FileText, href: '/admin/license-applications', badge: 'dynamic' }
    ]
  },
  {
    label: 'Support',
    items: [
      { title: 'General Requests', icon: MessageSquare, href: '/admin/support-requests', badge: null },
      { title: 'Employer Tickets', icon: Building2, href: '/admin/employer-tickets', badge: null }
    ]
  },
  {
    label: 'JiTesti (Testing)',
    items: [
      { title: 'Question Bank', icon: GraduationCap, href: '/admin/questions', badge: null },
      { title: 'Test Categories', icon: TableConfig, href: '/admin/jitesti/categories', badge: null },
      { title: 'Test Manager', icon: BookOpen, href: '/admin/jitesti/tests', badge: null },
      { title: 'Test Results', icon: BarChart3, href: '/admin/jitesti/results', badge: null },
      { title: 'Test Config', icon: Settings2, href: '/admin/test-config', badge: null }

    ]
  },
  {
    label: 'Elimika (Learning)',
    items: [
      { title: 'Course Manager', icon: BookOpen, href: '/admin/courses', badge: null },
      { title: 'All Lessons', icon: ClipboardList, href: '/admin/lessons', badge: null },
      { title: 'Lesson Builder', icon: FileText, href: '/admin/lesson-builder', badge: null },
      { title: 'Learner Progress', icon: TrendingUp, href: '/admin/learners', badge: null }
    ]
  },
  {
    label: 'Recruitment',
    items: [
      { title: 'Job Management', icon: Briefcase, href: '/admin/job-management', badge: null },
      { title: 'AI Matching Monitor', icon: Sparkles, href: '/admin/matching', badge: null },
      { title: 'Recruitment Analytics', icon: BarChart3, href: '/admin/recruitment-reports', badge: null },
      { title: 'Outsource Desk', icon: Building2, href: '/admin/outsource', badge: null }
    ]
  },
  {
    label: 'Finance',
    items: [
      { title: 'Payments', icon: Wallet, href: '/admin/payments', badge: 'dynamic' }
    ]
  },
  {
    label: 'Certificates',
    items: [
      { title: 'Certificates', icon: Award, href: '/admin/certificates', badge: null }
    ]
  },
  {
    label: 'Reports',
    items: [
      { title: 'Reports & Export', icon: Download, href: '/admin/reports', badge: null }
    ]
  },
  {
    label: 'Settings',
    items: [
      { title: 'Roles & Permissions', icon: Shield, href: '/admin/settings/roles', badge: null },
      { title: 'System Settings', icon: Cog, href: '/admin/settings/system', badge: null },
      { title: 'Audit Log', icon: FileText, href: '/admin/audit-log', badge: null }
    ]
  }
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const isLinkActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };
  
  const [pendingLicenseCount, setPendingLicenseCount] = useState(0);
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);

  useEffect(() => {
    const qTickets = query(collection(db, 'license_requests'), where('status', '==', 'submitted'));
    const unsubscribeTickets = onSnapshot(qTickets, snap => {
        setPendingLicenseCount(snap.docs.length);
    });

    const qPayments = query(collection(db, 'payments'), where('status', '==', 'Pending'));
    const unsubscribePayments = onSnapshot(qPayments, snap => {
        setPendingPaymentCount(snap.docs.length);
    });

    return () => {
        unsubscribeTickets();
        unsubscribePayments();
    };
  }, []);

  const resolveBadge = (title: string, defaultBadge: any) => {
      if (defaultBadge === 'dynamic') {
          if (title === 'Applications') return pendingLicenseCount > 0 ? pendingLicenseCount : null;
          if (title === 'Payments') return pendingPaymentCount > 0 ? pendingPaymentCount : null;
      }
      return defaultBadge;
  };

  const roles = user?.roles || [];
  const isSuperAdmin = roles.includes('SuperAdmin');
  const isAdmin = roles.includes('Admin');
  const isTutor = roles.includes('Tutor');
  const isLicenseOfficer = roles.includes('LicenseOfficer');
  const isTestOfficer = roles.includes('TestOfficer');
  const isFinance = roles.includes('Finance');

  const hasSpecificRole = isTutor || isTestOfficer || isLicenseOfficer || isFinance;

  const filteredNavigationGroups = navigationGroups.filter(group => {
    if (isSuperAdmin) return true;
    
    // If they have Admin role but no specific restrictive sub-role, they can see everything
    if (isAdmin && !hasSpecificRole) return true;
    
    if (isTutor && ['Overview', 'Elimika (Learning)', 'JiTesti (Testing)'].includes(group.label)) return true;
    if (isTestOfficer && ['Overview', 'JiTesti (Testing)'].includes(group.label)) return true;
    if (isLicenseOfficer && ['Overview', 'Leseni (Licenses)', 'Users'].includes(group.label)) return true;
    if (isFinance && ['Overview', 'Finance', 'Payments', 'Reports'].includes(group.label)) return true;
    
    return false;
  });

  const movementLogs = useAdminMovementLogs();
  const topPaths = getTopFrequented(movementLogs, 10);

  // Map top paths to actual items from navigationGroups
  const rawFavoriteItems = topPaths.map(path => {
      let found: any = null;
      for (const group of navigationGroups) {
          const matched = group.items.find((i:any) => i.href === path);
          if (matched) { found = matched; break; }
      }
      if (!found) {
          for (const group of navigationGroups) {
              const matched = group.items.find((i:any) => i.href !== '/admin' && String(path).startsWith(i.href + '/'));
              if (matched) { found = matched; break; }
          }
      }
      return found;
  }).filter(Boolean);

  const favoriteItems = Array.from(new Map(rawFavoriteItems.map(item => [item.title, item])).values()).slice(0, 5);

  // Fallback defaults if they have zero history in the browser
  if (favoriteItems.length === 0) {
      if (isSuperAdmin || isAdmin || isLicenseOfficer) {
          const l = navigationGroups.find(g => g.label === 'Leseni (Licenses)')?.items.find(i => i.title === 'Applications');
          if (l) favoriteItems.push(l);
      }
      if (isSuperAdmin || isAdmin || isFinance) {
          const p = navigationGroups.find(g => g.label === 'Finance')?.items.find(i => i.title === 'Payments');
          if (p) favoriteItems.push(p);
      }
  }

  const hasFavoritesAccess = favoriteItems.length > 0;

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-2">
          {open && (
            <>
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">DH</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Dereva Huduma</span>
                <span className="text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </>
          )}
          {!open && (
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-xs">DH</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Favorites Section */}
        {open && hasFavoritesAccess && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Star className="w-3 h-3" />
              Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {favoriteItems.map((f: any, i) => {
                  const resolvedBadge = resolveBadge(f.title, f.badge);
                  const active = isLinkActive(f.href);
                  return (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton asChild isActive={active} className={active ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-semibold shadow-sm" : ""}>
                      <NavLink to={f.href}>
                        <f.icon className="w-4 h-4" />
                        <span>{f.title}</span>
                        {resolvedBadge && <Badge variant="secondary" className="ml-auto">{resolvedBadge}</Badge>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Navigation Groups */}
        {filteredNavigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {open && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const resolvedBadge = resolveBadge(item.title, item.badge);
                  const active = isLinkActive(item.href);
                  return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={!open ? item.title : undefined} isActive={active} className={active ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-semibold shadow-sm" : ""}>
                      <NavLink to={item.href}>
                        <item.icon className="w-4 h-4" />
                        {open && <span>{item.title}</span>}
                        {open && resolvedBadge && (
                          <Badge variant="secondary" className="ml-auto">
                            {resolvedBadge}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
