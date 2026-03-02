
import { jsPDF } from 'jspdf';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

interface CertificateData {
  name: string;
  course: string;
  date: string;
}

export const generateCertificate = async (data: CertificateData, userId: string): Promise<string> => {
  const doc = new jsPDF();

  // Add a decorative border
  doc.setDrawColor(0, 105, 217); // Blue color
  doc.setLineWidth(1.5);
  doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10);

  // Add certificate title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(40, 40, 40);
  doc.text('CERTIFICATE OF COMPLETION', 105, 40, { align: 'center' });

  // Add 'Proudly Presented To'
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text('Proudly Presented To', 105, 60, { align: 'center' });

  // Add recipient's name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(0, 105, 217);
  doc.text(data.name, 105, 80, { align: 'center' });

  // Add completion statement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('For successfully completing the course:', 105, 100, { align: 'center' });

  // Add course name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(data.course, 105, 115, { align: 'center' });

  // Add issue date and signature lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setLineWidth(0.5);
  doc.line(40, 150, 100, 150);
  doc.text('Issue Date', 70, 155, { align: 'center' });
  doc.text(data.date, 70, 160, { align: 'center' });

  doc.line(140, 150, 200, 150);
  doc.text('Authorized Signature', 170, 155, { align: 'center' });


  // Convert the PDF to a base64 string
  const pdfAsString = doc.output('datauristring');

  // Upload to Firebase Storage
  const storage = getStorage();
  const storageRef = ref(storage, `certificates/${userId}/${data.course.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  
  await uploadString(storageRef, pdfAsString, 'data_url');
  
  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};
