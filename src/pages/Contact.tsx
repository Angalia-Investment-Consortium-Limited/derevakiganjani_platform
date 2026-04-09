import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import contactHeroImage from '@/assets/images/10.jpg';

export default function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: t('Error Title'),
        description: t('Fill Required Fields'),
        variant: 'destructive',
      });
      return;
    }

    // TODO: Connect to backend API
    console.log('Contact form submitted:', formData);

    toast({
      title: t('Message Sent Title'),
      description: t('Message Sent Desc'),
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: t('Office Address Label'),
      content: 'MDV Vehicle Fleet Limited, Dar es Salaam, Tanzania,⁠ ⁠Plot# 151, Bima Road, Mikocheni B", Dar es Salaam'
      ,
      subContent: t('Visit By Appointment'),
    },
    {
      icon: Phone,
      title: t('Phone Label'),
      content: '+255 748 467 348',
      subContent: t('Working Hours Label'),
    },
    {
      icon: Mail,
      title: t('Email Label'),
      content: 'derevakiganjani@mdvfleet.co.tz',
      subContent: t('Support Email Label'),
    },
    {
      icon: Clock,
      title: t('Office Hours Label'),
      content: t('Monday Friday'),
      subContent: '8:00 AM - 5:00 PM EAT',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative py-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${contactHeroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/60" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                {t('Contact Title')}
              </h1>
              <p className="text-xl text-white/90">
                {t('Contact Subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{info.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="font-medium">{info.content}</p>
                    <p className="text-sm text-muted-foreground">{info.subContent}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form and WhatsApp */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-2xl">{t('Send Message Title')}</CardTitle>
                  <CardDescription>{t('Send Message Desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('Full Name')} *</Label>
                        <Input
                          id="name"
                          placeholder={t('Name Placeholder')}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('Email Label')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t('Email Placeholder')}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('Phone Number')}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+255 123 456 789"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">{t('Subject Label')} *</Label>
                        <Select
                          value={formData.subject}
                          onValueChange={(value) => setFormData({ ...formData, subject: value })}
                        >
                          <SelectTrigger id="subject">
                            <SelectValue placeholder={t('Select Subject')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">{t('General Inquiry')}</SelectItem>
                            <SelectItem value="support">{t('Technical Support')}</SelectItem>
                            <SelectItem value="business">{t('Business Partnership')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('Message Label')} *</Label>
                      <Textarea
                        id="message"
                        placeholder={t('Message Placeholder')}
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full md:w-auto">
                      {t('sendMessage')}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* WhatsApp Contact */}
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t('WhatsApp Title')}</CardTitle>
                  <CardDescription>{t('WhatsApp Desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('WhatsApp Available')}
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    asChild
                  >
                    <a
                      href="https://wa.me/255748467348?text=Hello%20Dereva%2Kiganjani"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {t('Chat On WhatsApp')}
                    </a>
                  </Button>

                  <div className="pt-6 border-t">
                    <h4 className="font-semibold mb-3">{t('Quick Links')}</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          {t('Help Center')}
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          {t('User Guide')}
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          {t('FAQ')}
                        </a>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-0">
                  <div className="h-96 bg-muted flex items-center justify-center rounded-lg">
                    <div className="text-center space-y-2">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">{t('Map Placeholder')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
