import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import SchemeCard from '../../components/farmer/SchemeCard';
import Loading from '../../components/common/Loading';
import schemeService from '../../services/schemeService';
import useAuth from '../../hooks/useAuth';
import { SCHEME_CATEGORIES } from '../../utils/constants';

const Schemes = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  const fetchSchemes = async () => {
    try {
      const currentLang = user?.language || i18n.language || 'en';
      const filters = { language: currentLang };
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      const data = await schemeService.getAllSchemes(filters);
      setSchemes(data.schemes);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sc-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 84px;
        }

        /* ── HEADER ── */
        .sc-header {
          background: #1c3a1c;
          position: relative; overflow: hidden;
        }
        .sc-header-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .sc-header-glow {
          position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(91,33,182,0.15) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .sc-header-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 32px; background: #f7f3ee;
          border-radius: 32px 32px 0 0; z-index: 2;
        }
        .sc-header-inner {
          position: relative; z-index: 1; padding: 20px 18px 36px;
          display: flex; align-items: center; gap: 12px;
        }
        .sc-back-btn {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8; transition: background 0.15s;
        }
        .sc-back-btn:hover { background: rgba(255,255,255,0.18); }
        .sc-header-icon {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        .sc-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #f0ede8;
          letter-spacing: -0.3px; margin-bottom: 2px;
        }
        .sc-subtitle { font-size: 11px; color: rgba(240,237,232,0.5); font-weight: 500; }

        /* ── CATEGORY FILTER ── */
        .sc-filter-card {
          margin: 16px 16px 0;
          background: #fff; border-radius: 18px; padding: 16px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .sc-filter-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; color: #1c2e1c;
          margin-bottom: 12px;
        }
        .sc-tabs {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px;
        }
        .sc-tabs::-webkit-scrollbar { display: none; }
        .sc-tab {
          padding: 7px 14px; border-radius: 10px;
          font-size: 12px; font-weight: 700;
          white-space: nowrap; flex-shrink: 0;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s; border: none; text-transform: capitalize;
        }
        .sc-tab.active  { background: #1c3a1c; color: #f0ede8; }
        .sc-tab.inactive { background: #f7f3ee; color: #6a6055; border: 1px solid #e8e2da; }
        .sc-tab.inactive:hover { border-color: #5b21b6; color: #5b21b6; }

        /* ── BODY ── */
        .sc-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

        /* ── EMPTY STATE ── */
        .sc-empty {
          background: #fff; border-radius: 20px; padding: 48px 24px;
          text-align: center; border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .sc-empty-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: #f0ede8; border: 1px solid #e8e2da;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .sc-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #1c2e1c; margin-bottom: 6px;
        }
        .sc-empty-sub { font-size: 13px; color: #9a9080; }
      `}</style>

      <div className="sc-root">

        {/* ── HEADER ── */}
        <header className="sc-header">
          <div className="sc-header-grain" />
          <div className="sc-header-glow" />
          <div className="sc-header-inner">
            <button className="sc-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
            </button>
            {/* <div className="sc-header-icon">
              <BookOpen size={18} color="#f0ede8" />
            </div> */}
            <div style={{ flex: 1 }}>
              <div className="sc-title">{t('farmer.schemes')}</div>
              <div className="sc-subtitle">Government welfare programs</div>
            </div>
          </div>
          <div className="sc-header-arc" />
        </header>

        {/* ── CATEGORY FILTER ── */}
        <div className="sc-filter-card">
          <div className="sc-filter-label">
            <Filter size={15} color="#5b21b6" />
            {t('scheme.category')}
          </div>
          <div className="sc-tabs">
            <button
              className={`sc-tab ${selectedCategory === 'all' ? 'active' : 'inactive'}`}
              onClick={() => setSelectedCategory('all')}
            >
              {t('scheme.all')}
            </button>
            {SCHEME_CATEGORIES.map((category) => (
              <button
                key={category}
                className={`sc-tab ${selectedCategory === category ? 'active' : 'inactive'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {t(`scheme.category_${category}`) || category}
              </button>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="sc-body">
          {loading ? (
            <div style={{ padding: '48px 0' }}><Loading /></div>
          ) : schemes.length > 0 ? (
            schemes.map((scheme) => (
              <SchemeCard key={scheme._id} scheme={scheme} />
            ))
          ) : (
            <div className="sc-empty">
              <div className="sc-empty-icon">
                <BookOpen size={32} color="#b0a898" />
              </div>
              <div className="sc-empty-title">{t('scheme.noSchemes')}</div>
              <div className="sc-empty-sub">Try selecting a different category</div>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default Schemes;