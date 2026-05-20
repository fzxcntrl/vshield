import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Loader2, Download, ShieldCheck } from 'lucide-react';

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchCandidate = async () => {
    try {
      const res = await api.get(`/candidates/${id}`);
      setCandidate(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await api.post(`/candidates/${id}/verify`);
      await fetchCandidate();
    } catch (error) {
      alert('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/candidates/${id}/report`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      alert('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  if (!candidate) {
    return <div className="text-center py-12 text-gray-500">Candidate not found</div>;
  }

  const StatusIcon = candidate.status === 'VERIFIED' ? CheckCircle2 : candidate.status === 'FAILED' ? XCircle : AlertCircle;
  const statusColor = candidate.status === 'VERIFIED' ? 'text-green-600' : candidate.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600';

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{candidate.fullName}</h2>
            <p className="text-gray-500 text-sm mt-1">{candidate.email} • {candidate.phone}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusColor} bg-opacity-10`}>
              <StatusIcon size={18} />
              {candidate.status}
            </div>
            <div className="flex gap-2">
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
                  disabled={downloading}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
                >
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={18} />}
                  Report
                </button>
              )}
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
                  {candidate.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim()}
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

      {candidate.verificationLogs && candidate.verificationLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Verification Timeline</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {candidate.verificationLogs.map((log: any, index: number) => (
                <div key={log.id} className="relative pl-8">
                  {index !== candidate.verificationLogs.length - 1 && (
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
                      {JSON.parse(log.responsePayload).message || JSON.stringify(JSON.parse(log.responsePayload))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
