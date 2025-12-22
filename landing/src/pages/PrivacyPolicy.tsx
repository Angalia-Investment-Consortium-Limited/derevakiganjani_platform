import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Lock, 
  Users, 
  FileText, 
  Mail, 
  Phone, 
  AlertCircle,
  Smartphone,
  Camera,
  Bell,
  HardDrive,
  Wifi,
  Image,
  Download,
  Vibrate,
  Database,
  UserCheck,
  Scale,
  RefreshCw,
  Baby
} from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy - Dereva Kiganjani Mobile App | MDV Vehicle Fleet';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy Policy for Dereva Kiganjani mobile application. Learn how we collect, use, protect, and manage your personal data in compliance with Google Play Store requirements.');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground">
                Dereva Kiganjani Mobile Application
              </p>
              <p className="text-lg text-muted-foreground">
                MDV Vehicle Fleet Limited
              </p>
              <p className="text-sm text-muted-foreground">
                Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* 1. Introduction */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">1. Introduction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to <strong>Dereva Kiganjani</strong>, a comprehensive driver services platform 
                    developed by <strong>MDV Vehicle Fleet Limited</strong>, operating in Tanzania.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Our app provides: Driver License Services, JiTesti (testing), Elimika (learning), 
                    Ajira ya Udereva (job search), and Ajiri Dereva (recruitment).
                  </p>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>By using our App,</strong> you agree to this Privacy Policy describing how we collect, 
                      use, store, share, and protect your personal information.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 2. App Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Smartphone className="h-6 w-6 text-primary" />
                    2. App Permissions Explained
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Dereva Kiganjani requests specific permissions to deliver services effectively:
                  </p>

                  {/* Required Permissions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Required Permissions
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">INTERNET</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Connects to servers for authentication, applications, tests, learning, jobs, payments, and notifications.
                        </p>
                      </div>

                      <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">ACCESS_NETWORK_STATE</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Checks internet connectivity to provide appropriate offline feedback and prevent data loss.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Runtime Permissions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-blue-500" />
                      Runtime Permissions (Requested When Needed)
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Image className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">READ_EXTERNAL_STORAGE / READ_MEDIA_IMAGES</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Select and upload documents: NIDA, licenses, certificates, passport photos. 
                          Android 13+ uses READ_MEDIA_IMAGES for better privacy.
                        </p>
                      </div>

                      <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Camera className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">CAMERA</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Capture profile pictures and photograph documents for verification.
                        </p>
                      </div>

                      <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">POST_NOTIFICATIONS (Android 13+)</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Send notifications about application status, test results, courses, jobs, and payments.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Optional Permissions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Download className="h-5 w-5 text-green-500" />
                      Optional Permissions
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">WRITE_EXTERNAL_STORAGE (Android 10 and below)</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Save certificates, receipts, and educational materials to your device.
                        </p>
                      </div>

                      <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Vibrate className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">VIBRATE</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Provides haptic feedback for notifications and alerts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                    <p className="text-sm text-green-900 dark:text-green-100">
                      <strong>Your Control:</strong> Manage permissions in device settings. Some features may be limited if permissions are denied.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Data Collection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Database className="h-6 w-6 text-primary" />
                    3. Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">3.1 Personal Information</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Full name, phone number, email, NIDA/National ID, date of birth, region/district, gender (optional).
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">3.2 Documents</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      NIDA images, driving licenses, PSV/HGV certificates, driver certificates, passport photos, supporting documents.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">3.3 Usage Data</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      License applications, test attempts/results, course enrollment/progress, job applications, notification preferences, language preference.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">3.4 Local Storage</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Authentication tokens (AsyncStorage), app preferences, offline cache.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">3.5 Technical Data</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Device type, OS version, app version, IP address, error logs.
                    </p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      <strong>We Don't Collect:</strong> Passwords (stored hashed), credit cards, precise GPS location, or data from other apps.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Data Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    4. How We Use Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-1">Service Delivery</h4>
                    <p className="text-sm text-muted-foreground">
                      Process applications, conduct tests, provide learning, facilitate job matching.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-1">Communication</h4>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS, WhatsApp, and in-app about status updates and opportunities.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-1">Verification & Compliance</h4>
                    <p className="text-sm text-muted-foreground">
                      Verify identity, validate documents, ensure eligibility, comply with Tanzanian regulations.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-1">Security & Improvement</h4>
                    <p className="text-sm text-muted-foreground">
                      Prevent fraud, improve performance, develop features, meet legal obligations.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 5. Data Sharing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    5. How We Share Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                    <p className="text-sm text-red-900 dark:text-red-100 font-semibold">
                      ⚠️ We DO NOT sell, rent, or trade your personal information.
                    </p>
                  </div>

                  <p className="text-muted-foreground">We share data only with:</p>

                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Service Providers</h4>
                      <p className="text-sm text-muted-foreground">
                        Payment processors, SMS/WhatsApp providers, cloud hosting under strict confidentiality.
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Regulatory Authorities</h4>
                      <p className="text-sm text-muted-foreground">
                        Government agencies (LATRA, SUMATRA) when legally required for licensing compliance.
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Employers (With Consent)</h4>
                      <p className="text-sm text-muted-foreground">
                        Driver profiles shared with employers only when you apply for jobs.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 6. Data Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Lock className="h-6 w-6 text-primary" />
                    6. Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">We protect your data with:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Secure cloud hosting with encryption</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>HTTPS/SSL encrypted data transmission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Role-based access controls</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Regular security audits and monitoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Secure authentication practices</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground italic">
                    Data retained only as long as necessary for services or legal obligations.
                  </p>
                </CardContent>
              </Card>

              {/* 7. User Rights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Scale className="h-6 w-6 text-primary" />
                    7. Your Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">You have the right to:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Access</strong> your personal data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Update</strong> profile information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Request deletion</strong> of your account (where legally permitted)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Control</strong> notification preferences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Withdraw consent</strong> for optional communications</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground italic">
                    Contact us using the details below to exercise your rights.
                  </p>
                </CardContent>
              </Card>

              {/* 8. Children's Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Baby className="h-6 w-6 text-primary" />
                    8. Children's Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Dereva Kiganjani is intended for users 18 years and older.
                  </p>
                  <p className="text-muted-foreground">
                    We do not knowingly collect data from children under 13 without parental consent.
                  </p>
                  <p className="text-muted-foreground">
                    Learning content (Elimika) may be accessed by school-age children under parental supervision 
                    for educational purposes.
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    If you believe we have collected data from a child inappropriately, please contact us immediately.
                  </p>
                </CardContent>
              </Card>

              {/* 9. Policy Updates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <RefreshCw className="h-6 w-6 text-primary" />
                    9. Changes to This Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.
                  </p>
                  <p className="text-muted-foreground">
                    Major changes will be communicated through:
                  </p>
                  <ul className="space-y-2 text-muted-foreground ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>In-app notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>SMS or WhatsApp messages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Updated effective date on this page</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground">
                    Continued use of the app after updates indicates acceptance of the revised policy.
                  </p>
                </CardContent>
              </Card>

              {/* 10. Contact Information */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Mail className="h-6 w-6 text-primary" />
                    10. Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">MDV Vehicle Fleet Limited</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      For privacy inquiries, data requests, or support:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <a href="mailto:privacy@mdvfleet.co.tz" className="hover:text-primary transition-colors">
                          privacy@mdvfleet.co.tz
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <a href="mailto:tech.support@mdvfleet.co.tz" className="hover:text-primary transition-colors">
                          tech.support@mdvfleet.co.tz
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>+255 748 467 348</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Technology Partner (AICL)</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <a href="mailto:tech.support@aicl.co.tz" className="hover:text-primary transition-colors">
                          tech.support@aicl.co.tz
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm">Website:</span>
                        <a href="https://aicl.co.tz" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          https://aicl.co.tz
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Jurisdiction:</strong> This Privacy Policy is governed by the laws of the United Republic of Tanzania.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Footer Note */}
              <div className="text-center py-8 text-sm text-muted-foreground space-y-2">
                <p className="font-semibold">
                  This Privacy Policy is compliant with Google Play Store requirements.
                </p>
                <p>
                  For WhatsApp-specific privacy information, visit our{' '}
                  <a href="/privacy-policy/whatsapp" className="text-primary hover:underline">
                    WhatsApp Privacy Policy
                  </a>
                  .
                </p>
                <p className="mt-4">
                  © {new Date().getFullYear()} MDV Vehicle Fleet Limited. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
