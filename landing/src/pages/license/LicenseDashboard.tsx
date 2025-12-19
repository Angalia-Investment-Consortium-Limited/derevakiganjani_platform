/**
 * License Dashboard Page
 * 
 * Main dashboard for license services with three options:
 * 1. New License (Leseni Mpya)
 * 2. License Renewal (Kufanya Upya)
 * 3. LATRA Exam Registration (Jisajili Mtihani wa LATRA)
 */

import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, RefreshCw, ClipboardCheck, ArrowRight, History, Search } from 'lucide-react';

export default function LicenseDashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const services = [
    {
      id: 'new-license',
      titleSw: 'Leseni Mpya',
      titleEn: 'New License',
      descriptionSw: 'Omba leseni mpya ya udereva',
      descriptionEn: 'Apply for a new driving license',
      icon: FileText,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      path: '/license/apply/new'
    },
    {
      id: 'renewal',
      titleSw: 'Kufanya Upya Leseni',
      titleEn: 'License Renewal',
      descriptionSw: 'Fanya upya leseni yako ya udereva',
      descriptionEn: 'Renew your existing driving license',
      icon: RefreshCw,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/license/apply/renewal'
    },
    {
      id: 'latra-exam',
      titleSw: 'Jisajili Mtihani wa LATRA',
      titleEn: 'LATRA Exam Registration',
      descriptionSw: 'Jisajili kwa mtihani wa udereva wa LATRA (PSV/HGV)',
      descriptionEn: 'Register for LATRA driving exam (PSV/HGV)',
      icon: ClipboardCheck,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      path: '/license/apply/latra'
    }
  ];

  const quickActions = [
    {
      id: 'my-applications',
      titleSw: 'Maombi Yangu',
      titleEn: 'My Applications',
      descriptionSw: 'Angalia maombi yako yote',
      descriptionEn: 'View all your applications',
      icon: History,
      path: '/license/my-applications'
    },
    {
      id: 'track-status',
      titleSw: 'Fuatilia Hali',
      titleEn: 'Track Status',
      descriptionSw: 'Fuatilia hali ya ombi lako',
      descriptionEn: 'Track your application status',
      icon: Search,
      path: '/license/track'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/5">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {language === 'sw' ? 'Leseni ya Udereva' : 'Driving License'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'sw' ? 'Chagua huduma unayohitaji kwa leseni yako ya udereva' : 'Choose the service you need for your driving license'}
          </p>
        </div>

        {/* Main Services */}
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'sw' ? 'Huduma za Leseni' : 'License Services'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.id}
                  className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                  onClick={() => navigate(service.path)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">
                      {language === 'sw' ? service.titleSw : service.titleEn}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {language === 'sw' ? service.descriptionSw : service.descriptionEn}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="ghost"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      {language === 'sw' ? 'Anza Sasa' : 'Start Now'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'sw' ? 'Vitendo vya Haraka' : 'Quick Actions'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.id}
                  className="group cursor-pointer transition-all hover:shadow-md"
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {language === 'sw' ? action.titleSw : action.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {language === 'sw' ? action.descriptionSw : action.descriptionEn}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Information Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                {language === 'sw' ? 'Taarifa Muhimu' : 'Important Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <p>
                  {language === 'sw' ? 'Hakikisha una nyaraka zote zinazohitajika kabla ya kuanza ombi' : 'Ensure you have all required documents before starting your application'}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <p>
                  {language === 'sw' ? 'Faili zote zinapaswa kuwa PDF, JPG au PNG na ukubwa usizidi 8 MB' : 'All files should be PDF, JPG or PNG and not exceed 8 MB'}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <p>
                  {language === 'sw' ? 'Utapokea namba ya kumbukumbu baada ya kuwasilisha ombi lako' : 'You will receive a reference number after submitting your application'}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <p>
                  {language === 'sw' ? 'Unaweza kufuatilia hali ya ombi lako kwa kutumia namba ya kumbukumbu' : 'You can track your application status using the reference number'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Required Documents Info */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'sw' ? 'Nyaraka Zinazohitajika' : 'Required Documents'}</CardTitle>
              <CardDescription>
                {language === 'sw' ? 'Nyaraka hizi zinahitajika kwa huduma tofauti za leseni' : 'These documents are required for different license services'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{language === 'sw' ? 'Leseni Mpya' : 'New License'}</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>{language === 'sw' ? 'Kitambulisho cha Taifa (NIDA)' : 'National ID (NIDA)'}</li>
                    <li>{language === 'sw' ? 'Picha ya Pasi' : 'Passport Photo'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{language === 'sw' ? 'Kufanya Upya Leseni' : 'License Renewal'}</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>{language === 'sw' ? 'Kitambulisho cha Taifa (NIDA)' : 'National ID (NIDA)'}</li>
                    <li>{language === 'sw' ? 'Leseni ya Udereva ya Zamani' : 'Old Driving License'}</li>
                    <li>{language === 'sw' ? 'Picha ya Pasi' : 'Passport Photo'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{language === 'sw' ? 'Mtihani wa LATRA' : 'LATRA Exam'}</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>{language === 'sw' ? 'Kitambulisho cha Taifa (NIDA)' : 'National ID (NIDA)'}</li>
                    <li>{language === 'sw' ? 'Leseni ya Udereva' : 'Driving License'}</li>
                    <li>{language === 'sw' ? 'Cheti cha PSV au HGV (kulingana na aina)' : 'PSV or HGV Certificate (depending on type)'}</li>
                    <li>{language === 'sw' ? 'Picha ya Pasi' : 'Passport Photo'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
