import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { format } from 'date-fns';
import type { Candidate } from '../types/candidate';

const candidateSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar number must be exactly 12 digits"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format. Example: ABCDE1234F"),
  dob: z.string().min(1, "Date of Birth is required").refine((val) => {
    const date = new Date(val);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    const actualAge = m < 0 || (m === 0 && today.getDate() < date.getDate()) ? age - 1 : age;
    return actualAge >= 18;
  }, "Candidate must be at least 18 years old"),
  address: z.string().min(1, "Address is required"),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

type CandidateFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  candidate?: Candidate;
};

export default function CandidateFormModal({ isOpen, onClose, onSuccess, candidate }: CandidateFormModalProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    mode: 'onTouched'
  });

  useEffect(() => {
    if (candidate && isOpen) {
      reset({
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        aadhaarNumber: candidate.aadhaarNumber,
        panNumber: candidate.panNumber,
        dob: candidate.dob ? format(new Date(candidate.dob), 'yyyy-MM-dd') : '',
        address: candidate.address,
      });
    } else if (isOpen) {
      reset({
        fullName: '',
        email: '',
        phone: '',
        aadhaarNumber: '',
        panNumber: '',
        dob: '',
        address: ''
      });
    }
  }, [candidate, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: CandidateFormValues) => {
    setLoading(true);
    try {
      const payload = { ...data, panNumber: data.panNumber.toUpperCase() };
      if (candidate?.id) {
        await api.put(`/candidates/${candidate.id}`, payload);
      } else {
        await api.post('/candidates', payload);
      }
      onSuccess();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || `Failed to ${candidate ? 'update' : 'add'} candidate`;
      console.error('Candidate form error:', errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const getInputClass = (error?: unknown) => 
    `w-full border rounded-lg px-3 py-2 text-sm outline-none transition-all ${error ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary'}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{candidate ? 'Edit Candidate' : 'Add New Candidate'}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <form id="candidate-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input id="fullName" type="text" className={getInputClass(errors.fullName)} {...register('fullName')} />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" type="email" className={getInputClass(errors.email)} {...register('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input id="phone" type="tel" className={getInputClass(errors.phone)} {...register('phone')} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number (12 digits)</label>
              <input id="aadhaarNumber" type="text" className={getInputClass(errors.aadhaarNumber)} {...register('aadhaarNumber')} />
              {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber.message}</p>}
            </div>
            <div>
              <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">PAN Number (e.g. ABCDE1234F)</label>
              <input id="panNumber" type="text" className={`${getInputClass(errors.panNumber)} uppercase`} {...register('panNumber')} />
              {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input id="dob" type="date" className={getInputClass(errors.dob)} {...register('dob')} />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea id="address" rows={3} className={`${getInputClass(errors.address)} resize-none`} {...register('address')}></textarea>
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={handleClose} type="button" className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button form="candidate-form" type="submit" disabled={loading || !isValid} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (candidate ? 'Update Candidate' : 'Save Candidate')}
          </button>
        </div>
      </div>
    </div>
  );
}
