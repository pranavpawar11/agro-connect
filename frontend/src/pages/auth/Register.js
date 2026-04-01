import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, User, Phone, Eye, EyeOff, Sprout,
  ArrowRight, CheckCircle2, Building2, UserCircle,
  Hash, Briefcase, ShieldCheck, Leaf
} from 'lucide-react';
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

  const [companyDetails, setCompanyDetails] = useState({
    companyName: '',
    registrationNumber: '',
    businessType: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyDetails((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = 'Enter a valid 10-digit number';
    if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.role === 'company' && !companyDetails.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      if (formData.role === 'company') {
        registerData.companyDetails = companyDetails;
      }
      const data = await register(registerData);
      navigate(`/${data.user.role}/home`);
    } catch (error) {
      console.error('Register error:', error);
      setErrors({ submit: error?.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Weak', color: '#ef4444' };
    if (password.length < 8) return { strength: 50, label: 'Fair', color: '#f59e0b' };
    if (password.length < 10) return { strength: 75, label: 'Good', color: '#3b82f6' };
    return { strength: 100, label: 'Strong', color: '#22c55e' };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const isCompany = formData.role === 'company';

  const businessTypes = [
    { value: 'agri-input', label: 'Agri Input Supplier' },
    { value: 'processor', label: 'Food Processor' },
    { value: 'exporter', label: 'Exporter' },
    { value: 'retailer', label: 'Retailer' },
    { value: 'fpo', label: 'FPO / Cooperative' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #064e3b 0%, #065f46 30%, #047857 60%, #059669 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-80px', left: '-80px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', right: '-80px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '10%',
        width: '200px', height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '640px', position: 'relative', zIndex: 10 }}>
        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: '28px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.2)',
          overflow: 'hidden',
        }}>
          {/* Top accent bar */}
          <div style={{
            height: '5px',
            background: 'linear-gradient(90deg, #059669, #10b981, #34d399, #6ee7b7)',
          }} />

          <div style={{ padding: '40px 40px 36px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <div style={{
                  width: '72px', height: '72px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  borderRadius: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(5,150,105,0.4)',
                  margin: '0 auto',
                }}>
                  <Sprout size={36} color="white" />
                </div>
              </div>
              <h1 style={{
                fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px',
                color: '#064e3b', marginBottom: '6px', lineHeight: 1.2,
              }}>
                Join AgroConnect
              </h1>
              <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
                Create your account and start your farming journey
              </p>
            </div>

            {/* Role Toggle */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                I am registering as
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { role: 'farmer', Icon: Leaf, label: 'Farmer', sub: 'Crop predictions & markets', accent: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
                  { role: 'company', Icon: Building2, label: 'Company', sub: 'Post contracts & source crops', accent: '#0369a1', bg: '#eff6ff', border: '#93c5fd' },
                ].map(({ role, Icon, label, sub, accent, bg, border }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role }))}
                    style={{
                      position: 'relative',
                      padding: '16px',
                      borderRadius: '16px',
                      border: `2px solid ${formData.role === role ? border : '#e5e7eb'}`,
                      background: formData.role === role ? bg : '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      outline: 'none',
                      boxShadow: formData.role === role ? `0 4px 16px ${accent}22` : 'none',
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px',
                      background: formData.role === role ? `${accent}18` : '#f3f4f6',
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '10px',
                    }}>
                      <Icon size={20} color={formData.role === role ? accent : '#9ca3af'} />
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: formData.role === role ? accent : '#374151', marginBottom: '3px' }}>
                      {label}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.4 }}>{sub}</p>
                    {formData.role === role && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <CheckCircle2 size={18} color={accent} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Name + Phone row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Field label={t('auth.name') || 'Full Name'} error={errors.name}>
                  <InputIcon icon={<User size={17} />}>
                    <input
                      type="text" name="name" value={formData.name}
                      onChange={handleChange} required placeholder="Full Name"
                      style={inputStyle(!!errors.name)}
                    />
                  </InputIcon>
                </Field>
                <Field label={t('auth.phone') || 'Phone'} error={errors.phone}>
                  <InputIcon icon={<Phone size={17} />}>
                    <input
                      type="tel" name="phone" value={formData.phone}
                      onChange={handleChange} required placeholder="10-digit number"
                      style={inputStyle(!!errors.phone)}
                    />
                  </InputIcon>
                </Field>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <Field label={t('auth.email') || 'Email'} error={errors.email}>
                  <InputIcon icon={<Mail size={17} />}>
                    <input
                      type="email" name="email" value={formData.email}
                      onChange={handleChange} required placeholder="your@email.com"
                      style={inputStyle(!!errors.email)}
                    />
                  </InputIcon>
                </Field>
              </div>

              {/* Password + Confirm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Field label={t('auth.password') || 'Password'} error={errors.password}>
                  <InputIcon icon={<Lock size={17} />} right={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }>
                    <input
                      type={showPassword ? 'text' : 'password'} name="password"
                      value={formData.password} onChange={handleChange}
                      required minLength="6" placeholder="••••••••"
                      style={{ ...inputStyle(!!errors.password), paddingRight: '44px' }}
                    />
                  </InputIcon>
                  {formData.password && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${passwordStrength.strength}%`,
                          background: passwordStrength.color,
                          borderRadius: '99px', transition: 'all 0.3s ease',
                        }} />
                      </div>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: passwordStrength.color, marginTop: '3px' }}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </Field>

                <Field label={t('auth.confirmPassword') || 'Confirm Password'} error={errors.confirmPassword}>
                  <InputIcon icon={<Lock size={17} />} right={
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                      value={formData.confirmPassword} onChange={handleChange}
                      required placeholder="••••••••"
                      style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: '44px' }}
                    />
                  </InputIcon>
                  {formData.confirmPassword && (
                    <p style={{
                      fontSize: '11px', fontWeight: '600', marginTop: '5px',
                      color: formData.password === formData.confirmPassword ? '#22c55e' : '#ef4444',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      {formData.password === formData.confirmPassword
                        ? <><CheckCircle2 size={12} /> Passwords match</>
                        : 'Passwords do not match'}
                    </p>
                  )}
                </Field>
              </div>

              {/* Company Details Section */}
              {isCompany && (
                <div style={{
                  marginBottom: '16px',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid #bfdbfe',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Building2 size={15} color="#0369a1" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                      Company Details
                    </p>
                  </div>

                  {/* Company Name */}
                  <div style={{ marginBottom: '12px' }}>
                    <Field label="Company Name *" error={errors.companyName}>
                      <InputIcon icon={<Building2 size={17} />} accentColor="#0369a1">
                        <input
                          type="text" name="companyName" value={companyDetails.companyName}
                          onChange={handleCompanyChange} required placeholder="Your Company Name"
                          style={inputStyle(!!errors.companyName, '#0369a1')}
                        />
                      </InputIcon>
                    </Field>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="Registration / GST No." error={errors.registrationNumber}>
                      <InputIcon icon={<Hash size={17} />} accentColor="#0369a1">
                        <input
                          type="text" name="registrationNumber"
                          value={companyDetails.registrationNumber}
                          onChange={handleCompanyChange}
                          placeholder="CIN / GST Number"
                          style={inputStyle(false, '#0369a1')}
                        />
                      </InputIcon>
                    </Field>

                    <Field label="Business Type" error={errors.businessType}>
                      <div style={{ position: 'relative' }}>
                        <Briefcase size={17} style={{
                          position: 'absolute', left: '14px', top: '50%',
                          transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none',
                        }} />
                        <select
                          name="businessType" value={companyDetails.businessType}
                          onChange={handleCompanyChange}
                          style={{
                            ...inputStyle(false, '#0369a1'),
                            paddingLeft: '42px',
                            appearance: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="">Select type</option>
                          {businessTypes.map((bt) => (
                            <option key={bt.value} value={bt.value}>{bt.label}</option>
                          ))}
                        </select>
                      </div>
                    </Field>
                  </div>

                  <div style={{
                    marginTop: '12px', padding: '10px 14px',
                    borderRadius: '10px', background: '#dbeafe',
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                  }}>
                    <ShieldCheck size={15} color="#0369a1" style={{ marginTop: '1px', flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', color: '#1e40af', lineHeight: 1.5 }}>
                      Company accounts require admin verification before login access is granted.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit error */}
              {errors.submit && (
                <div style={{
                  marginBottom: '16px', padding: '12px 16px',
                  borderRadius: '12px', background: '#fef2f2',
                  border: '1px solid #fecaca', color: '#dc2626',
                  fontSize: '13px', fontWeight: '500',
                }}>
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '14px',
                  border: 'none',
                  background: loading
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(5,150,105,0.35)',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.2px',
                  marginTop: '8px',
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '18px', height: '18px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Creating account...
                  </>
                ) : (
                  <>
                    {t('auth.register') || 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                {t('auth.haveAccount') || 'Already have an account?'}{' '}
                <Link to="/login" style={{
                  color: '#059669', fontWeight: '700',
                  textDecoration: 'none', display: 'inline-flex',
                  alignItems: 'center', gap: '3px',
                }}>
                  {t('auth.login') || 'Sign in'}
                  <ArrowRight size={14} />
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{
          marginTop: '20px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '24px',
        }}>
          {['Secure Registration', 'Privacy Protected', 'SSL Encrypted'].map((badge, i) => (
            <span key={i} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: '500',
            }}>
              <div style={{
                width: '7px', height: '7px',
                background: '#34d399', borderRadius: '50%',
              }} />
              {badge}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #d1d5db; }
        input:focus, select:focus { outline: none; }
        button:hover:not(:disabled) { transform: translateY(-1px); }
      `}</style>
    </div>
  );
};

/* ── Helpers ── */

const inputStyle = (hasError = false, accentColor = '#059669') => ({
  width: '100%',
  paddingLeft: '42px',
  paddingRight: '16px',
  paddingTop: '12px',
  paddingBottom: '12px',
  background: 'white',
  border: `2px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#111827',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
});

const Field = ({ label, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', letterSpacing: '0.2px', textTransform: 'uppercase' }}>
      {label}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: '11px', color: '#ef4444', fontWeight: '500', marginTop: '2px' }}>
        {error}
      </p>
    )}
  </div>
);

const InputIcon = ({ icon, right, children, accentColor = '#059669' }) => (
  <div style={{ position: 'relative' }}>
    <div style={{
      position: 'absolute', left: '13px', top: '50%',
      transform: 'translateY(-50%)', color: '#9ca3af',
      display: 'flex', alignItems: 'center', pointerEvents: 'none',
      zIndex: 1,
    }}>
      {icon}
    </div>
    {children}
    {right && (
      <div style={{
        position: 'absolute', right: '12px', top: '50%',
        transform: 'translateY(-50%)', zIndex: 1,
      }}>
        {right}
      </div>
    )}
  </div>
);

export default Register;