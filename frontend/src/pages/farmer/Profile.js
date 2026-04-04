import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X,
  LogOut, Leaf, Award, TrendingUp, Settings, Globe,
  Volume2, ArrowLeft, ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import useAuth from '../../hooks/useAuth';
import useVoice from '../../hooks/useVoice';
import { LanguageContext } from '../../context/LanguageContext';
import authService from '../../services/authService';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const { language, changeLanguage } = React.useContext(LanguageContext);
  const { isEnabled, toggleVoice } = useVoice();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    farmerDetails: {
      address:  user?.farmerDetails?.address  || '',
      village:  user?.farmerDetails?.village  || '',
      district: user?.farmerDetails?.district || '',
      state:    user?.farmerDetails?.state    || '',
      pincode:  user?.farmerDetails?.pincode  || '',
      landSize: user?.farmerDetails?.landSize || '',
      crops:    user?.farmerDetails?.crops?.join(', ') || '',
    }
  });

  const handleSave = async () => {
    try {
      const updateData = {
        name:  formData.name,
        phone: formData.phone,
        language,
        farmerDetails: {
          ...formData.farmerDetails,
          crops: formData.farmerDetails.crops.split(',').map(c => c.trim()).filter(c => c)
        }
      };
      const data = await authService.updateProfile(updateData);
      updateUser(data.user);
      setIsEditing(false);
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.updateError'));
    }
  };

  const handleLanguageChange = async (newLang) => {
    changeLanguage(newLang);
    try {
      await authService.updateProfile({ language: newLang });
      toast.success(t('profile.languageUpdated'));
    } catch (error) { console.error('Error updating language:', error); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const getVerificationBadge = () => {
    const s = user?.verificationStatus;
    if (s === 'verified') return { bg: '#d8f3dc', color: '#2d6a4f', text: 'Verified' };
    if (s === 'pending')  return { bg: '#fff3cd', color: '#92400e', text: 'Pending'  };
    return { bg: '#f3f4f6', color: '#6b7280', text: s || 'Unknown' };
  };
  const badge = getVerificationBadge();

  const fd = formData.farmerDetails;
  const setFd = (patch) => setFormData(p => ({ ...p, farmerDetails: { ...p.farmerDetails, ...patch } }));

  const inputCls = {
    width: '100%',
    background: '#fff',
    border: '1.5px solid #ddd5c8',
    borderRadius: 10,
    padding: '9px 12px',
    fontSize: 14,
    fontWeight: 600,
    color: '#1c2e1c',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <>
      <style>{`

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pr-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 84px;
        }

        /* ── HEADER ── */
        .pr-header {
          background: #1c3a1c;
          position: relative;
          overflow: hidden;
          padding-bottom: 72px;
        }
        .pr-header-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .pr-header-glow {
          position: absolute; top: -80px; right: -80px;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(107,195,107,0.1) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .pr-header-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 36px; background: #f7f3ee;
          border-radius: 36px 36px 0 0; z-index: 2;
        }
        .pr-header-inner {
          position: relative; z-index: 1; padding: 20px 18px 0;
        }

        /* topbar */
        .pr-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .pr-back-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px; padding: 8px 14px;
          color: #f0ede8; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .pr-back-btn:hover { background: rgba(255,255,255,0.18); }
        .pr-settings-btn {
          width: 40px; height: 40px; border-radius: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8; transition: background 0.15s;
        }
        .pr-settings-btn:hover { background: rgba(255,255,255,0.18); }

        /* avatar card */
        .pr-avatar-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 20px; padding: 20px;
        }
        .pr-avatar-row { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .pr-avatar-circle {
          width: 68px; height: 68px; border-radius: 18px; flex-shrink: 0;
          background: linear-gradient(135deg, #52b788, #2d6a4f);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700; color: #fff;
          position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .pr-avatar-online {
          position: absolute; bottom: -3px; right: -3px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #5cb85c; border: 2.5px solid #1c3a1c;
        }
        .pr-user-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #f0ede8;
          letter-spacing: -0.3px; margin-bottom: 4px;
        }
        .pr-user-role {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: rgba(240,237,232,0.55);
          font-weight: 500; text-transform: capitalize; margin-bottom: 6px;
        }
        .pr-badge {
          display: inline-block; padding: 3px 10px; border-radius: 99px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.2px;
        }

        /* stats row */
        .pr-stats-row {
          display: grid; grid-template-columns: repeat(3,1fr);
          border-top: 1px solid rgba(255,255,255,0.12);
          padding-top: 14px; gap: 0;
        }
        .pr-stat-item { text-align: center; }
        .pr-stat-item + .pr-stat-item { border-left: 1px solid rgba(255,255,255,0.1); }
        .pr-stat-val {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #f0ede8;
        }
        .pr-stat-lbl { font-size: 10px; color: rgba(240,237,232,0.45); font-weight: 500; margin-top: 1px; }

        /* ── BODY ── */
        .pr-body { padding: 20px 16px 0; }

        /* section card */
        .pr-card {
          background: #fff; border-radius: 20px; padding: 20px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin-bottom: 14px;
        }
        .pr-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 700; color: #1c2e1c;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px;
        }
        .pr-card-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }

        /* edit button */
        .pr-edit-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px;
          background: #f0f5f0; border: 1.5px solid #c8dcc8;
          color: #2d6a4f; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .pr-edit-btn:hover { background: #d8f0dc; }
        .pr-icon-btn {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 1.5px solid #e8e2da;
          background: #fafafa; transition: all 0.15s;
        }
        .pr-icon-btn:hover { background: #f0ede8; }
        .pr-icon-btn.green { background: #2d6a4f; border-color: #2d6a4f; }
        .pr-icon-btn.green:hover { background: #1a5c38; }

        /* info row */
        .pr-info-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          background: #f7f3ee; margin-bottom: 8px;
          border: 1px solid #ede8e0;
        }
        .pr-info-icon { flex-shrink: 0; margin-top: 2px; }
        .pr-info-label { font-size: 10px; font-weight: 700; color: #9a9080; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
        .pr-info-val { font-size: 14px; font-weight: 600; color: #1c2e1c; }

        /* editing sub-section */
        .pr-edit-sub {
          border-left: 3px solid #c8dcc8; padding-left: 14px;
          margin-bottom: 8px; display: flex; flex-direction: column; gap: 10px;
        }
        .pr-edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .pr-edit-label { font-size: 11px; font-weight: 700; color: #6a6055; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }

        /* farm tiles */
        .pr-farm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .pr-farm-tile {
          padding: 14px; border-radius: 14px;
          border: 1px solid #e8e2da;
        }
        .pr-farm-tile-label { font-size: 10px; font-weight: 700; color: #9a9080; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
        .pr-farm-tile-val {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700;
        }
        .pr-farm-tile-unit { font-size: 11px; font-weight: 500; margin-top: 1px; }

        /* crops */
        .pr-crops-wrap { padding: 14px; border-radius: 14px; background: #fdf8f0; border: 1px solid #e8e2da; }
        .pr-crop-tag {
          display: inline-block; padding: 5px 12px; border-radius: 8px;
          background: #fff; border: 1px solid #e0d5c8;
          font-size: 12px; font-weight: 700; color: #4a3828; margin: 3px;
          text-transform: capitalize;
        }

        /* performance */
        .pr-perf {
          background: #1c3a1c; border-radius: 20px;
          padding: 20px; margin-bottom: 14px; position: relative; overflow: hidden;
        }
        .pr-perf-grain {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .pr-perf-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 700; color: #f0ede8;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px; position: relative; z-index: 1;
        }
        .pr-perf-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          position: relative; z-index: 1;
        }
        .pr-perf-item {}
        .pr-perf-label { font-size: 10px; font-weight: 600; color: rgba(240,237,232,0.4); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
        .pr-perf-val {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 700; color: #f0ede8;
        }
        .pr-perf-val.green  { color: #74c69d; }
        .pr-perf-val.yellow { color: #fcc419; }

        /* settings */
        .pr-lang-btns { display: flex; gap: 8px; }
        .pr-lang-btn {
          flex: 1; padding: 10px 8px; border-radius: 12px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; border: 1.5px solid transparent;
          transition: all 0.15s;
        }
        .pr-lang-btn.active { background: #1c3a1c; color: #f0ede8; border-color: #1c3a1c; }
        .pr-lang-btn.inactive { background: #f7f3ee; color: #6a6055; border-color: #e8e2da; }
        .pr-lang-btn.inactive:hover { border-color: #c8bfb2; }

        .pr-divider { height: 1px; background: #ede8e0; margin: 16px 0; }

        .pr-toggle-row { display: flex; align-items: center; justify-content: space-between; }
        .pr-toggle-label { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #2a2a2a; }
        .pr-toggle-track {
          width: 46px; height: 26px; border-radius: 99px;
          position: relative; cursor: pointer; border: none;
          transition: background 0.2s;
        }
        .pr-toggle-thumb {
          position: absolute; top: 3px;
          width: 20px; height: 20px; border-radius: 50%;
          background: white; transition: transform 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }

        /* save/cancel row */
        .pr-save-row { display: flex; gap: 10px; margin-top: 16px; }
        .pr-cancel-btn {
          flex: 1; padding: 12px; border-radius: 12px;
          background: #f7f3ee; border: 1.5px solid #e8e2da;
          color: #6a6055; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.15s;
        }
        .pr-cancel-btn:hover { background: #ede8e0; }
        .pr-save-btn {
          flex: 1; padding: 12px; border-radius: 12px;
          background: #1c3a1c; border: none;
          color: #f0ede8; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.15s;
          box-shadow: 0 4px 14px rgba(28,58,28,0.25);
        }
        .pr-save-btn:hover { background: #2a5a2a; }

        /* logout */
        .pr-logout-btn {
          width: 100%; padding: 14px; border-radius: 14px;
          background: #fff; border: 1.5px solid #f0d0d0;
          color: #c0392b; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.15s; margin-bottom: 8px;
        }
        .pr-logout-btn:hover { background: #fff5f5; border-color: #e0a0a0; }
      `}</style>

      <div className="pr-root">

        {/* ── HEADER ── */}
        <header className="pr-header">
          <div className="pr-header-grain" />
          <div className="pr-header-glow" />

          <div className="pr-header-inner">
            <div className="pr-topbar">
              <button className="pr-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} />
                {t('common.profile')}
              </button>
              <button className="pr-settings-btn" onClick={() => navigate('/farmer/settings')}>
                <Settings size={18} />
              </button>
            </div>

            <div className="pr-avatar-card">
              <div className="pr-avatar-row">
                <div className="pr-avatar-circle">
                  {user?.name?.charAt(0).toUpperCase()}
                  <div className="pr-avatar-online" />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="pr-user-name">{user?.name}</div>
                  <div className="pr-user-role">
                    <Award size={12} />
                    {user?.role}
                  </div>
                  <span
                    className="pr-badge"
                    style={{ background: badge.bg, color: badge.color }}
                  >{badge.text}</span>
                </div>
              </div>

              <div className="pr-stats-row">
                {[
                  { val: '4.8', lbl: 'Rating' },
                  { val: '12',  lbl: 'Contracts' },
                  { val: '3',   lbl: 'Years' },
                ].map((s, i) => (
                  <div key={i} className="pr-stat-item">
                    <div className="pr-stat-val">{s.val}</div>
                    <div className="pr-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pr-header-arc" />
        </header>

        {/* ── BODY ── */}
        <div className="pr-body">

          {/* Personal Information */}
          <div className="pr-card">
            <div className="pr-card-head">
              <div className="pr-card-title" style={{ margin: 0 }}>
                <User size={17} color="#2d6a4f" />
                {t('profile.personalInfo') || 'Personal Information'}
              </div>
              {!isEditing ? (
                <button className="pr-edit-btn" onClick={() => setIsEditing(true)}>
                  <Edit size={13} /> {t('profile.editProfile')}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="pr-icon-btn" onClick={() => setIsEditing(false)}>
                    <X size={15} color="#6a6055" />
                  </button>
                  <button className="pr-icon-btn green" onClick={handleSave}>
                    <Save size={15} color="#fff" />
                  </button>
                </div>
              )}
            </div>

            {/* Name */}
            <div className="pr-info-row">
              <User size={15} color="#9a9080" className="pr-info-icon" />
              <div style={{ flex: 1 }}>
                <div className="pr-info-label">{t('profile.name')}</div>
                {isEditing
                  ? <input style={inputCls} type="text" value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                  : <div className="pr-info-val">{user?.name}</div>
                }
              </div>
            </div>

            {/* Email */}
            <div className="pr-info-row">
              <Mail size={15} color="#9a9080" className="pr-info-icon" />
              <div style={{ flex: 1 }}>
                <div className="pr-info-label">{t('profile.email') || 'Email'}</div>
                <div className="pr-info-val">{user?.email}</div>
              </div>
            </div>

            {/* Phone */}
            <div className="pr-info-row">
              <Phone size={15} color="#9a9080" className="pr-info-icon" />
              <div style={{ flex: 1 }}>
                <div className="pr-info-label">{t('profile.phone')}</div>
                {isEditing
                  ? <input style={inputCls} type="tel" value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                  : <div className="pr-info-val">{user?.phone}</div>
                }
              </div>
            </div>

            {/* Location */}
            <div className="pr-info-row">
              <MapPin size={15} color="#9a9080" className="pr-info-icon" />
              <div style={{ flex: 1 }}>
                <div className="pr-info-label">{t('profile.address')}</div>
                {isEditing
                  ? <input style={inputCls} type="text" value={fd.address}
                      onChange={e => setFd({ address: e.target.value })} />
                  : <div className="pr-info-val">
                      {[user?.farmerDetails?.address, user?.farmerDetails?.village,
                        user?.farmerDetails?.district, user?.farmerDetails?.state].filter(Boolean).join(', ')}
                      {user?.farmerDetails?.pincode && ` — ${user.farmerDetails.pincode}`}
                    </div>
                }
              </div>
            </div>

            {/* Extended editing fields */}
            {isEditing && (
              <div className="pr-edit-sub">
                <div className="pr-edit-grid">
                  <div>
                    <div className="pr-edit-label">{t('profile.village')}</div>
                    <input style={inputCls} type="text" value={fd.village} onChange={e => setFd({ village: e.target.value })} />
                  </div>
                  <div>
                    <div className="pr-edit-label">{t('profile.district')}</div>
                    <input style={inputCls} type="text" value={fd.district} onChange={e => setFd({ district: e.target.value })} />
                  </div>
                </div>
                <div className="pr-edit-grid">
                  <div>
                    <div className="pr-edit-label">{t('profile.state')}</div>
                    <input style={inputCls} type="text" value={fd.state} onChange={e => setFd({ state: e.target.value })} />
                  </div>
                  <div>
                    <div className="pr-edit-label">{t('profile.pincode')}</div>
                    <input style={inputCls} type="text" value={fd.pincode} onChange={e => setFd({ pincode: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* Member since */}
            <div className="pr-info-row" style={{ marginBottom: 0 }}>
              <Calendar size={15} color="#9a9080" className="pr-info-icon" />
              <div style={{ flex: 1 }}>
                <div className="pr-info-label">{t('profile.memberSince') || 'Member Since'}</div>
                <div className="pr-info-val">{formatDate(user?.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Farm Details */}
          <div className="pr-card">
            <div className="pr-card-title">
              <Leaf size={17} color="#2d6a4f" />
              {t('profile.farmDetails')}
            </div>

            <div className="pr-farm-grid">
              <div className="pr-farm-tile" style={{ background: '#f0f7f2' }}>
                <div className="pr-farm-tile-label">{t('profile.landSizeLabel')}</div>
                {isEditing
                  ? <input style={{ ...inputCls, fontSize: 13 }} type="number" value={fd.landSize}
                      onChange={e => setFd({ landSize: e.target.value })} />
                  : <>
                      <div className="pr-farm-tile-val" style={{ color: '#2d6a4f' }}>
                        {user?.farmerDetails?.landSize || '—'}
                      </div>
                      <div className="pr-farm-tile-unit" style={{ color: '#52b788' }}>{t('profile.acres')}</div>
                    </>
                }
              </div>
              <div className="pr-farm-tile" style={{ background: '#f0f5fa' }}>
                <div className="pr-farm-tile-label">Irrigation</div>
                <div className="pr-farm-tile-val" style={{ color: '#1d4e89', textTransform: 'capitalize' }}>
                  {user?.farmerDetails?.irrigationType || 'Mixed'}
                </div>
                <div className="pr-farm-tile-unit" style={{ color: '#4a7fba' }}>type</div>
              </div>
            </div>

            <div className="pr-crops-wrap">
              <div className="pr-farm-tile-label" style={{ marginBottom: 8 }}>{t('profile.cropsLabel')}</div>
              {isEditing
                ? <input style={inputCls} type="text" value={fd.crops}
                    placeholder={t('profile.cropsPlaceholder')}
                    onChange={e => setFd({ crops: e.target.value })} />
                : user?.farmerDetails?.crops?.length > 0
                  ? user.farmerDetails.crops.map((c, i) => (
                      <span key={i} className="pr-crop-tag">{c}</span>
                    ))
                  : <span style={{ fontSize: 13, color: '#9a9080' }}>—</span>
              }
            </div>

            {isEditing && (
              <div className="pr-save-row">
                <button className="pr-cancel-btn" onClick={() => setIsEditing(false)}>
                  <X size={15} /> {t('common.cancel')}
                </button>
                <button className="pr-save-btn" onClick={handleSave}>
                  <Save size={15} /> {t('profile.saveChanges')}
                </button>
              </div>
            )}
          </div>

          {/* Performance */}
          <div className="pr-perf">
            <div className="pr-perf-grain" />
            <div className="pr-perf-title">
              <TrendingUp size={17} color="#74c69d" />
              Performance Overview
            </div>
            <div className="pr-perf-grid">
              <div className="pr-perf-item">
                <div className="pr-perf-label">Total Contracts</div>
                <div className="pr-perf-val">12</div>
              </div>
              <div className="pr-perf-item">
                <div className="pr-perf-label">Completed</div>
                <div className="pr-perf-val green">10</div>
              </div>
              <div className="pr-perf-item">
                <div className="pr-perf-label">Success Rate</div>
                <div className="pr-perf-val">83%</div>
              </div>
              <div className="pr-perf-item">
                <div className="pr-perf-label">Total Earnings</div>
                <div className="pr-perf-val yellow">₹2.4L</div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="pr-card">
            <div className="pr-card-title">
              <Settings size={17} color="#6a6055" />
              {t('common.settings')}
            </div>

            {/* Language */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Globe size={15} color="#2d6a4f" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#2a2a2a' }}>{t('common.language')}</span>
              </div>
              <div className="pr-lang-btns">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिंदी' },
                  { code: 'mr', label: 'मराठी' },
                ].map(l => (
                  <button
                    key={l.code}
                    className={`pr-lang-btn ${language === l.code ? 'active' : 'inactive'}`}
                    onClick={() => handleLanguageChange(l.code)}
                  >{l.label}</button>
                ))}
              </div>
            </div>

            <div className="pr-divider" />

            {/* Voice */}
            <div className="pr-toggle-row">
              <div className="pr-toggle-label">
                <Volume2 size={17} color="#2d6a4f" />
                {t('profile.voiceGuide')}
              </div>
              <button
                className="pr-toggle-track"
                style={{ background: isEnabled ? '#2d6a4f' : '#ddd5c8' }}
                onClick={toggleVoice}
              >
                <div
                  className="pr-toggle-thumb"
                  style={{ transform: isEnabled ? 'translateX(22px)' : 'translateX(3px)' }}
                />
              </button>
            </div>
          </div>

          {/* Logout */}
          <button className="pr-logout-btn" onClick={handleLogout}>
            <LogOut size={17} />
            {t('common.logout')}
          </button>

        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default Profile;