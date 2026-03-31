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
const STATUS_BAR = {
  approved:    'from-blue-500 to-cyan-500',
  active:      'from-success-500 to-emerald-500',
  in_progress: 'from-purple-500 to-violet-600',
  completed:   'from-neutral-400 to-neutral-500',
  pending:     'from-warning-500 to-warning-600',
  cancelled:   'from-danger-500 to-danger-600',
};

const APP_STATUS_STYLE = {
  pending:  { border: 'bg-blue-50 border-blue-200',        icon: Clock,       iconBg: 'bg-blue-100',    iconColor: 'text-blue-600'    },
  accepted: { border: 'bg-success-50 border-success-200',  icon: CheckCircle, iconBg: 'bg-success-100', iconColor: 'text-success-600' },
  rejected: { border: 'bg-danger-50 border-danger-200',    icon: XCircle,     iconBg: 'bg-danger-100',  iconColor: 'text-danger-600'  },
};

// ── Reusable sub-components ───────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, iconGradient = 'from-primary-500 to-primary-700', children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
    <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 bg-neutral-50/80">
      <div className={`bg-gradient-to-br ${iconGradient} p-2 rounded-xl shadow-sm shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="font-bold text-neutral-800 text-sm">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const InfoRow = ({ label, value, valueClass = 'text-neutral-900' }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-neutral-50 last:border-0 gap-4">
    <span className="text-xs text-neutral-500 shrink-0">{label}</span>
    <span className={`text-sm font-bold ${valueClass} text-right`}>{value}</span>
  </div>
);

const PaymentRow = ({ label, amount, status, t }) => (
  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
    <div>
      <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
      <p className="font-bold text-neutral-900 flex items-center gap-0.5">
        <IndianRupee className="w-3.5 h-3.5" />
        {amount ? formatPrice(amount) : '—'}
      </p>
    </div>
    {status === 'paid'
      ? <span className="flex items-center gap-1 bg-success-100 text-success-700 text-xs font-bold px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3" />{t('contractDetail.payment.paid')}</span>
      : <span className="bg-warning-100 text-warning-700 text-xs font-bold px-2.5 py-1 rounded-full">{t('contractDetail.payment.pending')}</span>
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
  // myApplication: starts from navigation state, then verified / fetched on mount
  const [myApplication, setMyApplication] = useState(routeLocation.state?.myApplication || null);

  const [showApplyForm,   setShowApplyForm]   = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const [appData,     setAppData]     = useState({ proposedQuantity: '', farmerMessage: '' });
  const [disputeData, setDisputeData] = useState({ subject: '', message: '', priority: 'medium' });

  // ── On mount: load contract AND verify if farmer has already applied ────────
  // We MUST check this from the API, not just from navigation state,
  // because the user could navigate directly to this URL.
  useEffect(() => { loadAll(); }, [contractId]);

  const loadAll = async () => {
    try {
      // Parallel: contract details + farmer's own applications
      const [contractData, applicationsData] = await Promise.all([
        contractService.getContractById(contractId),
        contractService.getFarmerApplications(),
      ]);

      setContract(contractData.contract);

      // Find if there's an application for THIS contract
      const apps = applicationsData.applications || [];
      const myApp = apps.find((a) => {
        const cid = a.contract?._id || a.contract;
        return cid?.toString() === contractId?.toString();
      });
      // myApp overrides anything passed via navigation state (more reliable)
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
      // Optimistically set pending; next full reload will sync
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
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-500">{t('contractDetail.notFound')}</p>
    </div>
  );

  // ── Derived booleans (all depend on myApplication being correctly set) ──────
  const hasApplied      = !!myApplication;
  const isAccepted      = myApplication?.status === 'accepted';
  const isRejected      = myApplication?.status === 'rejected';
  const isPending       = myApplication?.status === 'pending';
  // Farmer can apply ONLY if: not yet applied AND contract is still open for applications
  const canApply        = !hasApplied && contract.status === 'pending';
  // Farmer can raise dispute ONLY if: accepted + contract is active or in_progress
  const canRaiseDispute = isAccepted && ['active', 'in_progress'].includes(contract.status);

  const hasLegalDoc   = !!(contract.legalContractFile?.filename || contract.legalContract);
  const hasPayment    = !!(contract.paymentDetails?.advancePayment?.amount || contract.paymentDetails?.finalPayment?.amount);
  const hasDeliveries = (contract.deliveryStatus?.deliveries?.length || 0) > 0;

  const appStyle  = myApplication ? (APP_STATUS_STYLE[myApplication.status] || APP_STATUS_STYLE.pending) : null;
  const AppIcon   = appStyle?.icon;
  const legalVer  = contract.legalContractVerification;

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">

      {/* ── Sticky header ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-20">
        <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white px-4 py-4 flex items-center gap-3 shadow-lg overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white rounded-full blur-3xl" />
          </div>
          <button onClick={() => navigate(-1)} className="relative p-2 hover:bg-white/20 rounded-xl transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative flex-1 min-w-0">
            <h1 className="text-lg font-bold capitalize truncate">{contract.cropType}</h1>
            <p className="text-primary-100 text-xs truncate">{contract.company?.companyDetails?.companyName}</p>
          </div>
          <span className={`relative shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full text-white bg-gradient-to-r ${STATUS_BAR[contract.status] || STATUS_BAR.pending}`}>
            {t(`contract.status.${contract.status}`)}
          </span>
        </div>
        <div className={`h-1 w-full bg-gradient-to-r ${STATUS_BAR[contract.status] || STATUS_BAR.pending}`} />
      </div>

      <div className="p-4 space-y-4 animate-fade-in">

        {/* ── APPLICATION STATUS BANNER ─────────────────────────────── */}
        {hasApplied && appStyle && AppIcon && (
          <div className={`rounded-2xl p-4 border-2 flex items-start gap-3 ${appStyle.border}`}>
            <div className={`${appStyle.iconBg} p-2.5 rounded-xl shrink-0`}>
              <AppIcon className={`w-5 h-5 ${appStyle.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-neutral-900">
                {t(`applications.statusLabel.${myApplication.status}`)}
              </p>
              {myApplication.proposedQuantity && (
                <p className="text-xs text-neutral-600 mt-0.5">
                  {t('contractDetail.proposedQty')}:&nbsp;
                  <span className="font-bold">{myApplication.proposedQuantity} {contract.unit}</span>
                </p>
              )}
              {myApplication.companyRemarks && (
                <div className="mt-2 bg-white/70 rounded-xl px-3 py-2 border border-white/50">
                  <p className="text-xs font-bold text-neutral-600 mb-0.5">{t('applications.companyRemarks')}:</p>
                  <p className="text-xs text-neutral-700 italic">"{myApplication.companyRemarks}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CORE CONTRACT INFO ────────────────────────────────────── */}
        <SectionCard title={t('contractDetail.title')} icon={Package}>
          <InfoRow label={t('contractDetail.quantity')}  value={`${contract.quantity} ${contract.unit}`} />
          <InfoRow label={t('contractDetail.price')}     value={`₹${formatPrice(contract.agreedPrice)} / ${contract.unit}`} valueClass="text-success-700" />
          <InfoRow label={t('contractDetail.location')}  value={`${contract.location.district}, ${contract.location.state}`} />
          <InfoRow label={t('contractDetail.duration')}
            value={`${formatDate(contract.duration?.startDate)} → ${formatDate(contract.duration?.endDate)}`} />
          {contract.applicationsCount > 0 && (
            <InfoRow label={t('contract.applications')} value={String(contract.applicationsCount)} />
          )}
        </SectionCard>

        {/* ── COMPANY INFO ──────────────────────────────────────────── */}
        <SectionCard title={t('contractDetail.companyInfo')} icon={Building} iconGradient="from-blue-500 to-cyan-600">
          <InfoRow label={t('common.name')} value={contract.company?.companyDetails?.companyName || t('common.notAvailable')} />
          {contract.company?.email && <InfoRow label="Email" value={contract.company.email} />}
          {contract.company?.phone && <InfoRow label={t('profile.phone')} value={contract.company.phone} />}
        </SectionCard>

        {/* ── DESCRIPTION ───────────────────────────────────────────── */}
        {contract.description && (
          <SectionCard title={t('contractDetail.description')} icon={MessageSquare} iconGradient="from-accent-500 to-accent-700">
            <p className="text-sm text-neutral-700 leading-relaxed">{contract.description}</p>
          </SectionCard>
        )}

        {/* ── REQUIREMENTS ──────────────────────────────────────────── */}
        {contract.requirements && (
          <SectionCard title={t('contractDetail.requirements')} icon={FileText} iconGradient="from-purple-500 to-violet-700">
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{contract.requirements}</p>
          </SectionCard>
        )}

        {/* ── TERMS ─────────────────────────────────────────────────── */}
        {contract.terms && (
          <SectionCard title={t('contract.terms')} icon={FileText} iconGradient="from-violet-500 to-purple-700">
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{contract.terms}</p>
          </SectionCard>
        )}

        {/* ── LEGAL CONTRACT — visible to farmer when uploaded ──────── */}
        {hasLegalDoc && (
          <SectionCard title={t('contractDetail.legalDoc')} icon={ShieldCheck} iconGradient="from-green-500 to-emerald-700">
            <div className="space-y-3">
              {legalVer && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border ${
                  legalVer.status === 'verified' ? 'bg-success-50 text-success-700 border-success-200' :
                  legalVer.status === 'rejected' ? 'bg-danger-50 text-danger-700 border-danger-200' :
                  'bg-warning-50 text-warning-700 border-warning-200'
                }`}>
                  {legalVer.status === 'verified' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  {t(`contractDetail.verification.${legalVer.status}`)}
                  {legalVer.verifiedAt && <span className="ml-auto font-normal opacity-70">{formatDate(legalVer.verifiedAt)}</span>}
                </div>
              )}
              <a
                href={getFileUrl(contract.legalContractFile?.path || contract.legalContract)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <span className="flex items-center gap-2"><FileText className="w-4 h-4" />{t('contractDetail.viewPdf')}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              {legalVer?.remarks && <p className="text-xs text-neutral-500 italic">{legalVer.remarks}</p>}
            </div>
          </SectionCard>
        )}

        {/* ── PAYMENT — shown to accepted farmers ───────────────────── */}
        {hasPayment && isAccepted && (
          <SectionCard title={t('contractDetail.paymentInfo')} icon={CreditCard} iconGradient="from-success-500 to-success-700">
            <div className="space-y-2">
              <PaymentRow
                label={t('contractDetail.advancePayment')}
                amount={contract.paymentDetails.advancePayment?.amount}
                status={contract.paymentDetails.advancePayment?.status}
                t={t}
              />
              <PaymentRow
                label={t('contractDetail.finalPayment')}
                amount={contract.paymentDetails.finalPayment?.amount}
                status={contract.paymentDetails.finalPayment?.status}
                t={t}
              />
              <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-neutral-100">
                <span className="font-bold text-neutral-800 text-sm">{t('contractDetail.totalPaid')}</span>
                <span className="font-bold text-success-700 text-lg flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {formatPrice(contract.paymentDetails.totalPaid || 0)}
                </span>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── DELIVERY — shown to accepted farmers ──────────────────── */}
        {isAccepted && contract.deliveryStatus && (
          <SectionCard title={t('contractDetail.delivery')} icon={Truck} iconGradient="from-amber-500 to-orange-600">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                  <span>{t('contractDetail.quantityDelivered')}</span>
                  <span className="font-bold text-neutral-800">
                    {contract.deliveryStatus.quantityDelivered || 0} / {contract.quantity} {contract.unit}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((contract.deliveryStatus.quantityDelivered || 0) / contract.quantity) * 100)}%` }}
                  />
                </div>
                <p className="text-right text-xs text-neutral-500 mt-1">
                  {Math.round(((contract.deliveryStatus.quantityDelivered || 0) / contract.quantity) * 100)}%
                </p>
              </div>
              {hasDeliveries && (
                <div className="space-y-2 mt-1">
                  {contract.deliveryStatus.deliveries.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2.5">
                      <div>
                        <p className="text-xs font-bold text-neutral-800">{d.quantity} {contract.unit}</p>
                        {d.notes && <p className="text-xs text-neutral-500 mt-0.5">{d.notes}</p>}
                      </div>
                      <p className="text-xs text-neutral-400">{formatDate(d.date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ACTION BUTTONS
            ═══════════════════════════════════════════════════════════ */}

        {/* APPLY button — ONLY when farmer has NOT applied AND contract is approved */}
        {canApply && !showApplyForm && (
          <button
            onClick={() => setShowApplyForm(true)}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {t('contractDetail.apply')}
          </button>
        )}

        {/* "Already applied" info — replaces apply button */}
        {hasApplied && !isAccepted && !isRejected && contract.status === 'approved' && (
          <div className="w-full bg-blue-50 border-2 border-blue-200 text-blue-800 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            {t('contractDetail.alreadyApplied')}
          </div>
        )}

        {/* APPLY FORM */}
        {canApply && showApplyForm && (
          <form onSubmit={handleApply} className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-5 space-y-4 animate-scale-in">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary-600" />
              {t('contractDetail.apply')}
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                {t('contractDetail.proposedQty')} ({contract.unit}) *
              </label>
              <input
                type="number"
                required
                min="1"
                max={contract.quantity}
                value={appData.proposedQuantity}
                onChange={(e) => setAppData({ ...appData, proposedQuantity: e.target.value })}
                placeholder={`Max: ${contract.quantity} ${contract.unit}`}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none font-medium text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                {t('contractDetail.messageToCompany')}
              </label>
              <textarea
                rows="3"
                value={appData.farmerMessage}
                onChange={(e) => setAppData({ ...appData, farmerMessage: e.target.value })}
                placeholder={t('contractDetail.messagePlaceholder')}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none font-medium text-sm resize-none transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowApplyForm(false)}
                className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors">
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={applying}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all">
                {applying ? t('common.submitting') : t('contractDetail.submitApplication')}
              </button>
            </div>
          </form>
        )}

        {/* RAISE DISPUTE — ONLY for accepted farmers on active/in_progress contracts */}
        {canRaiseDispute && !showDisputeForm && (
          <button
            onClick={() => setShowDisputeForm(true)}
            className="w-full bg-gradient-to-r from-danger-500 to-danger-600 text-white py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {t('contractDetail.raiseDispute')}
          </button>
        )}
      </div>

      {/* ── DISPUTE MODAL ───────────────────────────────────────────── */}
      {showDisputeForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="bg-gradient-to-r from-danger-500 to-danger-600 px-5 py-4 rounded-t-3xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t('contractDetail.raiseDispute')}
              </h2>
              <p className="text-danger-100 text-xs mt-0.5">{t('contractDetail.disputeSubtitle')}</p>
            </div>

            <form onSubmit={handleRaiseDispute} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">{t('contractDetail.subject')} *</label>
                <input type="text" required value={disputeData.subject}
                  onChange={(e) => setDisputeData({ ...disputeData, subject: e.target.value })}
                  placeholder={t('contractDetail.subject')}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-danger-200 focus:border-danger-500 outline-none text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">{t('contractDetail.priority')}</label>
                <select value={disputeData.priority}
                  onChange={(e) => setDisputeData({ ...disputeData, priority: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-danger-200 focus:border-danger-500 outline-none text-sm font-medium transition-all"
                >
                  {['low','medium','high','critical'].map((p) => (
                    <option key={p} value={p}>{t(`contractDetail.priority.${p}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">{t('contractDetail.message')} *</label>
                <textarea required rows="4" value={disputeData.message}
                  onChange={(e) => setDisputeData({ ...disputeData, message: e.target.value })}
                  placeholder={t('contractDetail.disputePlaceholder')}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-danger-200 focus:border-danger-500 outline-none text-sm font-medium resize-none transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDisputeForm(false)}
                  className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors">
                  {t('common.cancel')}
                </button>
                <button type="submit"
                  className="flex-1 bg-gradient-to-r from-danger-500 to-danger-600 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all">
                  {t('contractDetail.submitDispute')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ContractDetail;