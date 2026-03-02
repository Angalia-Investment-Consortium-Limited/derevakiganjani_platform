
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateCertificate } from '@/services/CertificateGenerationService';
import { useToast } from '@/hooks/use-toast';

interface CertificateData {
  name: string;
  course: string;
  date: string;
}

interface FirestoreCertificateData {
  driverId: string;
  driverName: string;
  course_name: string;
  testAttemptId: string;
  certificate_url: string;
  status: 'Active';
  issue_date: any;
}

export const useCertificateGenerator = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const generationMutation = useMutation({
    mutationFn: async ({ data, userId, firestoreData }: { data: CertificateData, userId: string, firestoreData: Omit<FirestoreCertificateData, 'certificate_url' | 'issue_date' | 'status'> }) => {
      setIsGenerating(true);

      // 1. Generate PDF and get URL
      const url = await generateCertificate(data, userId);

      // 2. Create Firestore document
      const certificateDoc: FirestoreCertificateData = {
        ...firestoreData,
        certificate_url: url,
        issue_date: serverTimestamp(),
        status: 'Active',
      };
      
      const certificatesCollection = collection(db, 'certificates');
      await addDoc(certificatesCollection, certificateDoc);

      return url;
    },
    onSuccess: () => {
      toast({ title: "Certificate Generated", description: "The certificate has been created and saved." });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
    onError: (err) => {
      console.error("Certificate Generation Error: ", err);
      toast({ title: "Generation Failed", description: `Could not generate the certificate: ${(err as Error).message}`, variant: 'destructive' });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  return {
    generate: generationMutation.mutateAsync,
    isGenerating,
    isError: generationMutation.isError,
  };
};
