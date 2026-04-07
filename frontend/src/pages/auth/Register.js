import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, User, Phone, Eye, EyeOff, Sprout,
  ArrowRight, CheckCircle2, Building2,
  Hash, Briefcase, ShieldCheck, Leaf,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';

const Register = () => {
  const navigate  = useNavigate();
  const { t }     = useTranslation();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'farmer',
  });
  const [companyDetails, setCompanyDetails] = useState({
    companyName: '', registrationNumber: '', businessType: '',
  });
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyDetails((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())              e.name             = 'Full name is required';
    if (!formData.email.trim())             e.email            = 'Email is required';
    if (!formData.phone.match(/^[0-9]{10}$/)) e.phone          = 'Enter a valid 10-digit number';
    if (formData.password.length < 6)       e.password         = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (formData.role === 'company' && !companyDetails.companyName.trim())
      e.companyName = 'Company name is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      if (formData.role === 'company') registerData.companyDetails = companyDetails;
      const data = await register(registerData);
      navigate(`/${data.user.role}/home`);
    } catch (error) {
      console.error('Register error:', error);
      setErrors({ submit: error?.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pw) => {
    if (!pw)         return { pct: 0,   label: '',        color: 'transparent' };
    if (pw.length < 6) return { pct: 25, label: 'Weak',   color: '#c0392b' };
    if (pw.length < 8) return { pct: 50, label: 'Fair',   color: '#b87a00' };
    if (pw.length < 10) return { pct: 75, label: 'Good',  color: '#1d4e89' };
    return              { pct: 100,      label: 'Strong',  color: '#2d6a4f' };
  };
  const pwStrength = getPasswordStrength(formData.password);

  const businessTypes = [
    { value: 'agri-input', label: 'Agri Input Supplier' },
    { value: 'processor',  label: 'Food Processor' },
    { value: 'exporter',   label: 'Exporter' },
    { value: 'retailer',   label: 'Retailer' },
    { value: 'fpo',        label: 'FPO / Cooperative' },
    { value: 'other',      label: 'Other' },
  ];

  const isCompany = formData.role === 'company';

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #1c3a1c;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 24px 16px 40px;
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .rg-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
        }
        .rg-glow-tl {
          position: absolute; top: -100px; left: -100px;
          width: 350px; height: 350px; border-radius: 50%;
          background: radial-gradient(circle, rgba(82,183,136,0.12) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .rg-glow-br {
          position: absolute; bottom: -80px; right: -80px;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(246,183,60,0.08) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* card */
        .rg-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 560px;
          background: #fff; border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.28);
          margin-top: 8px;
        }
        .rg-accent-bar {
          height: 5px;
          background: linear-gradient(90deg, #2d6a4f, #52b788, #b87a00);
        }
        .rg-card-body { padding: 28px 24px 24px; }

        /* branding */
        .rg-brand { text-align: center; margin-bottom: 24px; }
        .rg-brand-icon {
          width: 64px; height: 64px; border-radius: 18px;
          background: linear-gradient(135deg, #52b788, #1c3a1c);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
          box-shadow: 0 6px 20px rgba(28,58,28,0.35);
        }
        .rg-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 800; color: #1c2e1c;
          letter-spacing: -0.4px; margin-bottom: 4px;
        }
        .rg-brand-sub { font-size: 13px; color: #9a9080; font-weight: 500; }

        /* role toggle */
        .rg-role-label {
          font-size: 11px; font-weight: 700; color: #6a6055;
          text-transform: uppercase; letter-spacing: 0.4px;
          margin-bottom: 10px;
        }
        .rg-role-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          margin-bottom: 20px;
        }
        .rg-role-btn {
          padding: 14px 12px; border-radius: 14px; border: 1.5px solid #e8e2da;
          background: #fafaf8; cursor: pointer; text-align: left;
          transition: all 0.15s; position: relative; outline: none;
        }
        .rg-role-btn.active-farmer  { border-color: #2d6a4f; background: #f0f7f2; box-shadow: 0 3px 12px rgba(45,106,79,0.12); }
        .rg-role-btn.active-company { border-color: #1d4e89; background: #eef4fb; box-shadow: 0 3px 12px rgba(29,78,137,0.12); }
        .rg-role-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px; background: #f0ede8;
        }
        .rg-role-name { font-size: 13px; font-weight: 700; color: #1c2e1c; margin-bottom: 2px; }
        .rg-role-sub  { font-size: 11px; color: #9a9080; line-height: 1.4; }
        .rg-role-check {
          position: absolute; top: 10px; right: 10px;
        }

        /* section divider */
        .rg-section-title {
          font-size: 11px; font-weight: 700; color: #9a9080;
          text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 12px; margin-top: 4px;
          display: flex; align-items: center; gap: 8px;
        }
        .rg-section-title::after {
          content: ''; flex: 1; height: 1px; background: #ede8e0;
        }

        /* field */
        .rg-field { display: flex; flex-direction: column; }
        .rg-label {
          font-size: 11px; font-weight: 700; color: #6a6055;
          text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 5px;
        }
        .rg-input-wrap { position: relative; }
        .rg-input-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: #b0a898;
          display: flex; align-items: center;
        }
        .rg-input, .rg-select {
          width: 100%; padding: 11px 14px 11px 42px;
          background: #fff; border: 1.5px solid #ddd5c8; border-radius: 11px;
          font-size: 13px; font-weight: 500; color: #1c2e1c;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          -moz-appearance: textfield;
        }
        .rg-input::-webkit-outer-spin-button,
        .rg-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .rg-input::placeholder, .rg-select::placeholder { color: #c8bfb2; }
        .rg-input:focus, .rg-select:focus {
          border-color: #2d6a4f; box-shadow: 0 0 0 3px rgba(45,106,79,0.1);
        }
        .rg-input.error { border-color: #f0d0d0; }
        .rg-input.error:focus { border-color: #c0392b; box-shadow: 0 0 0 3px rgba(192,57,43,0.08); }
        .rg-select { appearance: none; cursor: pointer; }
        .rg-pw-toggle {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          width: 28px; height: 28px; border-radius: 7px;
          background: none; border: none; cursor: pointer; color: #9a9080;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .rg-pw-toggle:hover { background: #f0ede8; }
        .rg-error-msg { font-size: 11px; color: #c0392b; font-weight: 600; margin-top: 4px; }

        /* password strength */
        .rg-pw-track {
          height: 4px; background: #f0ede8; border-radius: 99px;
          overflow: hidden; margin-top: 6px;
        }
        .rg-pw-bar {
          height: 100%; border-radius: 99px; transition: width 0.3s ease;
        }
        .rg-pw-label { font-size: 11px; font-weight: 700; margin-top: 3px; }

        /* confirm match */
        .rg-match {
          font-size: 11px; font-weight: 700; margin-top: 4px;
          display: flex; align-items: center; gap: 4px;
        }

        /* grid helpers */
        .rg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rg-gap { margin-bottom: 12px; }

        /* company section */
        .rg-company-section {
          background: #eef4fb; border-radius: 14px; padding: 16px;
          border: 1.5px solid #c2d6f0; margin-bottom: 12px;
        }
        .rg-company-head {
          display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
        }
        .rg-company-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: #dbeafe; display: flex; align-items: center; justify-content: center;
        }
        .rg-company-title {
          font-size: 12px; font-weight: 700; color: #1d4e89;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .rg-verify-note {
          display: flex; align-items: flex-start; gap: 8px;
          background: #dbeafe; border-radius: 10px; padding: 10px 12px;
          margin-top: 12px;
        }
        .rg-verify-note p { font-size: 12px; color: #1d4e89; line-height: 1.5; }

        /* company inputs use blue focus */
        .rg-input.blue:focus { border-color: #1d4e89; box-shadow: 0 0 0 3px rgba(29,78,137,0.1); }

        /* submit error */
        .rg-submit-error {
          padding: 11px 14px; border-radius: 11px;
          background: #fff5f5; border: 1px solid #f0d0d0;
          color: #c0392b; font-size: 13px; font-weight: 500;
          margin-bottom: 12px;
        }

        /* submit button */
        .rg-submit {
          width: 100%; padding: 14px;
          border-radius: 14px; border: none;
          background: #1c3a1c; color: #f0ede8;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s;
          box-shadow: 0 6px 20px rgba(28,58,28,0.3);
          margin-top: 4px; margin-bottom: 18px;
        }
        .rg-submit:hover:not(:disabled) { background: #2a5a2a; }
        .rg-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .rg-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(240,237,232,0.3);
          border-top-color: #f0ede8;
          animation: rgSpin 0.7s linear infinite;
        }
        @keyframes rgSpin { to { transform: rotate(360deg); } }

        /* login link */
        .rg-login-link {
          text-align: center; font-size: 13px; color: #9a9080;
        }
        .rg-login-link a {
          color: #2d6a4f; font-weight: 700; text-decoration: none;
          display: inline-flex; align-items: center; gap: 3px;
        }
        .rg-login-link a:hover { color: #1c3a1c; }

        /* trust row */
        .rg-trust {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center;
          gap: 16px; margin-top: 18px; flex-wrap: wrap;
        }
        .rg-trust-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; color: rgba(240,237,232,0.55);
        }
        .rg-trust-dot { width: 6px; height: 6px; border-radius: 50%; background: #52b788; }

        /* desktop: wider card + more padding */
        @media (min-width: 640px) {
          .rg-card-body { padding: 36px 40px 32px; }
          .rg-brand-name { font-size: 30px; }
        }
      `}</style>

      <div className="rg-root">
        <div className="rg-grain" />
        <div className="rg-glow-tl" />
        <div className="rg-glow-br" />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560 }}>

          {/* ── CARD ── */}
          <div className="rg-card">
            <div className="rg-accent-bar" />
            <div className="rg-card-body">

              {/* Branding */}
              <div className="rg-brand">
                <div className="rg-brand-icon">
                  <Sprout size={30} color="#fff" />
                </div>
                <div className="rg-brand-name">Join AgroConnect</div>
                <div className="rg-brand-sub">Create your account and start your farming journey</div>
              </div>

              {/* Role toggle */}
              <div className="rg-role-label">I am registering as</div>
              <div className="rg-role-grid">
                {[
                  { role: 'farmer',  Icon: Leaf,      label: 'Farmer',  sub: 'Crop predictions & markets',    activeClass: 'active-farmer',  iconBg: '#d8f3dc', iconColor: '#2d6a4f' },
                  { role: 'company', Icon: Building2, label: 'Company', sub: 'Post contracts & source crops',  activeClass: 'active-company', iconBg: '#dbeafe', iconColor: '#1d4e89' },
                ].map(({ role, Icon, label, sub, activeClass, iconBg, iconColor }) => {
                  const isActive = formData.role === role;
                  return (
                    <button
                      key={role} type="button"
                      className={`rg-role-btn ${isActive ? activeClass : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, role }))}
                    >
                      <div className="rg-role-icon" style={{ background: isActive ? iconBg : '#f0ede8' }}>
                        <Icon size={18} color={isActive ? iconColor : '#9a9080'} />
                      </div>
                      <div className="rg-role-name" style={{ color: isActive ? iconColor : '#1c2e1c' }}>{label}</div>
                      <div className="rg-role-sub">{sub}</div>
                      {isActive && (
                        <div className="rg-role-check">
                          <CheckCircle2 size={16} color={iconColor} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>

                <div className="rg-section-title">Personal Details</div>

                {/* Name + Phone */}
                <div className="rg-grid-2 rg-gap">
                  <div className="rg-field">
                    <label className="rg-label">{t('auth.name') || 'Full Name'}</label>
                    <div className="rg-input-wrap">
                      <span className="rg-input-icon"><User size={15} /></span>
                      <input type="text" name="name" value={formData.name} onChange={handleChange}
                        required placeholder="Full Name"
                        className={`rg-input${errors.name ? ' error' : ''}`} />
                    </div>
                    {errors.name && <p className="rg-error-msg">{errors.name}</p>}
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">{t('auth.phone') || 'Phone'}</label>
                    <div className="rg-input-wrap">
                      <span className="rg-input-icon"><Phone size={15} /></span>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        required placeholder="10-digit number"
                        className={`rg-input${errors.phone ? ' error' : ''}`} />
                    </div>
                    {errors.phone && <p className="rg-error-msg">{errors.phone}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="rg-field rg-gap">
                  <label className="rg-label">{t('auth.email') || 'Email'}</label>
                  <div className="rg-input-wrap">
                    <span className="rg-input-icon"><Mail size={15} /></span>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      required placeholder="your@email.com"
                      className={`rg-input${errors.email ? ' error' : ''}`} />
                  </div>
                  {errors.email && <p className="rg-error-msg">{errors.email}</p>}
                </div>

                {/* Password + Confirm */}
                <div className="rg-grid-2 rg-gap">
                  <div className="rg-field">
                    <label className="rg-label">{t('auth.password') || 'Password'}</label>
                    <div className="rg-input-wrap">
                      <span className="rg-input-icon"><Lock size={15} /></span>
                      <input
                        type={showPassword ? 'text' : 'password'} name="password"
                        value={formData.password} onChange={handleChange}
                        required minLength="6" placeholder="••••••••"
                        style={{ paddingRight: 42 }}
                        className={`rg-input${errors.password ? ' error' : ''}`}
                      />
                      <button type="button" className="rg-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {formData.password && (
                      <>
                        <div className="rg-pw-track">
                          <div className="rg-pw-bar" style={{ width: `${pwStrength.pct}%`, background: pwStrength.color }} />
                        </div>
                        <p className="rg-pw-label" style={{ color: pwStrength.color }}>{pwStrength.label}</p>
                      </>
                    )}
                    {errors.password && <p className="rg-error-msg">{errors.password}</p>}
                  </div>

                  <div className="rg-field">
                    <label className="rg-label">{t('auth.confirmPassword') || 'Confirm'}</label>
                    <div className="rg-input-wrap">
                      <span className="rg-input-icon"><Lock size={15} /></span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                        value={formData.confirmPassword} onChange={handleChange}
                        required placeholder="••••••••"
                        style={{ paddingRight: 42 }}
                        className={`rg-input${errors.confirmPassword ? ' error' : ''}`}
                      />
                      <button type="button" className="rg-pw-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <p className="rg-match" style={{
                        color: formData.password === formData.confirmPassword ? '#2d6a4f' : '#c0392b'
                      }}>
                        {formData.password === formData.confirmPassword
                          ? <><CheckCircle2 size={11} /> Passwords match</>
                          : 'Does not match'}
                      </p>
                    )}
                    {errors.confirmPassword && <p className="rg-error-msg">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Company section */}
                {isCompany && (
                  <div className="rg-company-section rg-gap">
                    <div className="rg-company-head">
                      <div className="rg-company-icon">
                        <Building2 size={14} color="#1d4e89" />
                      </div>
                      <span className="rg-company-title">Company Details</span>
                    </div>

                    <div className="rg-field rg-gap">
                      <label className="rg-label">Company Name *</label>
                      <div className="rg-input-wrap">
                        <span className="rg-input-icon"><Building2 size={15} /></span>
                        <input type="text" name="companyName" value={companyDetails.companyName}
                          onChange={handleCompanyChange} required placeholder="Your Company Name"
                          className={`rg-input blue${errors.companyName ? ' error' : ''}`} />
                      </div>
                      {errors.companyName && <p className="rg-error-msg">{errors.companyName}</p>}
                    </div>

                    <div className="rg-grid-2">
                      <div className="rg-field">
                        <label className="rg-label">Registration / GST No.</label>
                        <div className="rg-input-wrap">
                          <span className="rg-input-icon"><Hash size={15} /></span>
                          <input type="text" name="registrationNumber" value={companyDetails.registrationNumber}
                            onChange={handleCompanyChange} placeholder="CIN / GST"
                            className="rg-input blue" />
                        </div>
                      </div>
                      <div className="rg-field">
                        <label className="rg-label">Business Type</label>
                        <div className="rg-input-wrap">
                          <span className="rg-input-icon"><Briefcase size={15} /></span>
                          <select name="businessType" value={companyDetails.businessType}
                            onChange={handleCompanyChange} className="rg-select blue">
                            <option value="">Select type</option>
                            {businessTypes.map((bt) => (
                              <option key={bt.value} value={bt.value}>{bt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="rg-verify-note">
                      <ShieldCheck size={14} color="#1d4e89" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p>Company accounts require admin verification before login access is granted.</p>
                    </div>
                  </div>
                )}

                {/* Submit error */}
                {errors.submit && <div className="rg-submit-error">{errors.submit}</div>}

                {/* Submit */}
                <button type="submit" className="rg-submit" disabled={loading}>
                  {loading
                    ? <><div className="rg-spinner" /> Creating account...</>
                    : <>{t('auth.register') || 'Create Account'} <ArrowRight size={17} /></>
                  }
                </button>
              </form>

              {/* Login link */}
              <div className="rg-login-link">
                {t('auth.haveAccount') || 'Already have an account?'}{' '}
                <Link to="/login">
                  {t('auth.login') || 'Sign in'} <ArrowRight size={12} />
                </Link>
              </div>

            </div>
          </div>

          {/* Trust badges */}
          <div className="rg-trust">
            {['Secure Registration', 'Privacy Protected', 'SSL Encrypted'].map((badge) => (
              <div key={badge} className="rg-trust-item">
                <span className="rg-trust-dot" />
                {badge}
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default Register;