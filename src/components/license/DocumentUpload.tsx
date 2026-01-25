/**
 * Document Upload Component
 * 
 * Reusable component for uploading license application documents
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentUpload, useFileValidation } from '@/hooks/useLicense';
import type { DocumentType, FileUpload } from '@/types/license';
import { DOCUMENT_TYPE_TRANSLATIONS, FILE_UPLOAD_CONFIG } from '@/types/license';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  documentType: DocumentType;
  onUploadComplete: (file: FileUpload) => void;
  onRemove?: () => void;
  existingFile?: FileUpload;
  required?: boolean;
  disabled?: boolean;
}

export function DocumentUpload({
  documentType,
  onUploadComplete,
  onRemove,
  existingFile,
  required = false,
  disabled = false
}: DocumentUploadProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [localFile, setLocalFile] = useState<FileUpload | undefined>(existingFile);
  
  const { uploadDocument, isUploading, uploadProgress } = useDocumentUpload();
  const { validateFile, createPreview } = useFileValidation();

  const handleFileSelect = useCallback(
    async (file: File) => {
      setUploadError('');

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Faili si sahihi');
        return;
      }

      try {
        // Create preview
        const preview = await createPreview(file);

        // Upload file
        await uploadDocument(file);

        const uploadedFile: FileUpload = {
          file,
          document_type: documentType,
          preview
        };

        setLocalFile(uploadedFile);
        onUploadComplete(uploadedFile);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Kuna tatizo la kupakia faili. Tafadhali jaribu tena.');
      }
    },
    [documentType, validateFile, createPreview, uploadDocument, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, isUploading, handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(() => {
    setLocalFile(undefined);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  }, [onRemove]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`upload-${documentType}`}>
        {DOCUMENT_TYPE_TRANSLATIONS[documentType]}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {!localFile ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
            isDragging && 'border-primary bg-primary/5',
            !isDragging && 'border-input hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed',
            uploadError && 'border-destructive'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            id={`upload-${documentType}`}
            type="file"
            className="hidden"
            accept={FILE_UPLOAD_CONFIG.acceptedExtensions.join(',')}
            onChange={handleFileInputChange}
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('Inapakia')}... {uploadProgress}%
              </p>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-1">
                {t('Bonyeza kupakia au buruta faili hapa')}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, PNG ({t('Ukubwa wa juu')}: 8 MB)
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start gap-3">
            {localFile.preview && localFile.file.type.startsWith('image/') ? (
              <img
                src={localFile.preview}
                alt={localFile.file.name}
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{localFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(localFile.file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-xs text-success">{t('Imepakiwa')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{uploadError}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Multiple Document Upload Component
 * For uploading multiple documents at once
 */
interface MultiDocumentUploadProps {
  requiredDocuments: DocumentType[];
  onUploadComplete: (files: FileUpload[]) => void;
  existingFiles?: FileUpload[];
  disabled?: boolean;
}

export function MultiDocumentUpload({
  requiredDocuments,
  onUploadComplete,
  existingFiles = [],
  disabled = false
}: MultiDocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>(existingFiles);

  const handleFileUpload = useCallback(
    (documentType: DocumentType) => (file: FileUpload) => {
      const newFiles = uploadedFiles.filter((f) => f.document_type !== documentType);
      newFiles.push(file);
      setUploadedFiles(newFiles);
      onUploadComplete(newFiles);
    },
    [uploadedFiles, onUploadComplete]
  );

  const handleFileRemove = useCallback(
    (documentType: DocumentType) => () => {
      const newFiles = uploadedFiles.filter((f) => f.document_type !== documentType);
      setUploadedFiles(newFiles);
      onUploadComplete(newFiles);
    },
    [uploadedFiles, onUploadComplete]
  );

  return (
    <div className="space-y-6">
      {requiredDocuments.map((docType) => {
        const existingFile = uploadedFiles.find((f) => f.document_type === docType);
        return (
          <DocumentUpload
            key={docType}
            documentType={docType}
            onUploadComplete={handleFileUpload(docType)}
            onRemove={handleFileRemove(docType)}
            existingFile={existingFile}
            required
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
