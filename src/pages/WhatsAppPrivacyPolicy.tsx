import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Users, FileText, Mail, Phone, AlertCircle } from 'lucide-react';

export default function WhatsAppPrivacyPolicy() {
  useEffect(() => {
    // Set page title for SEO
    document.title = 'Dereva Kiganjani WhatsApp Privacy Policy | MDV Vehicle Fleet';
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy policy for WhatsApp chatbot interactions with Dereva Kiganjani platform. Learn how we collect, use, and protect your data when using our WhatsApp services.');
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
                WhatsApp Chatbot Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground">
                Dereva Kiganjani - MDV Vehicle Fleet Limited
              </p>
              <p className="text-sm text-muted-foreground">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-12">
          <div className="container">
            <div className="max-w-4xl mx-auto space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">1. Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Dereva Kiganjani is a digital driver services platform that provides license services, driver testing (JiTesti), 
                    learning (Elimika), job matching (Ajira ya Udereva), and recruitment tools (Ajiri Dereva).
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    This Privacy Policy explains how user data is collected, used, stored, and shared, including interactions 
                    through WhatsApp and Meta platforms.
                  </p>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>By using Dereva Kiganjani,</strong> users consent to the data practices described below.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Data Collection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    2. Data We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">2.1 Information Users Provide</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Full name</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Phone number (used as primary identifier on WhatsApp)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Region/District</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Driver license category</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>National ID (NIDA) details or document</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Driving License details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>PSV/HGV certificates (where applicable)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Job application details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Uploaded documents (images or PDFs)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">2.2 WhatsApp & Messaging Data</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Messages sent to the Dereva Kiganjani chatbot</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>User selections and responses during chatbot interactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Reference numbers generated by the system</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">2.3 Technical Data</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Device type and operating system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>IP address</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Usage logs (for security and troubleshooting)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                    <p className="text-sm text-green-900 dark:text-green-100">
                      ⚠️ <strong>We do not collect</strong> passwords, credit card numbers, or sensitive financial credentials.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Data Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    3. How We Use User Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">User data is used strictly to:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Deliver requested services (licenses, tests, learning, jobs)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Process applications and generate reference numbers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Track request status and send notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Provide customer support and respond to inquiries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Improve platform performance and service quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Meet legal and regulatory requirements</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Data Sharing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">4. How We Share Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                    <p className="text-sm text-amber-900 dark:text-amber-100 font-semibold">
                      We do not sell or rent user data.
                    </p>
                  </div>
                  <p className="text-muted-foreground">Data may be shared only with:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>MDV Vehicle Fleet Limited</strong> (service delivery & verification)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Regulatory authorities</strong> when legally required (e.g., LATRA)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Technology service providers</strong> (hosting, SMS, WhatsApp API) under strict confidentiality</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground italic mt-4">
                    All third parties are required to protect user data.
                  </p>
                </CardContent>
              </Card>

              {/* WhatsApp & Meta Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">5. WhatsApp & Meta Platform Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>WhatsApp messages are used only for <strong>service-related communication</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Users receive messages only after <strong>initiating contact or consenting</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Automated messages are <strong>transactional</strong> (status updates, confirmations)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>No promotional or spam messages are sent without consent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Users may stop receiving messages by typing <strong>STOP</strong></span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Data Security & Retention */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Lock className="h-6 w-6 text-primary" />
                    6. Data Storage & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">We apply appropriate safeguards including:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Secure cloud hosting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Encrypted data transmission (SSL/HTTPS)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Role-based system access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Controlled admin permissions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Audit logs for system actions</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground italic mt-4">
                    Data is retained only as long as necessary to provide services or meet legal obligations.
                  </p>
                </CardContent>
              </Card>

              {/* User Rights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">7. User Rights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">Users have the right to:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Access their personal data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Correct inaccurate information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Request deletion where legally permitted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Withdraw consent for optional communications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Request support or clarification</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground italic mt-4">
                    Requests can be made via the platform or official support channels.
                  </p>
                </CardContent>
              </Card>

              {/* Children's Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">8. Children's Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    Dereva Kiganjani is not intended for users under 18 years of age.
                  </p>
                  <p className="text-muted-foreground">
                    We do not knowingly collect data from minors.
                  </p>
                </CardContent>
              </Card>

              {/* Policy Changes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">9. Changes to This Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    This Privacy Policy may be updated from time to time.
                  </p>
                  <p className="text-muted-foreground">
                    Updates will be published on the official platform. Continued use indicates acceptance.
                  </p>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Mail className="h-6 w-6 text-primary" />
                    10. Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">MDV Vehicle Fleet Limited</h3>
                    <div className="space-y-2">
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
                </CardContent>
              </Card>

              {/* Footer Note */}
              <div className="text-center py-8 text-sm text-muted-foreground">
                <p>This privacy policy is specifically for WhatsApp chatbot interactions with Dereva Kiganjani.</p>
                <p className="mt-2">For general platform privacy information, please contact us using the details above.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
