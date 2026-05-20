import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import { Plus, Search, Loader2, Trash2 } from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import CandidateFormModal from '../components/CandidateFormModal';
import PDFPreviewModal from '../components/PDFPreviewModal';
import type { Candidate, CandidateStatus } from '../types/candidate';

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | CandidateStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const fetchCandidates = async () => {
    try {
      const res = await api.get('/candidates');
      setCandidates(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const totalFiltered = filteredCandidates.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage);
  
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: CandidateStatus) => {
    switch(status) {
      case 'VERIFIED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PARTIAL': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const handleVerify = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVerifyingId(id);
    try {
      const res = await api.post(`/candidates/${id}/verify`);
      const updatedCandidate = res.data;
      setCandidates(candidates.map(c => c.id === id ? updatedCandidate : c));
      
      if (updatedCandidate.status === 'VERIFIED') {
        addToast('Both verifications passed successfully', 'success');
      } else if (updatedCandidate.status === 'PARTIAL') {
        addToast('Only one verification passed', 'warning');
      } else {
        addToast('Both verifications failed', 'error');
      }
    } catch {
      addToast('Failed to run verification', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleViewReport = (candidate: Candidate, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCandidate(candidate);
    setShowPDFPreview(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await api.delete(`/candidates/${id}`);
      setCandidates(candidates.filter(c => c.id !== id));
      addToast('Candidate deleted successfully', 'success');
    } catch {
      addToast('Failed to delete candidate', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 text-sm">Manage and verify your candidates here.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} />
          Add Candidate
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'All' | CandidateStatus);
                setCurrentPage(1);
              }}
              className="w-full sm:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-gray-700 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
        <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 font-medium">
          Showing {paginatedCandidates.length} of {totalFiltered} candidates
        </div>
        
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-white">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-900 font-medium text-base">No candidates found.</p>
                      <p className="text-gray-500 mt-1 text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{candidate.fullName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{candidate.email}</div>
                      <div className="text-gray-500 text-xs">{candidate.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(candidate.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 border rounded-full text-xs font-semibold ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <button 
                        onClick={(e) => handleDelete(candidate.id, e)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/candidates/${candidate.id}`); }}
                        className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                      >
                        Details
                      </button>
                      {candidate.status !== 'VERIFIED' ? (
                        <button
                          onClick={(e) => handleVerify(candidate.id, e)}
                          disabled={verifyingId === candidate.id}
                          className="bg-primary hover:bg-blue-800 disabled:opacity-70 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors min-w-[120px] justify-center"
                        >
                          {verifyingId === candidate.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Start Verification
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleViewReport(candidate, e)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors min-w-[120px] justify-center"
                        >
                          View Report
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-4"></div>
                <div className="flex justify-end gap-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))
          ) : paginatedCandidates.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-900 font-medium text-base">No candidates found.</p>
                <p className="text-gray-500 mt-1 text-sm">Try adjusting your search.</p>
              </div>
            </div>
          ) : (
            paginatedCandidates.map((candidate) => (
              <div key={candidate.id} className="p-4 hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/candidates/${candidate.id}`)}>
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">{candidate.fullName}</div>
                  <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-semibold ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </div>
                <div className="text-gray-900 text-sm">{candidate.email}</div>
                <div className="text-gray-500 text-xs mb-1">{candidate.phone}</div>
                <div className="text-gray-400 text-xs mb-3">Added {format(new Date(candidate.createdAt), 'dd MMM yyyy')}</div>
                
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={(e) => handleDelete(candidate.id, e)}
                    className="text-gray-400 hover:text-red-600 transition-colors px-2 py-1.5"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/candidates/${candidate.id}`); }}
                    className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-1.5"
                  >
                    Details
                  </button>
                  {candidate.status !== 'VERIFIED' ? (
                    <button
                      onClick={(e) => handleVerify(candidate.id, e)}
                      disabled={verifyingId === candidate.id}
                      className="bg-primary hover:bg-blue-800 disabled:opacity-70 text-white text-xs px-3 py-1.5 rounded flex items-center justify-center gap-1 transition-colors min-w-[90px]"
                    >
                      {verifyingId === candidate.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Verify
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleViewReport(candidate, e)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded flex items-center justify-center gap-1 transition-colors min-w-[90px]"
                    >
                      View Report
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CandidateFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          void fetchCandidates();
          addToast('Candidate added successfully', 'success');
        }}
      />

      {selectedCandidate && (
        <PDFPreviewModal
          isOpen={showPDFPreview}
          onClose={() => {
            setShowPDFPreview(false);
            setSelectedCandidate(null);
          }}
          candidate={selectedCandidate}
          userName="Admin"
        />
      )}

      {verifyingId && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex flex-col items-center justify-center pointer-events-auto animate-fade-in">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-900 font-bold text-lg">Running Verifications...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait while we check Aadhaar and PAN records.</p>
        </div>
      )}
    </div>
  );
}

