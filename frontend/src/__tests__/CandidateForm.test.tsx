import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CandidateFormModal from '../components/CandidateFormModal';

describe('CandidateFormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<CandidateFormModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText('Add New Candidate')).toBeInTheDocument();
  });

  it('validates Aadhaar and PAN numbers', async () => {
    render(<CandidateFormModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const aadhaarInput = screen.getByLabelText(/Aadhaar Number/i);
    const panInput = screen.getByLabelText(/PAN Number/i);
    
    fireEvent.change(aadhaarInput, { target: { value: '123' } });
    fireEvent.change(panInput, { target: { value: '12345' } });
    fireEvent.blur(aadhaarInput);
    fireEvent.blur(panInput);
    
    // Attempt to submit to trigger validation
    fireEvent.click(screen.getByRole('button', { name: /Save Candidate/i }));

    await waitFor(() => {
      expect(screen.getByText('Aadhaar number must be exactly 12 digits')).toBeInTheDocument();
      expect(screen.getByText(/Invalid PAN format/i)).toBeInTheDocument();
    });
  });
});
