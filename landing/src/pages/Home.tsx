import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ServiceCard } from '@/components/ServiceCard';
import { Button } from '@/components/ui/button';
import { FileText, GraduationCap, BookOpen, Briefcase, UserPlus, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const services = [
    {
      icon: FileText,
      title: t('leseni'),
      description: t('leseniDesc'),
      href: '/license-request',
      iconColor: 'text-primary',
    },
    {
      icon: GraduationCap,
      title: t('jiTesti'),
      description: t('jiTestiDesc'),
      href: '/test/category',
      iconColor: 'text-warm',
    },
    {
      icon: BookOpen,
      title: t('elimika'),
      description: t('elimikaDesc'),
      href: '/elimika',
      iconColor: 'text-secondary',
    },
    {
      icon: Briefcase,
      title: t('ajiraYaUdereva'),
      description: t('ajiraDesc'),
      href: '/ajira/jobs',
      iconColor: 'text-accent',
    },
    {
      icon: UserPlus,
      title: t('ajiriDereva'),
      description: t('ajiriDesc'),
      href: '/ajiri-dereva/register',
      iconColor: 'text-warm',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-warm/5 to-secondary/5 py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {t('heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-primary font-semibold">
              {t('heroSubtitle')}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('heroDescription')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button size="lg" onClick={() => navigate('/test/category')} className="font-semibold">
                {t('startTest')}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/elimika')}>
                {t('learnMore')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('services')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access all driver services in one place
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Join thousands of drivers improving their skills and managing licenses digitally
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>
            {t('getStarted')}
          </Button>
        </div>
      </section>

      <Footer />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/255123456789"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
};

export default Home;
