import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, IndianRupee, Package, ChevronRight, Building } from 'lucide-react';
import { formatDate, formatPrice } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';

const STATUS_META = {
  approved:    { bar: '#1d4e89', bg: '#dbeafe', text: '#1d4e89' },
  active:      { bar: '#2d6a4f', bg: '#d8f3dc', text: '#2d6a4f' },
  in_progress: { bar: '#5b21b6', bg: '#ede9fe', text: '#5b21b6' },
  completed:   { bar: '#6a6055', bg: '#f0ede8', text: '#6a6055' },
  pending:     { bar: '#b87a00', bg: '#fdf3e0', text: '#8a6000' },
  cancelled:   { bar: '#c0392b', bg: '#fff5f5', text: '#c0392b' },
};

const CROP_EMOJI_MAP = [
  ['wheat','🌾'],['rice','🍚'],['paddy','🌾'],['maize','🌽'],['cotton','🏵️'],
  ['tomato','🍅'],['onion','🧅'],['potato','🥔'],['banana','🍌'],['mango','🥭'],
  ['soybean','🫘'],['groundnut','🥜'],['sugarcane','🎋'],['chilli','🌶️'],
  ['garlic','🧄'],['ginger','🫛'],['carrot','🥕'],['grape','🍇'],['apple','🍎'],
];
const getCropEmoji = (name = '') => {
  const lower = name.toLowerCase();
  for (const [k, e] of CROP_EMOJI_MAP) if (lower.includes(k)) return e;
  return '🌾';
};

const ContractCard = ({ contract }) => {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const meta     = STATUS_META[contract.status] || STATUS_META.pending;

  return (
    <>
      <style>{`
        .cc-card {
          background: #fff; border-radius: 18px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .cc-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .cc-topbar { height: 4px; width: 100%; }
        .cc-body   { padding: 14px; }
        .cc-top-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .cc-emoji {
          width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0;
          background: #fdf8f0; border: 1px solid #ede8e0;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .cc-crop-name {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: #1c2e1c;
          text-transform: capitalize; margin-bottom: 3px;
        }
        .cc-company, .cc-meta {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: #9a9080; margin-top: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cc-status-pill {
          flex-shrink: 0; font-size: 10px; font-weight: 700;
          padding: 3px 9px; border-radius: 99px;
        }
        .cc-details { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
        .cc-detail-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #6a6055; font-weight: 500;
        }
        .cc-footer {
          background: #fdf8f0; border-top: 1px solid #ede8e0;
          padding: 10px 14px; display: flex; align-items: center; justify-content: flex-end;
          gap: 5px; font-size: 12px; font-weight: 700; color: #2d6a4f;
        }
      `}</style>

      <div className="cc-card" onClick={() => navigate(`/farmer/contracts/${contract._id}`)}>
        <div className="cc-topbar" style={{ background: meta.bar }} />

        <div className="cc-body">
          <div className="cc-top-row">
            <div className="cc-emoji">{getCropEmoji(contract.cropType)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div className="cc-crop-name">{contract.cropType}</div>
                <span className="cc-status-pill" style={{ background: meta.bg, color: meta.text }}>
                  {t(`contract.status.${contract.status}`)}
                </span>
              </div>
              <div className="cc-company">
                <Building size={11} style={{ flexShrink: 0 }} />
                {contract.company?.companyDetails?.companyName}
              </div>
              <div className="cc-meta">
                <MapPin size={11} style={{ flexShrink: 0 }} />
                {contract.location.district}, {contract.location.state}
              </div>
            </div>
          </div>

          <div className="cc-details">
            <div className="cc-detail-row">
              <Package size={13} color="#9a9080" style={{ flexShrink: 0 }} />
              {contract.quantity} {contract.unit}
            </div>
            <div className="cc-detail-row">
              <IndianRupee size={13} color="#2d6a4f" style={{ flexShrink: 0 }} />
              <span style={{ color: '#2d6a4f', fontWeight: 700 }}>
                {formatPrice(contract.agreedPrice)}
              </span>
              <span style={{ color: '#b0a898' }}>per {contract.unit}</span>
            </div>
            <div className="cc-detail-row">
              <Calendar size={13} color="#9a9080" style={{ flexShrink: 0 }} />
              {formatDate(contract.duration.startDate)} — {formatDate(contract.duration.endDate)}
            </div>
          </div>
        </div>

        <div className="cc-footer">
          {t('contract.viewDetails')}
          <ChevronRight size={14} />
        </div>
      </div>
    </>
  );
};

export default ContractCard;