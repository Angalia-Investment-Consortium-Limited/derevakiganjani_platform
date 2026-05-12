import React from 'react';
import { generatePdfFromElement } from '@/lib/pdf';
import { Download, CheckCircle, ArrowRight } from 'lucide-react';

interface ReceiptViewerProps {
  receipt: {
    id: string;
    referenceNumber: string;
    issuedAt: string;
    userName: string;
    serviceName: string;
    paymentMethod: string;
    currency: string;
    amount: number;
  };
  onContinue?: () => void;
  continueText?: string;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ receipt, onContinue, continueText = "Continue" }) => {
  const handleDownload = () => {
    generatePdfFromElement('receipt-container', `receipt_${receipt.referenceNumber}.pdf`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md w-full">
        {/* PDF Export Area */}
        <div id="receipt-container" className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-6 relative">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Dereva Kiganjani" className="h-24 w-auto mx-auto mb-4 object-contain" />
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Receipt</h2>
            <p className="text-green-600 font-medium mt-1">Payment Completed</p>
          </div>

          <div className="border-t border-b border-gray-100 py-4 mb-4">
            <h3 className="text-lg font-bold text-indigo-700 text-center">DEREVA KIGANJANI</h3>
            <p className="text-sm text-gray-500 text-center">Driver Services</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Receipt ID</span>
              <span className="font-mono text-gray-900 text-sm">{receipt.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Reference</span>
              <span className="font-mono text-gray-900 text-sm">{receipt.referenceNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Date</span>
              <span className="text-gray-900 text-sm">{new Date(receipt.issuedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Customer</span>
              <span className="text-gray-900 text-sm">{receipt.userName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Service</span>
              <span className="text-gray-900 text-sm">{receipt.serviceName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Method</span>
              <span className="text-gray-900 text-sm uppercase">{receipt.paymentMethod}</span>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <span className="block text-gray-500 text-sm mb-1">Total Paid</span>
            <span className="block text-3xl font-bold text-indigo-700">
              {receipt.currency} {receipt.amount.toLocaleString()}
            </span>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-400">
            <p>Thank you for using our services</p>
            <p>info@derevakiganjani.co.tz</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 px-4 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>

          {onContinue && (
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-sm"
            >
              {continueText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;
