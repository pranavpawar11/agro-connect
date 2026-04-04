import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, IndianRupee, Package, FileText,
  Building, MessageSquare, AlertTriangle, CheckCircle, ExternalLink,
  Clock, XCircle, CreditCard, Truck, ShieldCheck, ShieldAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import disputeService from '../../services/disputeService';
import { formatDate, formatPrice, getFileUrl } from '../../utils/helpers';
import { toast } from 'react-toastify';

// ── Status colour maps ────────────────────────────────────────────────────────
const STATUS_META = {
  approved:    { bar: '#1d4e89', bg: '#dbeafe', text: '#1d4e89' },
  active:      { bar: '#2d6a4f', bg: '#d8f3dc', text: '#2d6a4f' },
  in_progress: { bar: '#5b21b6', bg: '#ede9fe', text: '#5b21b6' },
  completed:   { bar: '#6a6055', bg: '#f0ede8', text: '#6a6055' },
  pending:     { bar: '#b87a00', bg: '#fdf3e0', text: '#8a6000' },
  cancelled:   { bar: '#c0392b', bg: '#fff5f5', text: '#c0392b' },
};

const APP_BANNER = {
  pending:  { bg: '#eef4fb', border: '#c2d6f0', icon: Clock,        iconBg: '#dbeafe', iconColor: '#1d4e89' },
  accepted: { bg: '#f0f7f2', border: '#c8dcc8', icon: CheckCircle,  iconBg: '#d8f3dc', iconColor: '#2d6a4f' },
  rejected: { bg: '#fff5f5', border: '#f0d0d0', icon: XCircle,      iconBg: '#ffe0e0', iconColor: '#c0392b' },
};

// ── Section card ──────────────────────────────────────────────────────────────
const SectionCard = ({ title, iconEl, accentColor = '#2d6a4f', accentBg = '#d8f3dc', children }) => (
  <div className="cd-section">
    <div className="cd-section-head" style={{ borderBottomColor: '#ede8e0' }}>
      <div className="cd-section-icon" style={{ background: accentBg }}>
        {React.cloneElement(iconEl, { size: 16, color: accentColor })}
      </div>
      <span className="cd-section-title">{title}</span>
    </div>
    <div className="cd-section-body">{children}</div>
  </div>
);

const InfoRow = ({ label, value, valueColor }) => (
  <div className="cd-info-row">
    <span className="cd-info-label">{label}</span>
    <span className="cd-info-val" style={valueColor ? { color: valueColor } : {}}>{value}</span>
  </div>
);

