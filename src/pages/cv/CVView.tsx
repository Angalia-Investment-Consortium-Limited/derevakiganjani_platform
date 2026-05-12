import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Download, Mail, Phone, MapPin } from 'lucide-react';
import type { CVData } from '@/types/cv';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { StandaloneAdminLayout } from '@/components/admin/StandaloneAdminLayout';

const CVView = () => {
  const { id } = useParams(); // cv_request / cv id
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(role => ['Admin', 'Staff', 'SuperAdmin'].includes(role));
  const [isLoading, setIsLoading] = useState(true);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const cvRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchCV = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, 'cvs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCvData(docSnap.data() as CVData);
        } else {
          toast({ title: "Error", description: "CV not found.", variant: "destructive" });
        }
      } catch (err) {
        console.error("Error fetching CV:", err);
        toast({ title: "Error", description: "Failed to load CV.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCV();
  }, [id, toast]);

  const handleDownloadPDF = async () => {
    if (!cvRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cvRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CV_${cvData?.personalInfo?.fullName.replace(/\s+/g, '_') || 'Dereva'}.pdf`);
      
      toast({ title: "Success", description: "CV downloaded successfully." });
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const renderLayout = (content: React.ReactNode) => {
    if (isAdmin) {
      return (
        <StandaloneAdminLayout>
          {content}
        </StandaloneAdminLayout>
      );
    }
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 py-8">
          {content}
        </main>
        <Footer />
      </div>
    );
  };

  if (isLoading) return renderLayout(
    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  );

  if (!cvData) return renderLayout(
    <div className="flex justify-center items-center text-center p-20">CV Not Found.</div>
  );

  return renderLayout(
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => window.history.length > 1 ? navigate(-1) : window.close()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back / Close
        </Button>
            <Button onClick={handleDownloadPDF} disabled={isDownloading}>
              {isDownloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Download PDF
            </Button>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200" style={{ minHeight: '1056px' }}>
            <div ref={cvRef} className="p-10 bg-white text-gray-900 font-sans">
              
              {/* Header */}
              <div className="border-b-2 border-primary pb-6 mb-6 flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-tight">{cvData.personalInfo.fullName}</h1>
                  <h2 className="text-xl text-primary font-medium mt-1">Professional Driver</h2>
                </div>
                <div className="text-right text-sm text-gray-600 space-y-1">
                  {cvData.personalInfo.phone && <div className="flex items-center justify-end gap-2"><Phone className="h-3 w-3" /> {cvData.personalInfo.phone}</div>}
                  {cvData.personalInfo.email && <div className="flex items-center justify-end gap-2"><Mail className="h-3 w-3" /> {cvData.personalInfo.email}</div>}
                  {cvData.personalInfo.address && <div className="flex items-center justify-end gap-2"><MapPin className="h-3 w-3" /> {cvData.personalInfo.address}</div>}
                </div>
              </div>

              {/* Body Grid */}
              <div className="grid grid-cols-3 gap-8">
                
                {/* Left Column */}
                <div className="col-span-2 space-y-6">
                  
                  {/* Summary */}
                  {cvData.personalInfo.professionalSummary && (
                    <section>
                      <h3 className="text-lg font-bold text-primary uppercase border-b border-gray-300 pb-1 mb-3">Professional Summary</h3>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{cvData.personalInfo.professionalSummary}</p>
                    </section>
                  )}

                  {/* Experience */}
                  {cvData.experience && cvData.experience.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold text-primary uppercase border-b border-gray-300 pb-1 mb-3">Work Experience</h3>
                      <div className="space-y-4">
                        {cvData.experience.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                              <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                              <span className="text-sm text-gray-500 font-medium">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <p className="text-sm text-primary font-medium mb-2">{exp.company}</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{exp.responsibilities}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column */}
                <div className="col-span-1 space-y-6">
                  
                  {/* Licenses */}
                  {cvData.licenseCategories && cvData.licenseCategories.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold text-primary uppercase border-b border-gray-300 pb-1 mb-3">Licenses</h3>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {cvData.licenseCategories.map(cat => <li key={cat}>Class {cat}</li>)}
                      </ul>
                    </section>
                  )}

                  {/* Vehicles */}
                  {cvData.preferredVehicles && cvData.preferredVehicles.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold text-primary uppercase border-b border-gray-300 pb-1 mb-3">Vehicle Types</h3>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {cvData.preferredVehicles.map(v => <li key={v}>{v}</li>)}
                      </ul>
                    </section>
                  )}

                  {/* Referees */}
                  {cvData.referees && cvData.referees.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold text-primary uppercase border-b border-gray-300 pb-1 mb-3">Referees</h3>
                      <div className="space-y-3">
                        {cvData.referees.map(ref => (
                          <div key={ref.id} className="text-sm text-gray-700">
                            <p className="font-semibold text-gray-900">{ref.name}</p>
                            <p>{ref.company}</p>
                            <p>{ref.phone}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default CVView;
