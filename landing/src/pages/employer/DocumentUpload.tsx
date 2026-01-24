import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, Upload, FileText, AlertCircle } from 'lucide-react';
import { useFrappePostCall, useFrappeGetCall } from 'frappe-react-sdk';

interface DocumentType {
  type: string;
  label: string;
  required: boolean;
  uploaded: boolean;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  file?: File;
  comments?: string;
}

const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const { call: uploadCall, loading: uploadLoading } = useFrappePostCall('derevahuduma_platform.dereva_huduma_platform.doctype.employer_document.employer_document.upload_employer_document');
  const { call: getDocsCall } = useFrappePostCall('derevahuduma_platform.dereva_huduma_platform.doctype.employer_document.employer_document.get_employer_documents');
  const { call: submitCall, loading: submitLoading } = useFrappePostCall('derevahuduma_platform.api.employer.submit_verification_request');
  const { call: getProfileCall } = useFrappePostCall('derevahuduma_platform.api.employer.get_employer_profile');
  const [documents, setDocuments] = useState<DocumentType[]>([
    { type: 'Business Registration', label: 'Business Registration Certificate', required: true, uploaded: false, status: 'pending' },
    { type: 'Tax Certificate', label: 'Tax Compliance Certificate', required: true, uploaded: false, status: 'pending' },
    { type: 'Company License', label: 'Company Operating License', required: true, uploaded: false, status: 'pending' },
    { type: 'BRELA Certificate', label: 'BRELA Registration Certificate', required: true, uploaded: false, status: 'pending' }
  ]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadExistingDocuments();
  }, []);

  const loadExistingDocuments = async () => {
    try {
      const result = await getDocsCall({});
      if (result.success && result.documents) {
        setDocuments(prev => prev.map(doc => {
          const existing = result.documents.find((d: any) => d.document_type === doc.type);
          if (existing) {
            return {
              ...doc,
              uploaded: true,
              status: existing.verification_status.toLowerCase() as any,
              comments: existing.reviewer_comments
            };
          }
          return doc;
        }));
      }
    } catch (err) {
      console.error('Failed to load existing documents:', err);
    }
  };

  const handleFileSelect = (documentType: string, file: File) => {
    setDocuments(prev => prev.map(doc =>
      doc.type === documentType
        ? { ...doc, file, uploaded: false, status: 'pending' }
        : doc
    ));
    setError(null);
  };

  const uploadDocument = async (documentType: string) => {
    const doc = documents.find(d => d.type === documentType);
    if (!doc || !doc.file) return;

    setUploading(documentType);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', doc.file);
      formData.append('document_type', documentType);

      // Get current employer
      const employerResult = await getProfileCall({});
      if (!employerResult.success) {
        throw new Error('Failed to get employer profile');
      }

      formData.append('employer', employerResult.profile.name);

      const result = await uploadCall(formData);

      if (result.success) {
        setDocuments(prev => prev.map(d =>
          d.type === documentType
            ? { ...d, uploaded: true, status: 'uploaded' as any }
            : d
        ));
        setSuccess(`${documentType} uploaded successfully`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const getUploadProgress = () => {
    const uploaded = documents.filter(d => d.uploaded).length;
    return (uploaded / documents.length) * 100;
  };

  const canSubmitVerification = () => {
    return documents.every(d => d.uploaded);
  };

  const handleSubmitVerification = async () => {
    try {
      setError(null);
      const result = await submitCall({});

      if (result.success) {
        setSuccess('Verification request submitted successfully! Please complete your payment.');
        setTimeout(() => {
          navigate('/employer/verification-status');
        }, 2000);
      } else {
        setError(result.message || 'Failed to submit verification request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit verification request');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploaded':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <Upload className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-green-500 bg-green-50';
      case 'rejected':
        return 'border-red-500 bg-red-50';
      case 'uploaded':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Verification</h1>
        <p className="text-gray-600">Upload required documents to verify your employer account</p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Upload Progress</span>
            <span className="text-sm text-gray-500">{Math.round(getUploadProgress())}%</span>
          </div>
          <Progress value={getUploadProgress()} className="w-full" />
          <p className="text-xs text-gray-500 mt-2">
            {documents.filter(d => d.uploaded).length} of {documents.length} documents uploaded
          </p>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Document Upload Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((doc) => (
          <Card key={doc.type} className={`transition-all ${getStatusColor(doc.status)}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{doc.label}</span>
                {getStatusIcon(doc.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doc.comments && (
                <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                  <strong>Reviewer Comments:</strong> {doc.comments}
                </div>
              )}

              {!doc.uploaded ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(doc.type, file);
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {doc.file && (
                    <Button
                      onClick={() => uploadDocument(doc.type)}
                      disabled={uploading === doc.type}
                      className="w-full"
                    >
                      {uploading === doc.type ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Document Uploaded</p>
                  <p className="text-sm text-gray-500">Status: {doc.status}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      {canSubmitVerification() && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Ready to Submit for Verification</h3>
              <p className="text-gray-600">
                All required documents have been uploaded. Click below to submit your verification request and proceed to payment.
              </p>
              <Button
                onClick={handleSubmitVerification}
                disabled={submitLoading}
                size="lg"
                className="px-8"
              >
                {submitLoading ? 'Submitting...' : 'Submit Verification Request'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements Info */}
      <Card>
        <CardHeader>
          <CardTitle>Document Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• All documents must be in PDF, JPG, JPEG, or PNG format</li>
            <li>• Maximum file size: 5MB per document</li>
            <li>• Documents must be clear and legible</li>
            <li>• Business Registration and Tax Certificate must be current (not expired)</li>
            <li>• All documents will be reviewed by our verification team</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;
