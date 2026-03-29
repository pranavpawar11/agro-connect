import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Sprout, ArrowRight, CheckCircle2, Building2, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'farmer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const data = await register(registerData);
      navigate(`/${data.user.role}/home`);
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Weak', color: 'bg-danger-500' };
    if (password.length < 8) return { strength: 50, label: 'Fair', color: 'bg-warning-500' };
    if (password.length < 10) return { strength: 75, label: 'Good', color: 'bg-secondary-600' };
    return { strength: 100, label: 'Strong', color: 'bg-success-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        <div className="glass-effect rounded-3xl shadow-strong p-8 md:p-10 border border-white/20">
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-primary-500 rounded-2xl blur-xl opacity-50 animate-pulse-soft"></div>
              <div className="relative bg-gradient-success w-20 h-20 rounded-2xl flex items-center justify-center shadow-glow">
                <Sprout className="w-10 h-10 text-white float-animation" />
              </div>
            </div>
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary-900 to-primary-700 bg-clip-text text-transparent mb-2">
              Join AgroConnect
            </h1>
            <p className="text-neutral-600 text-base font-medium">
              Create your account and start your farming journey
            </p>
          </div>

          {/* Role Selection - Enhanced */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'farmer' })}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                  formData.role === 'farmer'
                    ? 'border-primary-500 bg-primary-50 shadow-soft'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    formData.role === 'farmer' ? 'bg-primary-100' : 'bg-neutral-100'
                  }`}>
                    <UserCircle className={`w-6 h-6 ${
                      formData.role === 'farmer' ? 'text-primary-700' : 'text-neutral-600'
                    }`} />
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-sm ${
                      formData.role === 'farmer' ? 'text-primary-900' : 'text-neutral-700'
                    }`}>
                      Farmer
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Access crop predictions
                    </p>
                  </div>
                  {formData.role === 'farmer' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-600" />
                    </div>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'company' })}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                  formData.role === 'company'
                    ? 'border-secondary-600 bg-secondary-50 shadow-soft'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    formData.role === 'company' ? 'bg-secondary-100' : 'bg-neutral-100'
                  }`}>
                    <Building2 className={`w-6 h-6 ${
                      formData.role === 'company' ? 'text-secondary-800' : 'text-neutral-600'
                    }`} />
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-sm ${
                      formData.role === 'company' ? 'text-secondary-900' : 'text-neutral-700'
                    }`}>
                      Company
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Create contracts
                    </p>
                  </div>
                  {formData.role === 'company' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary-700" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700">
                  {t('auth.name')}
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors group-focus-within:text-primary-600" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-neutral-400 text-neutral-800 font-medium"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700">
                  {t('auth.phone')}
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors group-focus-within:text-primary-600" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-neutral-400 text-neutral-800 font-medium"
                    placeholder="10-digit number"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-700">
                {t('auth.email')}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors group-focus-within:text-primary-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-neutral-400 text-neutral-800 font-medium"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700">
                  {t('auth.password')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors group-focus-within:text-primary-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="w-full pl-12 pr-14 py-3.5 bg-white border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-neutral-400 text-neutral-800 font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1 rounded-lg hover:bg-neutral-100"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength.strength < 50 ? 'text-danger-600' : 
                      passwordStrength.strength < 75 ? 'text-warning-600' : 
                      'text-success-600'
                    }`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors group-focus-within:text-primary-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-neutral-400 text-neutral-800 font-medium"
                    placeholder="••••••••"
                  />
                </div>
                {formData.confirmPassword && (
                  <p className={`text-xs font-medium flex items-center gap-1 ${
                    formData.password === formData.confirmPassword ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Passwords match
                      </>
                    ) : (
                      'Passwords do not match'
                    )}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-primary-700 to-primary-800 text-white py-4 rounded-xl font-bold text-base shadow-medium hover:shadow-glow transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden mt-6"
            >
              <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                {t('auth.register')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="spinner border-white border-t-white/30"></div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-neutral-600 text-sm">
              {t('auth.haveAccount')}{' '}
              <Link 
                to="/login" 
                className="text-primary-700 font-bold hover:text-primary-800 transition-colors inline-flex items-center gap-1 group"
              >
                {t('auth.login')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/80">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse-soft"></div>
            Secure Registration
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse-soft" style={{ animationDelay: '0.5s' }}></div>
            Privacy Protected
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