const PaymentRow = ({ label, amount, status, t }) => (
  <div className="cd-pay-row">
    <div>
      <p className="cd-pay-label">{label}</p>
      <p className="cd-pay-amount">₹{amount ? formatPrice(amount) : '—'}</p>
    </div>
    {status === 'paid'
      ? <span className="cd-pay-badge" style={{ background: '#d8f3dc', color: '#2d6a4f' }}>
          <CheckCircle size={11} /> {t('contractDetail.payment.paid')}
        </span>
      : <span className="cd-pay-badge" style={{ background: '#fdf3e0', color: '#8a6000' }}>
          {t('contractDetail.payment.pending')}
        </span>
    }
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const ContractDetail = () => {
  const { contractId } = useParams();
  const navigate       = useNavigate();
  const routeLocation  = useLocation();
  const { t }          = useTranslation();

  const [contract,      setContract]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [applying,      setApplying]      = useState(false);
  const [myApplication, setMyApplication] = useState(routeLocation.state?.myApplication || null);
  const [showApplyForm,   setShowApplyForm]   = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [appData,     setAppData]     = useState({ proposedQuantity: '', farmerMessage: '' });
  const [disputeData, setDisputeData] = useState({ subject: '', message: '', priority: 'medium' });

  useEffect(() => { loadAll(); }, [contractId]);

  const loadAll = async () => {
    try {
      const [contractData, applicationsData] = await Promise.all([
        contractService.getContractById(contractId),
        contractService.getFarmerApplications(),
      ]);
      setContract(contractData.contract);
      const apps  = applicationsData.applications || [];
      const myApp = apps.find((a) => {
        const cid = a.contract?._id || a.contract;
        return cid?.toString() === contractId?.toString();
      });
      if (myApp) setMyApplication(myApp);
    } catch (err) {
      console.error(err);
      toast.error(t('contractDetail.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await contractService.applyToContract(contractId, appData);
      toast.success(t('contractDetail.applySuccess'));
      setShowApplyForm(false);
      setMyApplication({ status: 'pending', proposedQuantity: appData.proposedQuantity, companyRemarks: '' });
      setAppData({ proposedQuantity: '', farmerMessage: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || t('contractDetail.applyError'));
    } finally {
      setApplying(false);
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    try {
      await disputeService.raiseDispute({ contractId, ...disputeData });
      toast.success(t('contractDetail.disputeSuccess'));
      setShowDisputeForm(false);
      setDisputeData({ subject: '', message: '', priority: 'medium' });
    } catch (err) {
      toast.error(err.response?.data?.message || t('contractDetail.disputeError'));
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!contract) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9a9080', fontFamily: 'DM Sans, sans-serif' }}>{t('contractDetail.notFound')}</p>
    </div>
  );

  const hasApplied      = !!myApplication;
  const isAccepted      = myApplication?.status === 'accepted';
  const isRejected      = myApplication?.status === 'rejected';
  const isPending       = myApplication?.status === 'pending';
  const canApply        = !hasApplied && contract.status === 'pending';
  const canRaiseDispute = isAccepted && ['active', 'in_progress'].includes(contract.status);
  const hasLegalDoc     = !!(contract.legalContractFile?.filename || contract.legalContract);
  const hasPayment      = !!(contract.paymentDetails?.advancePayment?.amount || contract.paymentDetails?.finalPayment?.amount);
  const hasDeliveries   = (contract.deliveryStatus?.deliveries?.length || 0) > 0;
  const appBanner       = myApplication ? (APP_BANNER[myApplication.status] || APP_BANNER.pending) : null;
  const AppBannerIcon   = appBanner?.icon;
  const legalVer        = contract.legalContractVerification;
  const statusMeta      = STATUS_META[contract.status] || STATUS_META.pending;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cd-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 96px;
        }

        /* ── STICKY HEADER ── */
        .cd-header {
          position: sticky; top: 0; z-index: 40;
          background: #1c3a1c; overflow: hidden;
        }
        .cd-header-grain {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .cd-header-inner {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 12px;
          padding: 16px 18px;
        }
        .cd-back-btn {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8; transition: background 0.15s;
        }
        .cd-back-btn:hover { background: rgba(255,255,255,0.18); }
        .cd-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #f0ede8;
          text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 2px;
        }
        .cd-header-company { font-size: 11px; color: rgba(240,237,232,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cd-status-pill {
          flex-shrink: 0; font-size: 10px; font-weight: 700;
          padding: 4px 10px; border-radius: 99px; text-transform: capitalize;
        }
        .cd-status-bar { height: 4px; width: 100%; }

        /* ── BODY ── */
        .cd-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

        /* application banner */
        .cd-app-banner {
          border-radius: 16px; border: 1.5px solid transparent;
          padding: 14px; display: flex; align-items: flex-start; gap: 12px;
        }
        .cd-app-banner-icon {
          width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cd-app-banner-title { font-size: 13px; font-weight: 700; color: #1c2e1c; margin-bottom: 4px; }
        .cd-app-banner-qty   { font-size: 11px; color: #6a6055; margin-bottom: 6px; }
        .cd-app-remarks {
          background: rgba(255,255,255,0.7); border-radius: 10px;
          padding: 8px 12px; border: 1px solid rgba(255,255,255,0.5);
        }
        .cd-app-remarks-label { font-size: 10px; font-weight: 700; color: #6a6055; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px; }
        .cd-app-remarks-text  { font-size: 11px; color: #4a4035; font-style: italic; }

        /* section card */
        .cd-section {
          background: #fff; border-radius: 18px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .cd-section-head {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 16px; background: #fafaf8;
          border-bottom: 1px solid #ede8e0;
        }
        .cd-section-icon {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cd-section-title { font-size: 14px; font-weight: 700; color: #1c2e1c; }
        .cd-section-body  { padding: 14px; }

        /* info rows */
        .cd-info-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid #f5f0ea; gap: 12px;
        }
        .cd-info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .cd-info-label { font-size: 11px; color: #9a9080; flex-shrink: 0; }
        .cd-info-val   { font-size: 13px; font-weight: 700; color: #1c2e1c; text-align: right; }

        /* payment rows */
        .cd-pay-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px; background: #f7f3ee; border-radius: 12px; margin-bottom: 8px;
        }
        .cd-pay-row:last-of-type { margin-bottom: 0; }
        .cd-pay-label  { font-size: 11px; color: #9a9080; margin-bottom: 3px; }
        .cd-pay-amount { font-size: 15px; font-weight: 700; color: #1c2e1c; }
        .cd-pay-badge  {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 99px;
        }
        .cd-pay-total {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 12px; margin-top: 4px; border-top: 2px solid #ede8e0;
        }
        .cd-pay-total-label { font-size: 13px; font-weight: 700; color: #1c2e1c; }
        .cd-pay-total-val   { font-size: 18px; font-weight: 700; color: #2d6a4f; }

        /* delivery progress */
        .cd-delivery-track {
          height: 10px; background: #f0ede8; border-radius: 99px; overflow: hidden; margin: 8px 0;
        }
        .cd-delivery-bar {
          height: 100%; border-radius: 99px; background: linear-gradient(90deg, #f6b73c, #e67e22);
          transition: width 0.5s ease;
        }
        .cd-delivery-item {
          display: flex; align-items: center; justify-content: space-between;
          background: #f7f3ee; border-radius: 11px; padding: 10px 12px; margin-top: 6px;
        }
        .cd-delivery-qty  { font-size: 12px; font-weight: 700; color: #1c2e1c; }
        .cd-delivery-note { font-size: 11px; color: #9a9080; margin-top: 2px; }
        .cd-delivery-date { font-size: 11px; color: #b0a898; }

        /* legal verification badge */
        .cd-legal-ver {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 12px; border-radius: 11px; border: 1px solid transparent;
          font-size: 11px; font-weight: 700; margin-bottom: 10px;
        }
        .cd-legal-ver-date { margin-left: auto; font-weight: 400; opacity: 0.7; }
        .cd-legal-remarks  { font-size: 11px; color: #9a9080; font-style: italic; margin-top: 8px; }

        /* legal PDF link */
        .cd-pdf-link {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; background: #1c3a1c; color: #f0ede8;
          padding: 12px 14px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; text-decoration: none;
          transition: background 0.15s;
          box-shadow: 0 3px 10px rgba(28,58,28,0.2);
        }
        .cd-pdf-link:hover { background: #2a5a2a; }
        .cd-pdf-link-left  { display: flex; align-items: center; gap: 8px; }

        /* action buttons */
        .cd-btn-apply {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px; border-radius: 16px; border: none;
          background: #1c3a1c; color: #f0ede8;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
          box-shadow: 0 4px 14px rgba(28,58,28,0.25);
        }
        .cd-btn-apply:hover { background: #2a5a2a; }

        .cd-already-applied {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px; border-radius: 16px;
          background: #eef4fb; border: 1.5px solid #c2d6f0;
          color: #1d4e89; font-size: 13px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }

        .cd-btn-dispute {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px; border-radius: 16px; border: none;
          background: #fff5f5; border: 1.5px solid #f0d0d0;
          color: #c0392b; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .cd-btn-dispute:hover { background: #ffe8e8; border-color: #c0392b; }

        /* apply form card */
        .cd-form-card {
          background: #fff; border-radius: 18px; padding: 18px;
          border: 1px solid #e8e2da; box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .cd-form-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 15px; font-weight: 700; color: #1c2e1c;
          margin-bottom: 16px;
        }
        .cd-form-label {
          font-size: 11px; font-weight: 700; color: #6a6055;
          text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 5px;
        }
        .cd-form-input, .cd-form-textarea, .cd-form-select {
          width: 100%; background: #fff;
          border: 1.5px solid #ddd5c8; border-radius: 10px;
          padding: 10px 12px; font-size: 13px; font-weight: 500; color: #1c2e1c;
          font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.15s;
        }
        .cd-form-input:focus, .cd-form-textarea:focus, .cd-form-select:focus { border-color: #2d6a4f; }
        .cd-form-textarea { resize: none; }
        .cd-form-row { display: flex; gap: 10px; margin-top: 14px; }
        .cd-form-gap { margin-bottom: 12px; }
        .cd-btn-cancel {
          flex: 1; padding: 11px; border-radius: 11px;
          background: #f7f3ee; border: 1.5px solid #e8e2da;
          color: #6a6055; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .cd-btn-cancel:hover { background: #ede8e0; }
        .cd-btn-submit {
          flex: 1; padding: 11px; border-radius: 11px; border: none;
          background: #1c3a1c; color: #f0ede8;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
          box-shadow: 0 3px 10px rgba(28,58,28,0.2);
        }
        .cd-btn-submit:hover:not(:disabled) { background: #2a5a2a; }
        .cd-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .cd-btn-submit-danger {
          background: #c0392b;
          box-shadow: 0 3px 10px rgba(192,57,43,0.2);
        }
        .cd-btn-submit-danger:hover:not(:disabled) { background: #a93226; }

        /* dispute modal overlay */
        .cd-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex; align-items: flex-end;
          justify-content: center; z-index: 50; padding: 16px;
        }
        @media (min-width: 640px) { .cd-overlay { align-items: center; } }
        .cd-modal {
          background: #fff; border-radius: 20px;
          width: 100%; max-width: 440px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        }
        .cd-modal-head {
          padding: 16px 18px; border-radius: 20px 20px 0 0;
          background: #c0392b; display: flex; flex-direction: column; gap: 3px;
        }
        .cd-modal-head-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 16px; font-weight: 700; color: #fff;
          font-family: 'Playfair Display', serif;
        }
        .cd-modal-head-sub { font-size: 11px; color: rgba(255,255,255,0.65); }
        .cd-modal-body { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
      `}</style>

      <div className="cd-root">

        {/* ── STICKY HEADER ── */}
        <header className="cd-header">
          <div className="cd-header-grain" />
          <div className="cd-header-inner">
            <button className="cd-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cd-header-title">{contract.cropType}</div>
              <div className="cd-header-company">{contract.company?.companyDetails?.companyName}</div>
            </div>
            <span className="cd-status-pill" style={{ background: statusMeta.bg, color: statusMeta.text }}>
              {t(`contract.status.${contract.status}`)}
            </span>
          </div>
          <div className="cd-status-bar" style={{ background: statusMeta.bar }} />
        </header>

        <div className="cd-body">

          {/* ── APPLICATION BANNER ── */}
          {hasApplied && appBanner && AppBannerIcon && (
            <div className="cd-app-banner" style={{ background: appBanner.bg, borderColor: appBanner.border }}>
              <div className="cd-app-banner-icon" style={{ background: appBanner.iconBg }}>
                <AppBannerIcon size={18} color={appBanner.iconColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cd-app-banner-title">
                  {t(`applications.statusLabel.${myApplication.status}`)}
                </div>
                {myApplication.proposedQuantity && (
                  <div className="cd-app-banner-qty">
                    {t('contractDetail.proposedQty')}: <strong>{myApplication.proposedQuantity} {contract.unit}</strong>
                  </div>
                )}
                {myApplication.companyRemarks && (
                  <div className="cd-app-remarks">
                    <div className="cd-app-remarks-label">{t('applications.companyRemarks')}</div>
                    <div className="cd-app-remarks-text">"{myApplication.companyRemarks}"</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CORE INFO ── */}
          <SectionCard title={t('contractDetail.title')} iconEl={<Package />} accentColor="#b87a00" accentBg="#fdf3e0">
            <InfoRow label={t('contractDetail.quantity')}  value={`${contract.quantity} ${contract.unit}`} />
            <InfoRow label={t('contractDetail.price')}     value={`₹${formatPrice(contract.agreedPrice)} / ${contract.unit}`} valueColor="#2d6a4f" />
            <InfoRow label={t('contractDetail.location')}  value={`${contract.location.district}, ${contract.location.state}`} />
            <InfoRow label={t('contractDetail.duration')}  value={`${formatDate(contract.duration?.startDate)} → ${formatDate(contract.duration?.endDate)}`} />
            {contract.applicationsCount > 0 && (
              <InfoRow label={t('contract.applications')} value={String(contract.applicationsCount)} />
            )}
          </SectionCard>

          {/* ── COMPANY ── */}
          <SectionCard title={t('contractDetail.companyInfo')} iconEl={<Building />} accentColor="#1d4e89" accentBg="#dbeafe">
            <InfoRow label={t('common.name')} value={contract.company?.companyDetails?.companyName || t('common.notAvailable')} />
            {contract.company?.email && <InfoRow label="Email" value={contract.company.email} />}
            {contract.company?.phone && <InfoRow label={t('profile.phone')} value={contract.company.phone} />}
          </SectionCard>

          {/* ── DESCRIPTION ── */}
          {contract.description && (
            <SectionCard title={t('contractDetail.description')} iconEl={<MessageSquare />} accentColor="#5b21b6" accentBg="#ede9fe">
              <p style={{ fontSize: 13, color: '#4a4035', lineHeight: 1.6 }}>{contract.description}</p>
            </SectionCard>
          )}

          {/* ── REQUIREMENTS ── */}
          {contract.requirements && (
            <SectionCard title={t('contractDetail.requirements')} iconEl={<FileText />} accentColor="#5b21b6" accentBg="#ede9fe">
              <p style={{ fontSize: 13, color: '#4a4035', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{contract.requirements}</p>
            </SectionCard>
          )}

          {/* ── TERMS ── */}
          {contract.terms && (
            <SectionCard title={t('contract.terms')} iconEl={<FileText />} accentColor="#6a6055" accentBg="#f0ede8">
              <p style={{ fontSize: 13, color: '#4a4035', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{contract.terms}</p>
            </SectionCard>
          )}

          {/* ── LEGAL DOC ── */}
          {hasLegalDoc && (
            <SectionCard title={t('contractDetail.legalDoc')} iconEl={<ShieldCheck />} accentColor="#2d6a4f" accentBg="#d8f3dc">
              {legalVer && (
                <div className="cd-legal-ver" style={{
                  background: legalVer.status === 'verified' ? '#f0f7f2' : legalVer.status === 'rejected' ? '#fff5f5' : '#fdf3e0',
                  borderColor: legalVer.status === 'verified' ? '#c8dcc8' : legalVer.status === 'rejected' ? '#f0d0d0' : '#f0d8a8',
                  color: legalVer.status === 'verified' ? '#2d6a4f' : legalVer.status === 'rejected' ? '#c0392b' : '#8a6000',
                }}>
                  {legalVer.status === 'verified' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  {t(`contractDetail.verification.${legalVer.status}`)}
                  {legalVer.verifiedAt && <span className="cd-legal-ver-date">{formatDate(legalVer.verifiedAt)}</span>}
                </div>
              )}
              <a
                href={getFileUrl(contract.legalContractFile?.path || contract.legalContract)}
                target="_blank" rel="noopener noreferrer"
                className="cd-pdf-link"
              >
                <span className="cd-pdf-link-left"><FileText size={15} />{t('contractDetail.viewPdf')}</span>
                <ExternalLink size={14} />
              </a>
              {legalVer?.remarks && <p className="cd-legal-remarks">{legalVer.remarks}</p>}
            </SectionCard>
          )}

          {/* ── PAYMENT ── */}
          {hasPayment && isAccepted && (
            <SectionCard title={t('contractDetail.paymentInfo')} iconEl={<CreditCard />} accentColor="#2d6a4f" accentBg="#d8f3dc">
              <PaymentRow label={t('contractDetail.advancePayment')} amount={contract.paymentDetails.advancePayment?.amount} status={contract.paymentDetails.advancePayment?.status} t={t} />
              <PaymentRow label={t('contractDetail.finalPayment')}   amount={contract.paymentDetails.finalPayment?.amount}   status={contract.paymentDetails.finalPayment?.status}   t={t} />
              <div className="cd-pay-total">
                <span className="cd-pay-total-label">{t('contractDetail.totalPaid')}</span>
                <span className="cd-pay-total-val">₹{formatPrice(contract.paymentDetails.totalPaid || 0)}</span>
              </div>
            </SectionCard>
          )}

          {/* ── DELIVERY ── */}
          {isAccepted && contract.deliveryStatus && (
            <SectionCard title={t('contractDetail.delivery')} iconEl={<Truck />} accentColor="#b87a00" accentBg="#fdf3e0">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9a9080', marginBottom: 4 }}>
                <span>{t('contractDetail.quantityDelivered')}</span>
                <strong style={{ color: '#1c2e1c' }}>
                  {contract.deliveryStatus.quantityDelivered || 0} / {contract.quantity} {contract.unit}
                </strong>
              </div>
              <div className="cd-delivery-track">
                <div className="cd-delivery-bar" style={{
                  width: `${Math.min(100, ((contract.deliveryStatus.quantityDelivered || 0) / contract.quantity) * 100)}%`
                }} />
              </div>
              <p style={{ textAlign: 'right', fontSize: 11, color: '#9a9080', marginBottom: 8 }}>
                {Math.round(((contract.deliveryStatus.quantityDelivered || 0) / contract.quantity) * 100)}%
              </p>
              {hasDeliveries && contract.deliveryStatus.deliveries.map((d, i) => (
                <div key={i} className="cd-delivery-item">
                  <div>
                    <div className="cd-delivery-qty">{d.quantity} {contract.unit}</div>
                    {d.notes && <div className="cd-delivery-note">{d.notes}</div>}
                  </div>
                  <span className="cd-delivery-date">{formatDate(d.date)}</span>
                </div>
              ))}
            </SectionCard>
          )}

          {/* ── APPLY BUTTON ── */}
          {canApply && !showApplyForm && (
            <button className="cd-btn-apply" onClick={() => setShowApplyForm(true)}>
              <CheckCircle size={18} />
              {t('contractDetail.apply')}
            </button>
          )}

          {/* ── ALREADY APPLIED ── */}
          {hasApplied && !isAccepted && !isRejected && contract.status === 'approved' && (
            <div className="cd-already-applied">
              <Clock size={16} />
              {t('contractDetail.alreadyApplied')}
            </div>
          )}

          {/* ── APPLY FORM ── */}
          {canApply && showApplyForm && (
            <form className="cd-form-card" onSubmit={handleApply}>
              <div className="cd-form-title">
                <CheckCircle size={17} color="#2d6a4f" />
                {t('contractDetail.apply')}
              </div>
              <div className="cd-form-gap">
                <div className="cd-form-label">{t('contractDetail.proposedQty')} ({contract.unit}) *</div>
                <input type="number" required min="1" max={contract.quantity}
                  className="cd-form-input"
                  value={appData.proposedQuantity}
                  placeholder={`Max: ${contract.quantity} ${contract.unit}`}
                  onChange={(e) => setAppData({ ...appData, proposedQuantity: e.target.value })} />
              </div>
              <div className="cd-form-gap">
                <div className="cd-form-label">{t('contractDetail.messageToCompany')}</div>
                <textarea rows="3" className="cd-form-textarea"
                  value={appData.farmerMessage}
                  placeholder={t('contractDetail.messagePlaceholder')}
                  onChange={(e) => setAppData({ ...appData, farmerMessage: e.target.value })} />
              </div>
              <div className="cd-form-row">
                <button type="button" className="cd-btn-cancel" onClick={() => setShowApplyForm(false)}>{t('common.cancel')}</button>
                <button type="submit" className="cd-btn-submit" disabled={applying}>
                  {applying ? t('common.submitting') : t('contractDetail.submitApplication')}
                </button>
              </div>
            </form>
          )}

          {/* ── RAISE DISPUTE BUTTON ── */}
          {canRaiseDispute && !showDisputeForm && (
            <button className="cd-btn-dispute" onClick={() => setShowDisputeForm(true)}>
              <AlertTriangle size={17} />
              {t('contractDetail.raiseDispute')}
            </button>
          )}
        </div>

        {/* ── DISPUTE MODAL ── */}
        {showDisputeForm && (
          <div className="cd-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDisputeForm(false); }}>
            <div className="cd-modal">
              <div className="cd-modal-head">
                <div className="cd-modal-head-title">
                  <AlertTriangle size={18} />
                  {t('contractDetail.raiseDispute')}
                </div>
                <div className="cd-modal-head-sub">{t('contractDetail.disputeSubtitle')}</div>
              </div>
              <form className="cd-modal-body" onSubmit={handleRaiseDispute}>
                <div>
                  <div className="cd-form-label">{t('contractDetail.subject')} *</div>
                  <input type="text" required className="cd-form-input"
                    value={disputeData.subject}
                    placeholder={t('contractDetail.subject')}
                    onChange={(e) => setDisputeData({ ...disputeData, subject: e.target.value })} />
                </div>
                <div>
                  <div className="cd-form-label">{t('contractDetail.priority')}</div>
                  <select className="cd-form-select" value={disputeData.priority}
                    onChange={(e) => setDisputeData({ ...disputeData, priority: e.target.value })}>
                    {['low','medium','high','critical'].map((p) => (
                      <option key={p} value={p}>{t(`contractDetail.priority.${p}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="cd-form-label">{t('contractDetail.message')} *</div>
                  <textarea required rows="4" className="cd-form-textarea"
                    value={disputeData.message}
                    placeholder={t('contractDetail.disputePlaceholder')}
                    onChange={(e) => setDisputeData({ ...disputeData, message: e.target.value })} />
                </div>
                <div className="cd-form-row" style={{ marginTop: 0 }}>
                  <button type="button" className="cd-btn-cancel" onClick={() => setShowDisputeForm(false)}>{t('common.cancel')}</button>
                  <button type="submit" className="cd-btn-submit cd-btn-submit-danger">{t('contractDetail.submitDispute')}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </>
  );
};

export default ContractDetail;