
import { NavLink } from 'react-router-dom';
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
  MessageSquare
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

const navigationGroups = [
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
      { title: 'Applications', icon: FileText, href: '/admin/license-applications', badge: '12' }
    ]
  },
  {
    label: 'Support',
    items: [
      { title: 'General Requests', icon: MessageSquare, href: '/admin/license-requests', badge: null }
    ]
  },
  {
    label: 'JiTesti (Testing)',
    items: [
      { title: 'Question Bank', icon: GraduationCap, href: '/admin/questions', badge: null },
      { title: 'Test Categories', icon: TableConfig, href:'/admin/jitesti/categories', badge: null},
      { title: 'Test Manager', icon: BookOpen, href: '/admin/jitesti/tests', badge: null },
      { title: 'Test Results', icon: BarChart3, href: '/admin/jitesti/results', badge: null },
      { title: 'Test Config', icon: Settings2, href: '/admin/test-config', badge: null }
     
    ]
  },
  {
    label: 'Elimika (Learning)',
    items: [
      { title: 'Course Manager', icon: BookOpen, href: '/admin/courses', badge: null },
      { title: 'Learner Progress', icon: TrendingUp, href: '/admin/learners', badge: null }
    ]
  },
  {
    label: 'Recruitment',
    items: [
      { title: 'Job Management', icon: Briefcase, href: '/admin/job-management', badge: null },
      { title: 'Matching Monitor', icon: Target, href: '/admin/matching', badge: null }
    ]
  },
  {
    label: 'Finance',
    items: [
      { title: 'Payments', icon: Wallet, href: '/admin/payments', badge: '8' }
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
      { title: 'System Settings', icon: Cog, href: '/admin/settings/system', badge: null }
    ]
  }
];

export function AdminSidebar() {
  const { open } = useSidebar();

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
        {open && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Star className="w-3 h-3" />
              Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/license-applications" end className={({ isActive }) => cn(isActive && 'bg-sidebar-accent')}>
                      <FileText className="w-4 h-4" />
                      <span>License Applications</span>
                      <Badge variant="secondary" className="ml-auto">12</Badge>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/payments" end className={({ isActive }) => cn(isActive && 'bg-sidebar-accent')}>
                      <Wallet className="w-4 h-4" />
                      <span>Payments</span>
                      <Badge variant="secondary" className="ml-auto">8</Badge>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Navigation Groups */}
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {open && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={!open ? item.title : undefined}>
                      <NavLink 
                        to={item.href} 
                        end 
                        className={({ isActive }) => cn(isActive && 'bg-sidebar-accent font-medium')}
                      >
                        <item.icon className="w-4 h-4" />
                        {open && <span>{item.title}</span>}
                        {open && item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
