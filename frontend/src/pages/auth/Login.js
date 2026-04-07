import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sprout, ArrowRight, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const { login, adminLogin } = useAuth();

  const [formData,     setFormData]     = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [loading,      setLoading]      = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = isAdmin ? await adminLogin(formData) : await login(formData);
      navigate(`/${data.user.role}/home`);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #1c3a1c;
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }

        /* background grain */
        .lg-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
        }
        .lg-glow-tl {
          position: absolute; top: -100px; left: -100px;
          width: 350px; height: 350px; border-radius: 50%;
          background: radial-gradient(circle, rgba(82,183,136,0.14) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .lg-glow-br {
          position: absolute; bottom: -100px; right: -100px;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(246,183,60,0.09) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* card */
        .lg-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 420px;
          background: #fff; border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.28);
        }
        /* green top accent bar */
        .lg-accent-bar {
          height: 5px;
          background: linear-gradient(90deg, #2d6a4f, #52b788, #b87a00);
        }
        .lg-card-body { padding: 32px 28px 28px; }

        /* branding */
        .lg-brand { text-align: center; margin-bottom: 28px; }
        .lg-brand-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #52b788, #1c3a1c);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 8px 24px rgba(28,58,28,0.35);
          animation: lgFloat 3s ease-in-out infinite;
        }
        @keyframes lgFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        .lg-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 800; color: #1c2e1c;
          letter-spacing: -0.5px; margin-bottom: 4px;
        }
        .lg-brand-tag {
          font-size: 13px; font-weight: 500; color: #9a9080;
        }

        /* admin toggle */
        .lg-admin-wrap { display: flex; justify-content: center; margin-bottom: 24px; }
        .lg-admin-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .lg-admin-btn.off {
          background: #f7f3ee; color: #6a6055; border: 1.5px solid #e8e2da;
        }
        .lg-admin-btn.off:hover { border-color: #c8bfb2; }
        .lg-admin-btn.on {
          background: #c0392b; color: #fff;
          box-shadow: 0 4px 12px rgba(192,57,43,0.3);
        }

        /* form */
        .lg-field { margin-bottom: 16px; }
        .lg-label {
          display: block; font-size: 11px; font-weight: 700; color: #6a6055;
          text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;
        }
        .lg-input-wrap { position: relative; }
        .lg-input-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: #b0a898; display: flex; align-items: center;
        }
        .lg-input {
          width: 100%; padding: 12px 14px 12px 42px;
          background: #fff; border: 1.5px solid #ddd5c8; border-radius: 12px;
          font-size: 14px; font-weight: 500; color: #1c2e1c;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lg-input::placeholder { color: #c8bfb2; }
        .lg-input:focus { border-color: #2d6a4f; box-shadow: 0 0 0 3px rgba(45,106,79,0.1); }
        .lg-pw-toggle {
          position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
          width: 30px; height: 30px; border-radius: 8px;
          background: none; border: none; cursor: pointer; color: #9a9080;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .lg-pw-toggle:hover { background: #f0ede8; }

        /* submit */
        .lg-submit {
          width: 100%; padding: 14px;
          border-radius: 14px; border: none;
          background: #1c3a1c; color: #f0ede8;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s;
          box-shadow: 0 6px 20px rgba(28,58,28,0.3);
          margin-top: 8px; margin-bottom: 20px;
          position: relative; overflow: hidden;
        }
        .lg-submit:hover:not(:disabled) { background: #2a5a2a; }
        .lg-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .lg-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(240,237,232,0.3);
          border-top-color: #f0ede8;
          animation: lgSpin 0.7s linear infinite;
        }
        @keyframes lgSpin { to { transform: rotate(360deg); } }

        /* register link */
        .lg-register { text-align: center; font-size: 13px; color: #9a9080; margin-bottom: 24px; }
        .lg-register a {
          color: #2d6a4f; font-weight: 700; text-decoration: none;
          display: inline-flex; align-items: center; gap: 3px;
          transition: color 0.15s;
        }
        .lg-register a:hover { color: #1c3a1c; }

        /* demo credentials */
        .lg-demo {
          background: #f7f3ee; border-radius: 16px; padding: 16px;
          border: 1px solid #e8e2da;
        }
        .lg-demo-head {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; color: #1c2e1c;
          margin-bottom: 12px;
        }
        .lg-demo-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: #fdf3e0; border: 1px solid #f0d8a8;
          display: flex; align-items: center; justify-content: center;
        }
        .lg-demo-row {
          display: flex; align-items: baseline; gap: 8px;
          padding: 8px 10px; border-radius: 10px;
          background: #fff; border: 1px solid #e8e2da;
          margin-bottom: 6px;
        }
        .lg-demo-row:last-child { margin-bottom: 0; }
        .lg-demo-role {
          font-size: 11px; font-weight: 700; min-width: 58px; flex-shrink: 0;
        }
        .lg-demo-creds {
          font-size: 11px; color: #9a9080; font-family: 'DM Mono', monospace;
          word-break: break-all;
        }

        /* trust row */
        .lg-trust {
          display: flex; align-items: center; justify-content: center; gap: 20px;
          margin-top: 20px;
        }
        .lg-trust-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; color: rgba(240,237,232,0.6);
        }
        .lg-trust-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #52b788;
          animation: lgPulse 2s ease-in-out infinite;
        }
        .lg-trust-dot:nth-child(1) { animation-delay: 0.3s; }
        @keyframes lgPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }

        /* desktop: give the card a bit more room */
        @media (min-width: 640px) {
          .lg-card-body { padding: 40px 40px 36px; }
          .lg-brand-name { font-size: 34px; }
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-grain" />
        <div className="lg-glow-tl" />
        <div className="lg-glow-br" />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>

          {/* ── CARD ── */}
          <div className="lg-card">
            <div className="lg-accent-bar" />
            <div className="lg-card-body">

              {/* Branding */}
              <div className="lg-brand">
                <div className="lg-brand-icon">
                  <Sprout size={34} color="#fff" />
                </div>
                <div className="lg-brand-name">AgroConnect</div>
                <div className="lg-brand-tag">
                  {isAdmin ? '🛡️ Admin Portal' : '🌾 Smart Farming Platform'}
                </div>
              </div>

              {/* Admin toggle */}
              <div className="lg-admin-wrap">
                <button
                  type="button"
                  className={`lg-admin-btn ${isAdmin ? 'on' : 'off'}`}
                  onClick={() => setIsAdmin(!isAdmin)}
                >
                  {isAdmin && <Shield size={14} />}
                  {isAdmin ? 'Admin Login' : 'Switch to Admin Login'}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="lg-field">
                  <label className="lg-label">{t('auth.email')}</label>
                  <div className="lg-input-wrap">
                    <span className="lg-input-icon"><Mail size={16} /></span>
                    <input
                      type="email" name="email" className="lg-input"
                      value={formData.email} onChange={handleChange}
                      required placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="lg-field">
                  <label className="lg-label">{t('auth.password')}</label>
                  <div className="lg-input-wrap">
                    <span className="lg-input-icon"><Lock size={16} /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password" className="lg-input"
                      style={{ paddingRight: 46 }}
                      value={formData.password} onChange={handleChange}
                      required placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="lg-pw-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="lg-submit" disabled={loading}>
                  {loading
                    ? <div className="lg-spinner" />
                    : <>{t('auth.login')} <ArrowRight size={17} /></>
                  }
                </button>
              </form>

              {/* Register link */}
              {!isAdmin && (
                <div className="lg-register">
                  {t('auth.noAccount')}{' '}
                  <Link to="/register">
                    {t('auth.register')} <ArrowRight size={12} />
                  </Link>
                </div>
              )}

              {/* Demo credentials */}
              <div className="lg-demo">
                <div className="lg-demo-head">
                  <div className="lg-demo-icon">
                    <Shield size={13} color="#b87a00" />
                  </div>
                  🔑 Demo Credentials
                </div>
                {[
                  { role: 'Farmer',  color: '#2d6a4f', creds: 'farmer@example.com / password123' },
                  { role: 'Company', color: '#1d4e89', creds: 'company@example.com / password123' },
                  { role: 'Admin',   color: '#c0392b', creds: 'admin@example.com / admin123' },
                ].map(({ role, color, creds }) => (
                  <div key={role} className="lg-demo-row">
                    <span className="lg-demo-role" style={{ color }}>{role}</span>
                    <span className="lg-demo-creds">{creds}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust row */}
          <div className="lg-trust">
            <div className="lg-trust-item"><span className="lg-trust-dot" />Secure Login</div>
            <div className="lg-trust-item"><span className="lg-trust-dot" />Encrypted Data</div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;