import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import { Award, FileCheck, BookOpen, Briefcase, UserCheck } from 'lucide-react';

export default function Services() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const services = [
    {
      icon: Award,
      title: t('leseni'),
      description: t('leseniServiceDesc'),
      features: [
        t('leseniFeature1'),
        t('leseniFeature2'),
        t('leseniFeature3'),
      ],
      route: '/license-request',
    },
    {
      icon: FileCheck,
      title: t('jiTesti'),
      description: t('jiTestiServiceDesc'),
      features: [
        t('jiTestiFeature1'),
        t('jiTestiFeature2'),
        t('jiTestiFeature3'),
      ],
      route: '/test/category',
    },
    {
      icon: BookOpen,
      title: t('elimika'),
      description: t('elimikaServiceDesc'),
      features: [
        t('elimikaFeature1'),
        t('elimikaFeature2'),
        t('elimikaFeature3'),
      ],
      route: '/elimika',
    },
    {
      icon: Briefcase,
      title: t('ajiraYaUdereva'),
      description: t('ajiraServiceDesc'),
      features: [
        t('ajiraFeature1'),
        t('ajiraFeature2'),
        t('ajiraFeature3'),
      ],
      route: '/ajira/jobs',
    },
    {
      icon: UserCheck,
      title: t('ajiriDereva'),
      description: t('ajiriServiceDesc'),
      features: [
        t('ajiriFeature1'),
        t('ajiriFeature2'),
        t('ajiriFeature3'),
      ],
      route: '/ajiri-dereva/register',
    },
  ];

  const howItWorksSteps = [
    { step: '1', title: t('step1Title'), description: t('step1Desc') },
    { step: '2', title: t('step2Title'), description: t('step2Desc') },
    { step: '3', title: t('step3Title'), description: t('step3Desc') },
    { step: '4', title: t('step4Title'), description: t('step4Desc') },
    { step: '5', title: t('step5Title'), description: t('step5Desc') },
  ];

  const faqs = [
    { question: t('faq1Question'), answer: t('faq1Answer') },
    { question: t('faq2Question'), answer: t('faq2Answer') },
    { question: t('faq3Question'), answer: t('faq3Answer') },
    { question: t('faq4Question'), answer: t('faq4Answer') },
    { question: t('faq5Question'), answer: t('faq5Answer') },
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
                {t('servicesTitle')}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('servicesSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Services Cards */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="mr-2 text-primary">•</span>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full" onClick={() => navigate(service.route)}>
                      {t('getStarted')} →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">{t('howItWorksTitle')}</h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
                
                <div className="space-y-8">
                  {howItWorksSteps.map((item, index) => (
                    <div key={index} className="relative flex gap-6 items-start">
                      <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold z-10">
                        {item.step}
                      </div>
                      <div className="flex-1 pt-3">
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">{t('faqTitle')}</h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold">{t('readyToStartTitle')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('readyToStartText')}
              </p>
              <Button size="lg" onClick={() => navigate('/login')}>
                {t('getStarted')}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
