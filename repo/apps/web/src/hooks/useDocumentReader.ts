import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import toast from 'react-hot-toast';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentContent {
  text: string;
  pages?: string[];
  metadata?: {
    title?: string;
    author?: string;
    pageCount?: number;
    fileSize?: number;
    fileType?: string;
  };
}

interface UseDocumentReaderReturn {
  documentContent: DocumentContent | null;
  isProcessing: boolean;
  error: string | null;
  processDocument: (file: File) => Promise<void>;
  clearDocument: () => void;
  readAloud: (text: string, options?: SpeechSynthesisUtterance) => void;
  stopReading: () => void;
  isReading: boolean;
}

export function useDocumentReader(): UseDocumentReaderReturn {
  const [documentContent, setDocumentContent] = useState<DocumentContent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processDocument = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const fileType = file.type;
      const fileSize = file.size;
      let content: DocumentContent;

      if (fileType === 'application/pdf') {
        content = await processPDF(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        content = await processDocx(file);
      } else if (fileType === 'application/msword') {
        content = await processDoc(file);
      } else if (fileType === 'text/plain') {
        content = await processTextFile(file);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      content.metadata = {
        ...content.metadata,
        fileSize,
        fileType,
      };

      setDocumentContent(content);
      toast.success(`Document processed successfully! ${content.metadata?.pageCount || 1} page(s) loaded.`);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process document';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Document processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processPDF = async (file: File): Promise<DocumentContent> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await pdfjs.getDocument(typedArray).promise;
          
          const pages: string[] = [];
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ');
            
            pages.push(pageText);
            fullText += pageText + '\n\n';
          }

          const metadata = await pdf.getMetadata();

          resolve({
            text: fullText.trim(),
            pages,
            metadata: {
              title: metadata.info?.Title || file.name,
              author: metadata.info?.Author,
              pageCount: pdf.numPages,
            },
          });
        } catch (error) {
          reject(new Error('Failed to process PDF file'));
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read PDF file'));
      fileReader.readAsArrayBuffer(file);
    });
  };

  const processDocx = async (file: File): Promise<DocumentContent> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          
          resolve({
            text: result.value,
            metadata: {
              title: file.name,
              pageCount: 1, // DOCX doesn't have clear page boundaries
            },
          });
        } catch (error) {
          reject(new Error('Failed to process DOCX file'));
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read DOCX file'));
      fileReader.readAsArrayBuffer(file);
    });
  };

  const processDoc = async (file: File): Promise<DocumentContent> => {
    // For legacy .doc files, we'll provide a fallback
    throw new Error('Legacy .doc files are not supported. Please convert to .docx or .pdf format.');
  };

  const processTextFile = async (file: File): Promise<DocumentContent> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = (e) => {
        const text = e.target?.result as string;
        resolve({
          text,
          metadata: {
            title: file.name,
            pageCount: 1,
          },
        });
      };

      fileReader.onerror = () => reject(new Error('Failed to read text file'));
      fileReader.readAsText(file);
    });
  };

  const readAloud = useCallback((text: string, options?: Partial<SpeechSynthesisUtterance>) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in this browser');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options
    if (options) {
      Object.assign(utterance, options);
    }

    // Default settings for better accessibility
    utterance.rate = options?.rate || 0.9;
    utterance.pitch = options?.pitch || 1.0;
    utterance.volume = options?.volume || 1.0;

    utterance.onstart = () => {
      setIsReading(true);
      toast.success('Started reading document');
    };

    utterance.onend = () => {
      setIsReading(false);
    };

    utterance.onerror = (event) => {
      setIsReading(false);
      toast.error('Speech synthesis failed');
      console.error('Speech synthesis error:', event);
    };

    speechSynthesis.speak(utterance);
  }, []);

  const stopReading = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsReading(false);
      toast.success('Stopped reading');
    }
  }, []);

  const clearDocument = useCallback(() => {
    setDocumentContent(null);
    setError(null);
    stopReading();
  }, [stopReading]);

  return {
    documentContent,
    isProcessing,
    error,
    processDocument,
    clearDocument,
    readAloud,
    stopReading,
    isReading,
  };
}