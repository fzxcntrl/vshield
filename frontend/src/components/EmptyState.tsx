import { SearchX, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddCandidate?: () => void;
}

export default function EmptyState({ onAddCandidate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-12 h-12 text-gray-300" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        No candidates found
      </h3>
      
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        Try adjusting your search or add a new candidate to get started
      </p>
      
      {onAddCandidate && (
        <button
          onClick={onAddCandidate}
          className="bg-primary hover:bg-blue-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          Add Candidate
        </button>
      )}
    </div>
  );
}
