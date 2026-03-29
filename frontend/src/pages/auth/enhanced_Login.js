import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sprout, ArrowRight, Shield, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, adminLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let data;
      if (isAdmin) {
        data = await adminLogin(formData);
      } else {
        data = await login(formData);
      }

      navigate(`/${data.user.role}/home`);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background with Mesh Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-emerald-600 to-primary-800">
        <div className="absolute inset-0 bg-farmland-pattern opacity-10"></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-400/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Leaves Decoration */}
      <div className="absolute top-20 left-10 animate-float opacity-20">
        <Leaf className="w-16 h-16 text-white" />
      </div>
      <div className="absolute bottom-20 right-10 animate-float opacity-20" style={{ animationDelay: '1.5s' }}>
        <Leaf className="w-12 h-12 text-white rotate-45" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Main Login Card */}
        <div className="glass-card rounded-3xl shadow-xl-soft p-8 md:p-10 border-2 border-white/30 backdrop-blur-2xl">
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-5">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-primary-600 rounded-3xl blur-2xl opacity-60 animate-pulse-soft"></div>
              
              {/* Logo Container */}
              <div className="relative bg-gradient-to-br from-emerald-500 via-primary-600 to-primary-700 w-24 h-24 rounded-3xl flex items-center justify-center shadow-glow transform hover:scale-110 transition-transform duration-300">
                <Sprout className="w-12 h-12 text-white animate-float" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-black bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent mb-3 tracking-tight">
              AgroConnect
            </h1>
            <p className="text-neutral-700 text-base font-semibold">
              {isAdmin ? '🛡️ Admin Portal' : '🌾 Smart Farming Platform'}
            </p>
          </div>

          {/* Admin Toggle */}
          <div className="flex justify-center mb-8">
            <button
              type="button"
              onClick={() => setIsAdmin(!isAdmin)}
              className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden ${
                isAdmin
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-medium scale-105'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <span className="relative flex items-center gap-2">
                {isAdmin && <Shield className="w-4 h-4" />}
                {isAdmin ? 'Admin Login' : 'Switch to Admin Login'}
              </span>
              
              {/* Shine effect */}
              {isAdmin && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              )}
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-2xl opacity-0 group-focus-within:opacity-10 blur transition-opacity"></div>
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors group-focus-within:text-primary-600 z-10" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="relative w-full pl-12 pr-4 py-4 bg-white/90 border-2 border-neutral-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-neutral-400 text-neutral-900 font-semibold shadow-soft hover:shadow-medium"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-neutral-800 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-2xl opacity-0 group-focus-within:opacity-10 blur transition-opacity"></div>
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 transition-colors group-focus-within:text-primary-600 z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="relative w-full pl-12 pr-14 py-4 bg-white/90 border-2 border-neutral-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-neutral-400 text-neutral-900 font-semibold shadow-soft hover:shadow-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-2 rounded-xl hover:bg-neutral-100 z-10"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-emerald-600 via-primary-700 to-primary-800 text-white py-4 rounded-2xl font-bold text-lg shadow-strong hover:shadow-glow transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden mt-6"
            >
              {/* Button Background Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <span className={`relative flex items-center justify-center gap-2.5 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                {t('auth.login')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </form>

          {/* Register Link */}
          {!isAdmin && (
            <div className="mt-8 text-center">
              <p className="text-neutral-700 text-sm font-medium">
                {t('auth.noAccount')}{' '}
                <Link 
                  to="/register" 
                  className="text-primary-700 font-bold hover:text-primary-800 transition-colors inline-flex items-center gap-1 group"
                >
                  {t('auth.register')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Demo Credentials Card */}
        <div className="mt-6 glass-card rounded-2xl p-6 border-2 border-white/30 shadow-medium backdrop-blur-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-3 shrink-0 shadow-soft">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-neutral-900 text-base mb-3">🔑 Demo Credentials</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                  <span className="font-bold text-primary-700 min-w-[70px]">Farmer:</span>
                  <span className="font-mono text-neutral-700 text-xs">farmer@example.com / password123</span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                  <span className="font-bold text-blue-700 min-w-[70px]">Company:</span>
                  <span className="font-mono text-neutral-700 text-xs">company@example.com / password123</span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                  <span className="font-bold text-orange-700 min-w-[70px]">Admin:</span>
                  <span className="font-mono text-neutral-700 text-xs">admin@example.com / admin123</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 flex items-center justify-center gap-8 text-sm text-white/90 font-medium">
          <span className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-success-400 rounded-full animate-pulse-soft shadow-glow"></div>
            Secure Login
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-success-400 rounded-full animate-pulse-soft shadow-glow" style={{ animationDelay: '0.5s' }}></div>
            Encrypted Data
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
