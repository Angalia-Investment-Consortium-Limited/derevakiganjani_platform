
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe, User, LogOut, Settings, Bell, Shield, Briefcase, FileText, MessageSquare, Award, Calendar, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
const DerevaLogo = "/logo.png";
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    const names = user.full_name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDashboardRoute = () => {
    const userRole = user?.roles?.[0];
    switch (userRole) {
      case 'Employer':
        return '/employer/dashboard';
      case 'Admin':
      case 'Staff':
      case 'SuperAdmin':
        return '/admin';
      case 'Driver':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  const isAdmin = () => {
    const userRole = user?.roles?.[0];
    return userRole === 'Admin' || userRole === 'Staff' || userRole === 'SuperAdmin';
  };

  const navItems = [
    { label: t('home'), href: '/' },
    { label: t('about'), href: '/about' },
    { label: t('services'), href: '/services' },
    { label: t('contact'), href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={DerevaLogo} alt="Dereva Kiganjani" className="h-[140px] w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English {language === 'en' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('sw')}>
                Kiswahili {language === 'sw' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-4">
              {/* Messages */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(user?.roles?.[0] === 'Employer' ? '/employer/messages' : '/ajira/messages')}
                className="relative"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/notifications')}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Button>

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
                  {!isAdmin() && (
                    <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                      <User className="mr-2 h-4 w-4" />
                      {t('dashboard')}
                    </DropdownMenuItem>
                  )}
                  {isAdmin() && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Portal
                    </DropdownMenuItem>
                  )}
                  {user?.roles?.[0] === 'Driver' && (
                    <>
                      <DropdownMenuItem disabled>
                        <User className="mr-2 h-4 w-4" />
                        <span>Kiganjani Driver CV</span>
                        <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/ajira/applications')}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>My Job Applications</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/elimika/my-learning')}>
                        <Award className="mr-2 h-4 w-4" />
                        <span>My Certificates</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/jitesti/my-history')}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>My Test Results</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/license/my-applications')}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>My License Applications</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/support/my-requests')}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Contact Support</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.roles?.[0] === 'Employer' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/ajiri-dereva/post-job')}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Post New Job</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/employer/jobs')}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Manage Job Posts</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/employer/shortlist')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>View Shortlist</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/employer/interviews')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Schedule Interview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/employer/outsource')}>
                        <Truck className="mr-2 h-4 w-4" />
                        <span>Outsource a Driver</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/employer/outsource-requests')}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>My Outsource Requests</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/employer/support')}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Contact Support</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    {t('myProfile')}
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" onClick={() => navigate('/register')}>
                {t('Create Account')}
              </Button>
              <Button onClick={() => navigate('/ingia')}>
                {t('login')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/auth/admin-login')} className="gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}\
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => { navigate(getDashboardRoute()); setMobileMenuOpen(false); }}
                  className="w-full justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  {t('dashboard')}
                </Button>
                {isAdmin() && (
                  <Button
                    variant="outline"
                    onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                    className="w-full justify-start"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Portal
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => { navigate('/notifications'); setMobileMenuOpen(false); }}
                  className="w-full justify-start"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  {t('notifications')}
                </Button>
                {user?.roles?.[0] === 'Driver' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => { navigate('/ajira/applications'); setMobileMenuOpen(false); }}
                      className="w-full justify-start"
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      My Job Applications
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { navigate('/elimika/my-learning'); setMobileMenuOpen(false); }}
                      className="w-full justify-start"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      My Certificates
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { navigate('/jitesti/my-history'); setMobileMenuOpen(false); }}
                      className="w-full justify-start"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      My Test Results
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { navigate('/license/my-applications'); setMobileMenuOpen(false); }}
                      className="w-full justify-start"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      My License Applications
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { navigate('/support/my-requests'); setMobileMenuOpen(false); }}
                      className="w-full justify-start"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                  </>
                )}
                {user?.roles?.[0] === 'Employer' && (
                  <>
                    <Button variant="outline" onClick={() => { navigate('/ajiri-dereva/post-job'); setMobileMenuOpen(false); }} className="w-full justify-start">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Post New Job
                    </Button>
                    <Button variant="outline" onClick={() => { navigate('/employer/jobs'); setMobileMenuOpen(false); }} className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Manage Job Posts
                    </Button>
                    <Button variant="outline" onClick={() => { navigate('/employer/shortlist'); setMobileMenuOpen(false); }} className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      View Shortlist
                    </Button>
                    <Button variant="outline" onClick={() => { navigate('/employer/interviews'); setMobileMenuOpen(false); }} className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Interview
                    </Button>
                    <Button variant="outline" onClick={() => { navigate('/employer/outsource'); setMobileMenuOpen(false); }} className="w-full justify-start">
                      <Truck className="mr-2 h-4 w-4" />
                      Outsource a Driver
                    </Button>
                    <Button variant="outline" onClick={() => { navigate('/employer/outsource-requests'); setMobileMenuOpen(false); }} className="w-full justify-start">
                      <Briefcase className="mr-2 h-4 w-4" />
                      My Outsource Requests
                    </Button>
                    <Button variant="outline" onClick={() => { navigate('/employer/support'); setMobileMenuOpen(false); }} className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                  className="w-full justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  {t('myProfile')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full justify-start text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }} className="w-full">
                  {t('createAccount')}
                </Button>
                <Button onClick={() => { navigate('/ingia'); setMobileMenuOpen(false); }} className="w-full">
                  {t('login')}
                </Button>
                <Button variant="outline" onClick={() => { navigate('/auth/admin-login'); setMobileMenuOpen(false); }} className="w-full justify-start gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Login
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
