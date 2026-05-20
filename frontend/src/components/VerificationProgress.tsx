import { useEffect, useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

interface VerificationProgressProps {
  isOpen: boolean;
}

type Step = {
  label: string;
  status: 'pending' | 'loading' | 'complete';
};

export default function VerificationProgress({ isOpen }: VerificationProgressProps) {
  const [steps, setSteps] = useState<Step[]>([
    { label: 'Validating Aadhaar...', status: 'pending' },
    { label: 'Validating PAN...', status: 'pending' },
    { label: 'Generating Report...', status: 'pending' },
    { label: 'Complete', status: 'pending' },
  ]);

  useEffect(() => {
    if (!isOpen) {
      // Reset steps when closed
      setSteps([
        { label: 'Validating Aadhaar...', status: 'pending' },
        { label: 'Validating PAN...', status: 'pending' },
        { label: 'Generating Report...', status: 'pending' },
        { label: 'Complete', status: 'pending' },
      ]);
      return;
    }

    // Simulate step progression
    const timings = [0, 800, 1600, 2400]; // Start times for each step
    const durations = [800, 800, 800, 500]; // Duration of each step

    timings.forEach((timing, index) => {
      // Start loading
      setTimeout(() => {
        setSteps(prev => prev.map((step, i) => 
          i === index ? { ...step, status: 'loading' } : step
        ));
      }, timing);

      // Complete step
      setTimeout(() => {
        setSteps(prev => prev.map((step, i) => 
          i === index ? { ...step, status: 'complete' } : step
        ));
      }, timing + durations[index]);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Running Verification
        </h3>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 rounded-lg transition-all duration-300"
              style={{
                backgroundColor: step.status === 'complete' 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : step.status === 'loading'
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'transparent'
              }}
            >
              <div className="flex-shrink-0">
                {step.status === 'complete' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : step.status === 'loading' ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-medium transition-colors ${
                  step.status === 'complete' 
                    ? 'text-green-600' 
                    : step.status === 'loading'
                    ? 'text-primary'
                    : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Please wait while we verify the credentials...
        </div>
      </div>
    </div>
  );
}
