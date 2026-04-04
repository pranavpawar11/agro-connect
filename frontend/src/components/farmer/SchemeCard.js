import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';

const SchemeCard = ({ scheme }) => {
  const navigate   = useNavigate();
  const { i18n }   = useTranslation();
  const { user }   = useAuth();

  const currentLang  = user?.language || i18n.language || 'en';
  const name         = scheme.name?.[currentLang]        || scheme.name?.en        || 'Untitled Scheme';
  const description  = scheme.description?.[currentLang] || scheme.description?.en || '';

  return (
    <>
      <style>{`
        .sk-card {
          background: #fff; border-radius: 16px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          padding: 16px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow 0.2s, transform 0.2s;
          display: flex; align-items: flex-start; gap: 12px;
        }
        .sk-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.09); transform: translateY(-2px); }
        .sk-content { flex: 1; min-width: 0; }
        .sk-name {
          font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 700; color: #1c2e1c;
          margin-bottom: 5px; line-height: 1.3;
        }
        .sk-desc {
          font-size: 12px; color: #9a9080; line-height: 1.55;
          margin-bottom: 10px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .sk-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .sk-cat-pill {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 99px;
          font-size: 11px; font-weight: 700; text-transform: capitalize;
          background: #ede9fe; color: #5b21b6; border: 1px solid #c4b5fd;
        }
        .sk-state {
          font-size: 11px; font-weight: 500; color: #9a9080;
        }
        .sk-arrow { flex-shrink: 0; color: #c8bfb2; transition: color 0.15s; margin-top: 2px; }
        .sk-card:hover .sk-arrow { color: #5b21b6; }
      `}</style>

      <div className="sk-card" onClick={() => navigate(`/farmer/schemes/${scheme._id}`)}>
        <div className="sk-content">
          <div className="sk-name">{name}</div>
          <div className="sk-desc">{description}</div>
          <div className="sk-meta">
            <span className="sk-cat-pill">{scheme.category}</span>
            <span className="sk-state">📍 {scheme.state}</span>
          </div>
        </div>
        <ChevronRight size={18} className="sk-arrow" />
      </div>
    </>
  );
};

export default SchemeCard;