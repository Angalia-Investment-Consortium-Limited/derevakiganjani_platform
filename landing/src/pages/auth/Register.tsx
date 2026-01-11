import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFrappeAuth, useFrappePostCall } from 'frappe-react-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Building2, CheckCircle2, XCircle, Loader2, Languages } from 'lucide-react';
import derevaLogo from '../../assets/logo.png';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type UserType = 'driver' | 'employer';

const Register = () => {
  const [userType, setUserType] = useState<UserType>('driver');
  // Common fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Validation states
  const [phoneAvailability, setPhoneAvailability] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [emailAvailability, setEmailAvailability] = useState<'checking' | 'available' | 'taken' | null>(null);
  
  // Driver-specific fields
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'sw'>('sw');
  
  // Employer-specific fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [companyRegistration, setCompanyRegistration] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language: uiLanguage } = useLanguage();
  
  // Use frappe-react-sdk hooks
  const { currentUser } = useFrappeAuth();
  const { call: registerUser } = useFrappePostCall('derevahuduma_platform.api.auth.register');
  const { call: checkAvailability } = useFrappePostCall('derevahuduma_platform.api.auth.check_availability');

  // Sync preferred language with UI language on mount
  useEffect(() => {
    if (uiLanguage) {
      setPreferredLanguage(uiLanguage);
    }
  }, [uiLanguage]);

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // Check phone availability with debounce
  useEffect(() => {
    if (!phone || phone.length < 10) {
      setPhoneAvailability(null);
      return;
    }

    const timer = setTimeout(async () => {
      setPhoneAvailability('checking');
      try {
        const result = await checkAvailability({
          field: 'mobile_no',
          value: phone
        });
        
        if (result && typeof result.available === 'boolean') {
          setPhoneAvailability(result.available ? 'available' : 'taken');
        } else {
          setPhoneAvailability(null);
        }
      } catch (error) {
        console.error('Error checking phone availability:', error);
        setPhoneAvailability(null);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [phone, checkAvailability]);

  // Check email availability with debounce
  useEffect(() => {
    if (!email || email.length < 5) {
      setEmailAvailability(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailAvailability(null);
      return;
    }

    const timer = setTimeout(async () => {
      setEmailAvailability('checking');
      try {
        const result = await checkAvailability({
          field: 'email',
          value: email
        });
        
        if (result && typeof result.available === 'boolean') {
          setEmailAvailability(result.available ? 'available' : 'taken');
        } else {
          setEmailAvailability(null);
        }
      } catch (error) {
        console.error('Error checking email availability:', error);
        setEmailAvailability(null);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [email, checkAvailability]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if phone or email is taken
    if (phoneAvailability === 'taken') {
      toast({
        title: t('error'),
        description: 'This phone number is already registered. Please use a different number or login.',
        variant: 'destructive',
      });
      return;
    }

    if (email && emailAvailability === 'taken') {
      toast({
        title: t('error'),
        description: 'This email is already registered. Please use a different email or login.',
        variant: 'destructive',
      });
      return;
    }

    // Validation based on user type
    if (userType === 'driver') {
      if (!fullName || !phone || !password || !preferredLanguage) {
        toast({
          title: t('error'),
          description: t('fillAllRequired'),
          variant: 'destructive',
        });
        return;
      }
    } else {
      if (!companyName || !contactPerson || !phone || !password) {
        toast({
          title: t('error'),
          description: t('fillAllRequired'),
          variant: 'destructive',
        });
        return;
      }
    }

    if (password !== confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwordMismatch'),
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: t('error'),
        description: t('passwordTooShort'),
        variant: 'destructive',
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: t('error'),
        description: t('agreeToTerms'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (userType === 'driver') {
        // Driver registration
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        await registerUser({
          mobile_no: phone,
          email: email || undefined,
          first_name: firstName,
          last_name: lastName || undefined,
          password: password,
          user_type: 'Driver',
          national_id: nationalId || undefined,
          language: preferredLanguage,
        });
      } else {
        // Employer registration
        const nameParts = contactPerson.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        await registerUser({
          mobile_no: phone,
          email: email || undefined,
          first_name: firstName,
          last_name: lastName || undefined,
          password: password,
          user_type: 'Employer',
          company_name: companyName,
          contact_person: contactPerson,
          company_registration: companyRegistration || undefined,
          address: companyAddress || undefined,
          website: companyWebsite || undefined,
        });
      }

      if (userType === 'employer') {
        toast({
          title: t('success'),
          description: 'Account created successfully! Your account is pending verification. Please check your email for further instructions.',
        });

        setTimeout(() => {
          navigate('/employer/pending-verification', { 
            replace: true,
            state: { 
              message: 'Your employer account has been created and is pending verification. You will receive an email once your account is verified.'
            }
          });
        }, 2000);
      } else {
        toast({
          title: t('success'),
          description: 'Account created successfully! Please login to continue.',
        });

        setTimeout(() => {
          navigate('/auth/driver-login', { replace: true });
        }, 2000);
      }
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes('mobile number') || msg.includes('phone')) {
          if (msg.includes('already exists') || msg.includes('duplicate')) {
            errorMessage = 'This phone number is already registered. Please login or use a different number.';
          } else if (msg.includes('invalid')) {
            errorMessage = 'Invalid phone number format. Please use format: +255 7XX XXX XXX';
          } else {
            errorMessage = error.message;
          }
        } else if (msg.includes('email')) {
          if (msg.includes('already exists') || msg.includes('duplicate')) {
            errorMessage = 'This email is already registered. Please login or use a different email.';
          } else if (msg.includes('invalid')) {
            errorMessage = 'Invalid email format. Please enter a valid email address.';
          } else {
            errorMessage = error.message;
          }
        } else if (msg.includes('password')) {
          if (msg.includes('8 characters') || msg.includes('too short')) {
            errorMessage = 'Password must be at least 8 characters long.';
          } else if (msg.includes('uppercase')) {
            errorMessage = 'Password must contain at least one uppercase letter.';
          } else if (msg.includes('lowercase')) {
            errorMessage = 'Password must contain at least one lowercase letter.';
          } else if (msg.includes('number') || msg.includes('digit')) {
            errorMessage = 'Password must contain at least one number.';
          } else {
            errorMessage = error.message;
          }
        } else if (msg.includes('required')) {
          errorMessage = 'Please fill in all required fields marked with *.';
        } else if (msg.includes('company name')) {
          errorMessage = 'Company name is required for employer registration.';
        } else if (msg.includes('network') || msg.includes('connection')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: t('error'),
        description: t('invalidOtp'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement OTP verification via Frappe API
      toast({
        title: t('success'),
        description: t('accountCreated'),
      });

      setShowOtpDialog(false);

      if (userType === 'driver') {
        navigate('/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || 'OTP verification failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAvailabilityIndicator = (status: 'checking' | 'available' | 'taken' | null) => {
    if (!status) return null;
    
    if (status === 'checking') {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Checking...</span>
        </div>
      );
    }
    
    if (status === 'available') {
      return (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          <span>Available</span>
        </div>
      );
    }
    
    if (status === 'taken') {
      return (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <XCircle className="h-3 w-3" />
          <span>Already registered</span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Register</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <img src={derevaLogo} alt="Dereva Kiganjani" className="h-[140px] w-auto mx-auto" />
              </div>
              <CardTitle className="text-2xl text-center">{t('createAccount')}</CardTitle>
              <CardDescription className="text-center">{t('registerSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-6">
                {/* User Type Selection */}
                <div className="space-y-3">
                  <Label>{t('accountType')}</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserType('driver')}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        userType === 'driver'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <User className="h-8 w-8 mb-2" />
                      <span className="font-semibold">{t('driver')}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        {t('driverAccountDesc')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('employer')}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        userType === 'employer'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Building2 className="h-8 w-8 mb-2" />
                      <span className="font-semibold">{t('employer')}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        {t('employerAccountDesc')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Conditional Fields Based on User Type */}
                <div className="space-y-4">
                  {userType === 'driver' ? (
                    // Driver Fields
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          {t('fullName')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t('enterFullName')}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          {t('phoneNumber')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="255712345678"
                          required
                          className={phoneAvailability === 'taken' ? 'border-destructive' : ''}
                        />
                        {renderAvailabilityIndicator(phoneAvailability)}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">{t('email')} ({t('optional')})</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('enterEmail')}
                          className={emailAvailability === 'taken' ? 'border-destructive' : ''}
                        />
                        {renderAvailabilityIndicator(emailAvailability)}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nationalId">{t('nationalIdNumber')} ({t('optional')})</Label>
                        <Input
                          id="nationalId"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                          placeholder={t('enterNationalId')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredLanguage">
                          <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            <span>Preferred Language / Lugha Unayopendelea</span>
                            <span className="text-destructive">*</span>
                          </div>
                        </Label>
                        <Select value={preferredLanguage} onValueChange={(value) => setPreferredLanguage(value as 'en' | 'sw')} required>
                          <SelectTrigger id="preferredLanguage">
                            <SelectValue placeholder="Select language / Chagua lugha" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sw">
                              <div className="flex flex-col">
                                <span className="font-medium">Kiswahili</span>
                                <span className="text-xs text-muted-foreground">Swahili - Default / Chaguo-msingi</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="en">
                              <div className="flex flex-col">
                                <span className="font-medium">English</span>
                                <span className="text-xs text-muted-foreground">English Language</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          This will be used for all emails and communications / Hii itatumika kwa barua pepe na mawasiliano yote
                        </p>
                      </div>
                    </>
                  ) : (
                    // Employer Fields
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">
                          {t('companyName')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder={t('enterCompanyName')}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">
                          {t('contactPerson')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="contactPerson"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          placeholder={t('enterContactPerson')}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          {t('phoneNumber')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="255712345678"
                          required
                          className={phoneAvailability === 'taken' ? 'border-destructive' : ''}
                        />
                        {renderAvailabilityIndicator(phoneAvailability)}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">{t('email')} ({t('optional')})</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('enterEmail')}
                          className={emailAvailability === 'taken' ? 'border-destructive' : ''}
                        />
                        {renderAvailabilityIndicator(emailAvailability)}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyRegistration">
                          {t('companyRegistration')} ({t('optional')})
                        </Label>
                        <Input
                          id="companyRegistration"
                          value={companyRegistration}
                          onChange={(e) => setCompanyRegistration(e.target.value)}
                          placeholder={t('enterCompanyRegistration')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyAddress">
                          {t('companyAddress')} ({t('optional')})
                        </Label>
                        <Input
                          id="companyAddress"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder={t('enterCompanyAddress')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyWebsite">
                          {t('companyWebsite')} ({t('optional')})
                        </Label>
                        <Input
                          id="companyWebsite"
                          type="url"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder={t('enterCompanyWebsite')}
                        />
                      </div>
                    </>
                  )}

                  {/* Common Password Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {t('password')} <span className="text-destructive">*</span>
                    </Label>
                    <PasswordInput
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('enterPassword')}
                      required
                    />
                    <p className="text-xs text-muted-foreground">{t('passwordHelper')}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t('confirmPassword')} <span className="text-destructive">*</span>
                    </Label>
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('confirmPasswordPlaceholder')}
                      required
                    />
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('agreeToTermsText')}{' '}
                    <Link to="/legal/terms" className="text-primary hover:underline">
                      {t('termsAndConditions')}
                    </Link>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={isLoading || phoneAvailability === 'taken' || emailAvailability === 'taken'}
                >
                  {isLoading ? 'Creating Account...' : t('createAccount')}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
                  <Link to="/ingia" className="text-primary hover:underline font-medium">
                    {t('loginHere')}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* OTP Verification Dialog */}
        <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('verifyPhone')}</DialogTitle>
              <DialogDescription>{t('otpSentToPhone')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">{t('enterOtp')}</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleVerifyOtp} className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : t('verify')}
                </Button>
                <Button variant="outline" onClick={() => setShowOtpDialog(false)} className="flex-1">
                  {t('cancel')}
                </Button>
              </div>
              <Button variant="ghost" className="w-full" size="sm">
                {t('resendOtp')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
