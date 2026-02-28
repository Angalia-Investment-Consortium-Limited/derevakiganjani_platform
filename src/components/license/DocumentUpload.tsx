
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, File as FileIcon, UploadCloud, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DocumentType } from '@/types/license';
import { DOCUMENT_TYPE_TRANSLATIONS } from '@/types/license';
import {Badge} from "@/components/ui/badge";

export interface UploadedFileState {
  file: File;
  documentType: DocumentType;
}

interface FilePreviewProps {
  fileState: UploadedFileState;
  onRemove: (documentType: DocumentType) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ fileState, onRemove }) => {
  const { file, documentType } = fileState;

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm">
      <div className="flex items-center gap-2">
        <FileIcon className="h-5 w-5 text-gray-500" />
        <span className="font-medium truncate max-w-[150px]">{file.name}</span>
        <Badge variant="outline">{DOCUMENT_TYPE_TRANSLATIONS[documentType]}</Badge>
      </div>
      <Button size="icon" variant="ghost" onClick={() => onRemove(documentType)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface MultiDocumentUploadProps {
  requiredDocuments: DocumentType[];
  uploadedFiles: UploadedFileState[];
  onFileAdd: (file: File, documentType: DocumentType) => void;
  onFileRemove: (documentType: DocumentType) => void;
}

export const MultiDocumentUpload: React.FC<MultiDocumentUploadProps> = ({ requiredDocuments, uploadedFiles, onFileAdd, onFileRemove }) => {
  const { t } = useLanguage();
  const [selectedDocType, setSelectedDocType] = useState<string | undefined>(requiredDocuments[0]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && selectedDocType) {
      onFileAdd(acceptedFiles[0], selectedDocType as DocumentType);
    }
  }, [onFileAdd, selectedDocType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    multiple: false,
    accept: {
        'image/jpeg': ['.jpeg', '.jpg'],
        'image/png': ['.png'],
        'application/pdf': ['.pdf'],
    } 
  });
  
  const availableDocTypes = useMemo(() => 
    requiredDocuments.filter(docType => 
      !uploadedFiles.some(f => f.documentType === docType))
  , [requiredDocuments, uploadedFiles]);

  useEffect(() => {
    if (availableDocTypes.length > 0 && !availableDocTypes.includes(selectedDocType as DocumentType)) {
        setSelectedDocType(availableDocTypes[0]);
    } else if (availableDocTypes.length === 0) {
        setSelectedDocType(undefined);
    }
  }, [availableDocTypes, selectedDocType]);


  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
                <Label htmlFor="doc-type">{t('document_type')}</Label>
                <Select 
                    onValueChange={(value: string) => setSelectedDocType(value)}
                    value={selectedDocType}
                    disabled={availableDocTypes.length === 0}>
                    <SelectTrigger id="doc-type">
                        <SelectValue placeholder={t('select_doc_type')} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableDocTypes.map(docType => (
                        <SelectItem key={docType} value={docType}>{DOCUMENT_TYPE_TRANSLATIONS[docType]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div 
              {...getRootProps()} 
              className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/70'}`}
            >
              <input {...getInputProps()} disabled={!selectedDocType} />
              <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              {isDragActive ?
                <p>{t('drop_files_here')}</p> :
                <p>{t('drag_drop_or_click')}</p>
              }
              {!selectedDocType && <p className="text-xs text-red-500 mt-1">{t('select_doc_type_first')}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="text-green-500 h-5 w-5"/> {t('uploaded_documents')}</h3>
          <ScrollArea className="h-48 w-full rounded-md border">
            <div className="p-4 space-y-2">
              {uploadedFiles.map(fileState => (
                <FilePreview key={fileState.documentType} fileState={fileState} onRemove={onFileRemove} />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
