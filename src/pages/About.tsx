import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileCheck, Award, Briefcase } from 'lucide-react';
import abtImage from '../assets/logo.png'

export default function About() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = [
    { label: t('driversTrainedLabel'), value: '5,000+' },
    { label: t('testsCompletedLabel'), value: '12,000+' },
    { label: t('licensesProcessedLabel'), value: '3,500+' },
    { label: t('placementsMadeLabel'), value: '1,200+' },
  ];

  const offerings = [
    {
      icon: BookOpen,
      title: t('elimika'),
      description: t('elimikaAboutDesc'),
    },
    {
      icon: FileCheck,
      title: t('jiTesti'),
      description: t('jiTestiAboutDesc'),
    },
    {
      icon: Award,
      title: t('leseni'),
      description: t('leseniAboutDesc'),
    },
    {
      icon: Briefcase,
      title: t('recruitmentLabel'),
      description: t('recruitmentAboutDesc'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {t('aboutTitle')}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('aboutSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-center mb-8">{t('whoWeAreTitle')}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('whoWeAreText')}
              </p>
            </div>
          </div>
        </section>

        {/* Backed by MDV */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <img src={abtImage} alt="Dereva Kiganjani" className="h-[140px] w-auto" />
                  </div>
                  <CardTitle className="text-2xl">{t('backedByMDVTitle')}</CardTitle>
                  <CardDescription className="text-base">
                    {t('backedByMDVText')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" asChild>
                    <a href="https://mdvfleet.co.tz" target="_blank" rel="noopener noreferrer">
                      {t('visitMDVWebsite')}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">{t('whatWeOfferTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {offerings.map((offering, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <offering.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{offering.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{offering.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">{t('impactStatsTitle')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold">{t('exploreServicesTitle')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('exploreServicesText')}
              </p>
              <Button size="lg" onClick={() => navigate('/services')}>
                {t('exploreServices')}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
