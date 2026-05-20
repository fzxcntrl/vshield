import { X, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Candidate } from '../types/candidate';
import { generatePDFReport } from '../utils/pdfGenerator';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  userName?: string;
}

export default function PDFPreviewModal({ isOpen, onClose, candidate, userName = 'Admin' }: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && candidate) {
      // Generate PDF blob for preview
      const blob = generatePDFReport(candidate, userName, true); // true = return blob instead of download
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

        // Cleanup
        return () => {
          URL.revokeObjectURL(url);
        };
      }
    }
  }, [isOpen, candidate, userName]);

  const handleDownload = () => {
    generatePDFReport(candidate, userName, false); // false = download
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Verification Report</h2>
            <p className="text-sm text-gray-500 mt-1">{candidate.fullName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
            >
              <Download size={18} />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading report preview...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            This report contains confidential information
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-800 rounded-lg transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
