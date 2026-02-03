import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
import { User, Building2, Languages, Loader2 } from 'lucide-react';
import derevaLogo from '../../assets/logo.png';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import type { UserRole } from '@/types/auth';
import { OTPInput } from '@/components/auth/OTPInput';
import { OTPTimer } from '@/components/auth/OTPTimer';

type UserType = 'driver' | 'employer';
type RegistrationStep = 'details' | 'otp' | 'done';

const Register = () => {
  const [userType, setUserType] = useState<UserType>('driver');
  const [step, setStep] = useState<RegistrationStep>('details');

  // Common fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
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

  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language: uiLanguage } = useLanguage();
  const { currentUser, register, otp: otpAuth } = useAuth();

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

  const validateDetails = () => {
    if (
      (userType === 'driver' && (!fullName || !phone)) ||
      (userType === 'employer' && (!companyName || !contactPerson || !phone)) ||
      !password || !confirmPassword
    ) {
      toast({ title: t('error'), description: t('fillAllRequired'), variant: 'destructive' });
      return false;
    }
    if (password !== confirmPassword) {
      toast({ title: t('error'), description: t('passwordMismatch'), variant: 'destructive' });
      return false;
    }
    if (password.length < 8) {
      toast({ title: t('error'), description: t('passwordTooShort'), variant: 'destructive' });
      return false;
    }
    if (!agreeTerms) {
      toast({ title: t('error'), description: t('agreeToTerms'), variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateDetails()) return;
    setIsLoading(true);
    try {
      await otpAuth.sendOTP(phone);
      setStep('otp');
      toast({ title: t('success'), description: t('otpSentSuccess') });
    } catch (error: any) {
      toast({ title: t('error'), description: error.message || t('otpSentError'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTPAndRegister = async (otpCode: string) => {
    setIsLoading(true);
    try {
      await otpAuth.verifyOTP(otpCode);
      
      const registrationData = {
        email,
        password,
        role: userType.charAt(0).toUpperCase() + userType.slice(1) as UserRole,
        phone_number: phone,
        ...(userType === 'driver'
          ? {
              full_name: fullName,
              national_id: nationalId,
              preferred_language: preferredLanguage,
            }
          : {
              company_name: companyName,
              contact_person: contactPerson,
              company_registration: companyRegistration,
              address: companyAddress,
              website: companyWebsite,
            }),
      };
      
      await register(registrationData);
      
      setStep('done');
      toast({
        title: t('success'),
        description: 'Account created successfully! Please check your email to verify your account before logging in.'
      });

      if (userType === 'employer') {
        navigate('/employer/pending-verification', {
          replace: true,
          state: {
            message: 'Your employer account has been created. Please check your email to verify your account. You will receive a separate email once your account is approved.'
          }
        });
      } else {
        navigate('/login', { replace: true });
      }

    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or login.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak. Please use a stronger password.';
      } else if (error.message) {
        errorMessage = error.message;
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

  const handleResendOTP = async () => {
    try {
      await otpAuth.resendOTP(phone);
      toast({ title: t('success'), description: t('otpSentSuccess') });
    } catch (error: any) {
      toast({ title: t('error'), description: error.message || t('otpSentError'), variant: 'destructive' });
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 'otp':
        return (
          <div className="space-y-6 text-center">
             <h3 className="text-xl font-semibold">Verify Your Phone Number</h3>
             <p className="text-muted-foreground">
                An OTP has been sent to <strong>{phone}</strong>. Please enter it below.
             </p>
             <OTPInput length={6} onComplete={handleVerifyOTPAndRegister} />
             {otpAuth.error && <p className="text-sm font-medium text-destructive">{otpAuth.error}</p>}
             <div className="flex items-center justify-center space-x-2 text-sm">
                <OTPTimer
                    duration={60}
                    onTimeout={handleResendOTP}
                    onResend={handleResendOTP}
                />
             </div>
             <Button variant="link" onClick={() => setStep('details')}>
                Change phone number
             </Button>
          </div>
        );
      case 'details':
      default:
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-6">
            <div className="space-y-3">
                  <Label>{t('accountType')}</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserType('driver')}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        userType === 'driver' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <User className="h-8 w-8 mb-2" />
                      <span className="font-semibold">{t('driver')}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">{t('driverAccountDesc')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('employer')}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        userType === 'employer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Building2 className="h-8 w-8 mb-2" />
                      <span className="font-semibold">{t('employer')}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">{t('employerAccountDesc')}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {userType === 'driver' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">{t('fullName')} <span className="text-destructive">*</span></Label>
                        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('enterFullName')} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('phoneNumber')} <span className="text-destructive">*</span></Label>
                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="255712345678" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('email')} <span className="text-destructive">*</span></Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('enterEmail')} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationalId">{t('nationalIdNumber')} ({t('optional')})</Label>
                        <Input id="nationalId" value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder={t('enterNationalId')} />
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
                          <SelectTrigger id="preferredLanguage"><SelectValue placeholder="Select language" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sw">Kiswahili</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">{t('companyName')} <span className="text-destructive">*</span></Label>
                        <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t('enterCompanyName')} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">{t('contactPerson')} <span className="text-destructive">*</span></Label>
                        <Input id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder={t('enterContactPerson')} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('phoneNumber')} <span className="text-destructive">*</span></Label>
                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="255712345678" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('email')} <span className="text-destructive">*</span></Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('enterEmail')} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyRegistration">{t('companyRegistration')} ({t('optional')})</Label>
                        <Input id="companyRegistration" value={companyRegistration} onChange={(e) => setCompanyRegistration(e.target.value)} placeholder={t('enterCompanyRegistration')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress">{t('companyAddress')} ({t('optional')})</Label>
                        <Input id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder={t('enterCompanyAddress')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyWebsite">{t('companyWebsite')} ({t('optional')})</Label>
                        <Input id="companyWebsite" type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder={t('enterCompanyWebsite')} />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('password')} <span className="text-destructive">*</span></Label>
                    <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('enterPassword')} required />
                    <p className="text-xs text-muted-foreground">{t('passwordHelper')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('confirmPassword')} <span className="text-destructive">*</span></Label>
                    <PasswordInput id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('confirmPasswordPlaceholder')} required />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(checked) => setAgreeTerms(checked as boolean)} />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-none">
                    {t('agreeToTermsText')}{' '}
                    <Link to="/legal/terms" className="text-primary hover:underline">{t('termsAndConditions')}</Link>
                  </label>
                </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Proceeding...' : 'Proceed to Verify Phone'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
              <Link to="/login" className="text-primary hover:underline font-medium">{t('loginHere')}</Link>
            </div>
          </form>
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
                {renderStep()}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
