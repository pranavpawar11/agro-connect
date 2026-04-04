import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, FileText, Phone, Globe, Volume2, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import schemeService from '../../services/schemeService';
import useAuth from '../../hooks/useAuth';
import useVoice from '../../hooks/useVoice';

const SchemeDetail = () => {
  const { schemeId } = useParams();
  const navigate     = useNavigate();
  const { t, i18n } = useTranslation();
  const { user }    = useAuth();
  const { speak, isEnabled } = useVoice();
  const [scheme,  setScheme]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSchemeDetail(); }, [schemeId]);

  const fetchSchemeDetail = async () => {
    try {
      const data = await schemeService.getSchemeById(schemeId, user?.language || 'en');
      setScheme(data.scheme);
    } catch (error) {
      console.error('Error fetching scheme:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentLang = user?.language || i18n.language || 'en';

  const getLocalizedText = (field) => {
    if (!scheme || !field) return '';
    if (typeof field === 'string') return field;
    return field[currentLang] || field.en || '';
  };

  const handleSpeak = () => {
    if (scheme) {
      const text = `${getLocalizedText(scheme.name)}. ${getLocalizedText(scheme.description)}`;
      speak(text, currentLang);
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!scheme) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f3ee' }}>
      <p style={{ color: '#9a9080', fontFamily: 'DM Sans, sans-serif' }}>{t('common.loading')}</p>
    </div>
  );

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sd-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 84px;
        }

        /* ── HEADER ── */
        .sd-header {
          background: #1c3a1c;
          position: relative; overflow: hidden;
        }
        .sd-header-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .sd-header-glow {
          position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(91,33,182,0.15) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .sd-header-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 32px; background: #f7f3ee;
          border-radius: 32px 32px 0 0; z-index: 2;
        }
        .sd-header-inner {
          position: relative; z-index: 1; padding: 20px 18px 36px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .sd-header-left { display: flex; align-items: center; gap: 12px; }
        .sd-back-btn {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8; transition: background 0.15s;
        }
        .sd-back-btn:hover { background: rgba(255,255,255,0.18); }
        .sd-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #f0ede8; letter-spacing: -0.3px;
        }
        .sd-voice-btn {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8; transition: background 0.15s;
        }
        .sd-voice-btn:hover { background: rgba(255,255,255,0.18); }

        /* ── BODY ── */
        .sd-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

        /* title card */
        .sd-title-card {
          background: #fff; border-radius: 20px; padding: 20px;
          border: 1px solid #e8e2da; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: flex; align-items: flex-start; gap: 16px;
        }
        .sd-title-icon {
          width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0;
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(91,33,182,0.3);
        }
        .sd-scheme-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #1c2e1c;
          line-height: 1.25; margin-bottom: 10px;
        }
        .sd-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .sd-pill {
          display: inline-flex; align-items: center;
          padding: 4px 12px; border-radius: 99px;
          font-size: 12px; font-weight: 700; text-transform: capitalize;
        }
        .sd-pill-purple { background: #ede9fe; color: #5b21b6; border: 1px solid #c4b5fd; }
        .sd-pill-neutral { background: #f0ede8; color: #6a6055; border: 1px solid #ddd5c8; }

        /* section cards */
        .sd-section {
          background: #fff; border-radius: 18px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .sd-section-head {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 16px; background: #fafaf8;
          border-bottom: 1px solid #ede8e0;
        }
        .sd-section-icon {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .sd-section-title { font-size: 14px; font-weight: 700; color: #1c2e1c; }
        .sd-section-accent {
          width: 4px; height: 20px; border-radius: 99px; flex-shrink: 0;
        }
        .sd-section-body {
          padding: 16px;
          font-size: 13px; color: #4a4035; line-height: 1.65;
        }
        .sd-section-body.pre { white-space: pre-line; }

        /* benefits dark card */
        .sd-benefits {
          background: #1c3a1c; border-radius: 18px; padding: 18px;
          position: relative; overflow: hidden;
        }
        .sd-benefits-grain {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .sd-benefits-title {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: #f0ede8;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 12px; position: relative; z-index: 1;
        }
        .sd-benefits-text {
          font-size: 13px; color: rgba(240,237,232,0.8);
          line-height: 1.65; position: relative; z-index: 1;
        }

        /* contact card */
        .sd-contact-card {
          background: #fff; border-radius: 18px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .sd-contact-head {
          padding: 13px 16px; background: #fafaf8;
          border-bottom: 1px solid #ede8e0;
          font-size: 14px; font-weight: 700; color: #1c2e1c;
        }
        .sd-contact-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
        .sd-contact-link {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 14px;
          text-decoration: none; transition: all 0.15s;
        }
        .sd-contact-link.phone { background: #f0f7f2; border: 1px solid #c8dcc8; }
        .sd-contact-link.phone:hover { background: #d8f3dc; }
        .sd-contact-link.web   { background: #ede9fe; border: 1px solid #c4b5fd; }
        .sd-contact-link.web:hover   { background: #ddd6fe; }
        .sd-contact-icon {
          width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .sd-contact-link.phone .sd-contact-icon { background: #2d6a4f; }
        .sd-contact-link.web   .sd-contact-icon { background: #5b21b6; }
        .sd-contact-sub  { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 3px; }
        .sd-contact-link.phone .sd-contact-sub  { color: #2d6a4f; }
        .sd-contact-link.web   .sd-contact-sub  { color: #5b21b6; }
        .sd-contact-val  { font-size: 13px; font-weight: 700; color: #1c2e1c; }
        .sd-contact-link.web .sd-contact-val {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
      `}</style>

      <div className="sd-root">

        {/* ── HEADER ── */}
        <header className="sd-header">
          <div className="sd-header-grain" />
          <div className="sd-header-glow" />
          <div className="sd-header-inner">
            <div className="sd-header-left">
              <button className="sd-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
              </button>
              <div className="sd-title">{t('farmer.schemes')}</div>
            </div>
            {isEnabled && (
              <button className="sd-voice-btn" onClick={handleSpeak}>
                <Volume2 size={18} />
              </button>
            )}
          </div>
          <div className="sd-header-arc" />
        </header>

        {/* ── BODY ── */}
        <div className="sd-body">

          {/* Title card */}
          <div className="sd-title-card">
            <div className="sd-title-icon">
              <BookOpen size={26} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="sd-scheme-name">{getLocalizedText(scheme.name)}</div>
              <div className="sd-pills">
                <span className="sd-pill sd-pill-purple">{scheme.category}</span>
                <span className="sd-pill sd-pill-neutral">📍 {scheme.state}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="sd-section">
            <div className="sd-section-head">
              <div className="sd-section-accent" style={{ background: '#5b21b6' }} />
              <span className="sd-section-title">{t('scheme.description')}</span>
            </div>
            <div className="sd-section-body">{getLocalizedText(scheme.description)}</div>
          </div>

          {/* Eligibility */}
          <div className="sd-section">
            <div className="sd-section-head">
              <div className="sd-section-icon" style={{ background: '#d8f3dc' }}>
                <CheckCircle size={15} color="#2d6a4f" />
              </div>
              <span className="sd-section-title">{t('scheme.eligibility')}</span>
            </div>
            <div className="sd-section-body">{getLocalizedText(scheme.eligibility)}</div>
          </div>

          {/* How to apply */}
          <div className="sd-section">
            <div className="sd-section-head">
              <div className="sd-section-accent" style={{ background: '#b87a00' }} />
              <span className="sd-section-title">{t('scheme.howToApply')}</span>
            </div>
            <div className="sd-section-body pre">{getLocalizedText(scheme.steps)}</div>
          </div>

          {/* Documents */}
          <div className="sd-section">
            <div className="sd-section-head">
              <div className="sd-section-icon" style={{ background: '#fdf3e0' }}>
                <FileText size={15} color="#b87a00" />
              </div>
              <span className="sd-section-title">{t('scheme.requiredDocuments')}</span>
            </div>
            <div className="sd-section-body">{getLocalizedText(scheme.documents)}</div>
          </div>

          {/* Benefits */}
          {scheme.benefits && (
            <div className="sd-benefits">
              <div className="sd-benefits-grain" />
              <div className="sd-benefits-title">
                <Award size={17} color="#fbbf24" />
                {t('scheme.benefits')}
              </div>
              <div className="sd-benefits-text">{getLocalizedText(scheme.benefits)}</div>
            </div>
          )}

          {/* Contact info */}
          {(scheme.contactNumber || scheme.officialWebsite) && (
            <div className="sd-contact-card">
              <div className="sd-contact-head">{t('scheme.contactInformation')}</div>
              <div className="sd-contact-body">
                {scheme.contactNumber && (
                  <a href={`tel:${scheme.contactNumber}`} className="sd-contact-link phone">
                    <div className="sd-contact-icon">
                      <Phone size={17} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="sd-contact-sub">Phone</div>
                      <div className="sd-contact-val">{scheme.contactNumber}</div>
                    </div>
                  </a>
                )}
                {scheme.officialWebsite && (
                  <a href={scheme.officialWebsite} target="_blank" rel="noopener noreferrer" className="sd-contact-link web">
                    <div className="sd-contact-icon">
                      <Globe size={17} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="sd-contact-sub">Website</div>
                      <div className="sd-contact-val">{scheme.officialWebsite}</div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default SchemeDetail;