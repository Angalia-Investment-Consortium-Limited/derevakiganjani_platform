import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, RefreshCw, GraduationCap, Search, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const LicenseRequest = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const services = [
    {
      id: 'new',
      titleEn: 'New License',
      titleSw: 'Leseni Mpya',
      descriptionEn: 'Apply for a new driver\'s license',
      descriptionSw: 'Omba leseni mpya ya udereva',
      icon: FileText,
      color: 'bg-blue-500',
      path: '/license/apply/new',
      featuresEn: [
        'All license categories (A, B, C, D, E)',
        'Upload required documents',
        'Track application status'
      ],
      featuresSw: [
        'Aina zote za leseni (A, B, C, D, E)',
        'Pakia nyaraka zinazohitajika',
        'Fuatilia hali ya maombi'
      ]
    },
    {
      id: 'renewal',
      titleEn: 'License Renewal',
      titleSw: 'Kufanya Upya Leseni',
      descriptionEn: 'Renew your existing driver\'s license',
      descriptionSw: 'Fanya upya leseni yako ya udereva',
      icon: RefreshCw,
      color: 'bg-green-500',
      path: '/license/apply/renewal',
      featuresEn: [
        'Quick renewal process',
        'Upload current license',
        'Receive confirmation'
      ],
      featuresSw: [
        'Mchakato wa haraka wa kufanya upya',
        'Pakia leseni yako ya sasa',
        'Pokea uthibitisho'
      ]
    },
    {
      id: 'latra',
      titleEn: 'LATRA Exam',
      titleSw: 'Mtihani wa LATRA',
      descriptionEn: 'Register for PSV or HGV LATRA examination',
      descriptionSw: 'Jisajili kwa mtihani wa PSV au HGV',
      icon: GraduationCap,
      color: 'bg-purple-500',
      path: '/license/apply/latra',
      featuresEn: [
        'PSV (Passenger Service Vehicle)',
        'HGV (Heavy Goods Vehicle)',
        'Exam scheduling'
      ],
      featuresSw: [
        'PSV (Magari ya Abiria)',
        'HGV (Magari ya Mizigo)',
        'Ratiba ya mtihani'
      ]
    },
    {
      id: 'status',
      titleEn: 'Check Status',
      titleSw: 'Angalia Hali',
      descriptionEn: 'Track your application status',
      descriptionSw: 'Fuatilia hali ya maombi yako',
      icon: Search,
      color: 'bg-orange-500',
      path: '/license/track',
      featuresEn: [
        'Real-time status updates',
        'View application details',
        'Download documents'
      ],
      featuresSw: [
        'Masasisho ya hali ya wakati halisi',
        'Tazama maelezo ya maombi',
        'Pakua nyaraka'
      ]
    }
  ];

  const statusTypes = [
    { labelEn: 'Pending', labelSw: 'Inasubiri', color: 'bg-yellow-500', icon: Clock },
    { labelEn: 'Under Review', labelSw: 'Inakaguliwa', color: 'bg-blue-500', icon: AlertCircle },
    { labelEn: 'Approved', labelSw: 'Imeidhinishwa', color: 'bg-green-500', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/5">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {language === 'sw' ? 'Huduma za Leseni' : 'License Services'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {language === 'sw' ? 'Chagua huduma unayohitaji' : 'Choose the service you need'}
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={service.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary"
                  onClick={() => navigate(service.path)}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-full ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {language === 'sw' ? service.titleSw : service.titleEn}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {language === 'sw' ? service.descriptionSw : service.descriptionEn}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {(language === 'sw' ? service.featuresSw : service.featuresEn).map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      {language === 'sw' ? 'Anza' : 'Get Started'}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Application Status Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {language === 'sw' ? 'Aina za Hali za Maombi' : 'Application Status Types'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statusTypes.map((status, index) => {
                    const StatusIcon = status.icon;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-10 h-10 rounded-full ${status.color} flex items-center justify-center`}>
                          <StatusIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{language === 'sw' ? status.labelSw : status.labelEn}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Required Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {language === 'sw' ? 'Nyaraka Zinazohitajika' : 'Required Documents'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">{language === 'sw' ? 'Kitambulisho cha Taifa (NIDA)' : 'National ID (NIDA)'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'sw' ? 'Nakala wazi, PDF au Picha' : 'Clear copy, PDF or Image'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">{language === 'sw' ? 'Picha ya Pasi' : 'Passport Photo'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'sw' ? 'Picha ya hivi karibuni, mandhari meupe' : 'Recent photo, white background'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium">{language === 'sw' ? 'Leseni ya Sasa (kwa kufanya upya)' : 'Current License (for renewal)'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'sw' ? 'Pande zote mbili, nakala wazi' : 'Both sides, clear copy'}</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Help Section */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{language === 'sw' ? 'Unahitaji Msaada?' : 'Need Help?'}</h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'sw' ? 'Wasiliana nasi' : 'Contact us'}
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg">
                    <span className="text-2xl">📞</span>
                    <span className="font-medium">+255 XXX XXX XXX</span>
                  </div>
                  <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg">
                    <span className="text-2xl">✉️</span>
                    <span className="font-medium">support@example.com</span>
                  </div>
                  <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-lg">
                    <span className="text-2xl">🕐</span>
                    <span className="font-medium">{language === 'sw' ? 'Jumatatu-Ijumaa, 8 Asubuhi-5 Jioni' : 'Mon-Fri, 8AM-5PM'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LicenseRequest;
