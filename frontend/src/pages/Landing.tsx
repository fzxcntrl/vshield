import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, FileCheck, Activity, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'Verify Aadhaar and PAN details in real-time with our advanced verification system.',
    },
    {
      icon: FileCheck,
      title: 'Secure Reports',
      description: 'Generate comprehensive PDF reports with complete verification history and audit trails.',
    },
    {
      icon: Activity,
      title: 'Real-time Status',
      description: 'Track verification status live with detailed logs and instant notifications.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#152d4a] to-[#0f1f3d] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-16 animate-fade-in">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Shield className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold">VShield</h1>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Verify with
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mt-2">
                Confidence
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Streamline your background verification process with instant Aadhaar and PAN validation
            </p>

            <div className="pt-8">
              <button
                onClick={() => navigate('/login')}
                className="group inline-flex items-center gap-3 bg-white text-[#1e3a5f] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-[#1e3a5f]" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-blue-100 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-blue-200 text-sm">
            © 2026 VShield. Secure background verification platform.
          </p>
        </div>
      </div>
    </div>
  );
}
