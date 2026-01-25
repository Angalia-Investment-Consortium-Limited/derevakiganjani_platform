import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Use our new auth context
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Building2 } from 'lucide-react';
import derevaLogo from '../../assets/logo.png';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type UserType = 'driver' | 'employer';

const Register = () => {
  const [userType, setUserType] = useState<UserType>('driver');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser, register } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: t('error'), description: t('passwordMismatch'), variant: 'destructive' });
      return;
    }
    if (!agreeTerms) {
        toast({ title: t('error'), description: t('agreeToTerms'), variant: 'destructive' });
        return;
    }

    setIsLoading(true);

    try {
        const registrationData = {
            user_type: userType,
            email,
            password,
            phone_number: phone,
            ...(userType === 'driver' ? { full_name: fullName } : { company_name: companyName, contact_person: contactPerson })
        };
        
      await register(registrationData as any);

      toast({ title: t('success'), description: 'Account created successfully!' });
      
      navigate('/login');

    } catch (error: any) {
      toast({ title: t('error'), description: error.message || 'Registration failed.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
                <img src={derevaLogo} alt="Logo" className="h-24 mx-auto"/>
              <CardTitle className="text-2xl text-center">{t('createAccount')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-6">
                {/* User Type and other fields */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Driver/Employer buttons */}
                </div>
                
                {userType === 'driver' ? (
                    <>
                        <Label htmlFor="fullName">{t('fullName')}</Label>
                        <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required/>
                    </>
                ) : (
                    <>
                        <Label htmlFor="companyName">{t('companyName')}</Label>
                        <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} required/>
                        <Label htmlFor="contactPerson">{t('contactPerson')}</Label>
                        <Input id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required/>
                    </>
                )}
                
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required/>

                <Label htmlFor="phone">{t('phoneNumber')}</Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required/>

                <Label htmlFor="password">{t('password')}</Label>
                <PasswordInput id="password" value={password} onChange={e => setPassword(e.char.value)} required/>

                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <PasswordInput id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required/>

                <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={agreeTerms} onCheckedChange={setAgreeTerms as any}/>
                    <Label htmlFor="terms">{t('agreeToTermsText')} <Link to="/terms" className="text-primary">{t('termsAndConditions')}</Link></Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : t('createAccount')}
                </Button>

                <div className="text-center text-sm">
                  {t('alreadyHaveAccount')} <Link to="/login" className="text-primary">{t('loginHere')}</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
