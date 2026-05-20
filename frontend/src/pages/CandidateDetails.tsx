import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Loader2, Download, ShieldCheck, Trash2, Pencil } from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import CandidateFormModal from '../components/CandidateFormModal';
import VerificationProgress from '../components/VerificationProgress';
import PDFPreviewModal from '../components/PDFPreviewModal';
import Avatar from '../components/Avatar';
import type { Candidate, CandidateStatus, VerificationLog } from '../types/candidate';

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  console.log('CandidateDetails rendered, ID:', id);

  const fetchCandidate = async () => {
    try {
      console.log('Fetching candidate with ID:', id);
      const res = await api.get(`/candidates/${id}`);
      console.log('Candidate data received:', res.data);
      setCandidate(res.data);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      addToast('Failed to load candidate details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered for ID:', id);
    void fetchCandidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerify = async () => {
    setVerifying(true);
    setShowProgress(true);
    try {
      // Wait for the progress animation to complete (about 3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await api.post(`/candidates/${id}/verify`);
      await fetchCandidate();
      addToast('Verification completed', 'success');
    } catch {
      addToast('Verification failed', 'error');
    } finally {
      setVerifying(false);
      setShowProgress(false);
    }
  };

  const handleDownloadReport = () => {
    if (!candidate) return;
    
    try {
      setShowPDFPreview(true);
    } catch {
      addToast('Failed to open report preview', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) return;
    try {
      await api.delete(`/candidates/${id}`);
      addToast('Candidate deleted successfully', 'success');
      navigate('/dashboard/candidates');
    } catch {
      addToast('Failed to delete candidate', 'error');
    }
  };

  if (loading) {
    console.log('Showing loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    console.log('No candidate found');
    return <div className="text-center py-12 text-gray-500">Candidate not found</div>;
  }

  console.log('Rendering candidate details for:', candidate.fullName);

  const StatusIcon = candidate.status === 'VERIFIED' ? CheckCircle2 : candidate.status === 'FAILED' ? XCircle : AlertCircle;
  const statusColorByStatus: Record<CandidateStatus, string> = {
    VERIFIED: 'text-green-600 border-green-200 bg-green-50',
    FAILED: 'text-red-600 border-red-200 bg-red-50',
    PARTIAL: 'text-orange-600 border-orange-200 bg-orange-50',
    PENDING: 'text-yellow-600 border-yellow-200 bg-yellow-50',
  };
  const statusColor = statusColorByStatus[candidate.status];
  const verificationLogs = candidate.verificationLogs ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/dashboard/candidates')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Candidates
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar name={candidate.fullName} size="xl" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{candidate.fullName}</h2>
                <p className="text-gray-500 text-sm mt-1">{candidate.email} • {candidate.phone}</p>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusColor}`}>
                <StatusIcon size={18} />
                {candidate.status}
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleVerify}
                  disabled={verifying || candidate.status === 'VERIFIED'}
                  className="bg-primary hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck size={18} />}
                  {candidate.status === 'VERIFIED' ? 'Verified' : 'Run Verification'}
                </button>
                {(candidate.status === 'VERIFIED' || candidate.status === 'FAILED') && (
                  <button 
                    onClick={handleDownloadReport}
                    className="bg-primary hover:bg-blue-800 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
                  >
                    <Download size={18} />
                    View Report
                  </button>
                )}
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
                >
                  <Pencil size={18} />
                  Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Personal Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-gray-500 font-medium">Date of Birth</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{format(new Date(candidate.dob), 'dd MMM yyyy')}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 font-medium">Address</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">{candidate.address}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Identity Documents</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-gray-500 font-medium">Aadhaar Number</dt>
                <dd className="text-sm font-mono font-medium text-gray-900 mt-1 bg-gray-50 px-2 py-1 rounded inline-block">
                  XXXX-XXXX-{candidate.aadhaarNumber?.slice(-4) || 'XXXX'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 font-medium">PAN Number</dt>
                <dd className="text-sm font-mono font-medium text-gray-900 mt-1 bg-gray-50 px-2 py-1 rounded inline-block uppercase">
                  {candidate.panNumber}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {verificationLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Verification Timeline</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {verificationLogs.map((log: VerificationLog, index: number) => (
                <div key={log.id} className="relative pl-8">
                  {index !== verificationLogs.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-gray-200"></div>
                  )}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    log.verificationStatus === 'verified' ? 'border-green-500 bg-green-50 text-green-500' : 'border-red-500 bg-red-50 text-red-500'
                  }`}>
                    {log.verificationStatus === 'verified' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{log.verificationType} Verification</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        log.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.verificationStatus.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{format(new Date(log.verifiedAt), 'dd MMM yyyy, HH:mm:ss')}</p>
                    <div className="mt-2 text-sm bg-gray-50 p-3 rounded-lg text-gray-600 font-mono text-xs overflow-x-auto">
                      {log.responsePayload?.message || JSON.stringify(log.responsePayload)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CandidateFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={() => {
          setIsEditModalOpen(false);
          void fetchCandidate();
          addToast('Candidate updated successfully', 'success');
        }}
        candidate={candidate}
      />

      <VerificationProgress isOpen={showProgress} />

      {candidate && (
        <PDFPreviewModal
          isOpen={showPDFPreview}
          onClose={() => setShowPDFPreview(false)}
          candidate={candidate}
          userName="Admin"
        />
      )}
    </div>
  );
}
