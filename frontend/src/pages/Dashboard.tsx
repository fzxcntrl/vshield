import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../services/api';
import type { Candidate, CandidateStatus } from '../types/candidate';

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await api.get('/candidates');
        setCandidates(res.data);
      } catch {
        console.error('Failed to fetch candidates');
      } finally {
        setLoading(false);
      }
    };
    void fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const total = candidates.length;
  const verified = candidates.filter(c => c.status === 'VERIFIED').length;
  const pending = candidates.filter(c => c.status === 'PENDING').length;
  const failed = candidates.filter(c => c.status === 'FAILED').length;

  const recentCandidates = [...candidates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Candidates</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Verified</p>
            <p className="text-2xl font-bold text-gray-900">{verified}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{pending}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-gray-900">{failed}</p>
          </div>
        </div>
      </div>

      {/* Recent Candidates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Candidates</h3>
          <Link to="/candidates" className="text-sm font-medium text-primary hover:text-blue-800 flex items-center">
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Added On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentCandidates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                recentCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/candidates/${candidate.id}`} className="font-medium text-gray-900 hover:text-primary">
                        {candidate.fullName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {format(new Date(candidate.createdAt), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
