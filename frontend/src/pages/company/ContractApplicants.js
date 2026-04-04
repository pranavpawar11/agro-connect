import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, IndianRupee, Package, TrendingUp, CheckCircle,
  Truck, MapPin, FileText, CreditCard, Clock, XCircle,
  PlayCircle, StopCircle, Trash2, Users, ShieldCheck, ShieldAlert,
  ExternalLink, ChevronDown,
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import disputeService from '../../services/disputeService';
import { formatDate, formatPrice, getFileUrl } from '../../utils/helpers';
import { toast } from 'react-toastify';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { bar: 'from-yellow-400 to-warning-500',   badge: 'bg-yellow-100 text-yellow-800',   label: 'Pending Approval'  },
  approved:    { bar: 'from-blue-500 to-cyan-500',        badge: 'bg-blue-100 text-blue-800',       label: 'Open for Applications' },
  active:      { bar: 'from-success-500 to-emerald-500',  badge: 'bg-success-100 text-success-800', label: 'Active'            },
  in_progress: { bar: 'from-purple-500 to-violet-600',    badge: 'bg-purple-100 text-purple-800',   label: 'In Progress'       },
  completed:   { bar: 'from-neutral-400 to-neutral-500',  badge: 'bg-neutral-100 text-neutral-700', label: 'Completed'         },
  cancelled:   { bar: 'from-danger-500 to-danger-600',    badge: 'bg-danger-100 text-danger-800',   label: 'Cancelled'         },
};

// ─────────────────────────────────────────────────────────────────────────────
// VALID STATUS TRANSITIONS FOR COMPANY
// Company can move: approved→active, active→in_progress, in_progress→completed
// Company can cancel from any non-terminal state
// ─────────────────────────────────────────────────────────────────────────────
const TRANSITIONS = {
  // current status → allowed next actions
  approved:    [{ to: 'active',      label: 'Mark Active',      color: 'from-success-500 to-success-600', icon: PlayCircle  }],
  active:      [{ to: 'in_progress', label: 'Mark In Progress', color: 'from-purple-500 to-violet-600',   icon: TrendingUp  }],
  in_progress: [{ to: 'completed',   label: 'Mark Completed',   color: 'from-neutral-500 to-neutral-600', icon: CheckCircle }],
};

// ── Small reusable pieces ─────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, iconColor = 'from-primary-500 to-primary-700', children, action }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/80">
      <div className="flex items-center gap-3">
        <div className={`bg-gradient-to-br ${iconColor} p-2 rounded-xl`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-bold text-neutral-800 text-sm">{title}</h3>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const InfoRow = ({ label, value, valueClass = 'text-neutral-900' }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-neutral-50 last:border-0 gap-4">
    <span className="text-xs text-neutral-500 shrink-0">{label}</span>
    <span className={`text-sm font-bold ${valueClass} text-right`}>{value}</span>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <h3 className="font-bold text-neutral-900 text-base">{title}</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
          <XCircle className="w-5 h-5 text-neutral-400" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const CompanyContractDetails = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();

  const [contract,  setContract]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  // Modal visibility
  const [modal, setModal] = useState(null); // 'payment'|'delivery'|'cancel'|'status'

  const [paymentData,  setPaymentData]  = useState({ paymentType: 'advance', amount: '', status: 'paid' });
  const [deliveryData, setDeliveryData] = useState({ quantity: '', notes: '' });
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => { loadContract(); }, [contractId]);

  const loadContract = async () => {
    try {
      const data = await contractService.getContractById(contractId);
      setContract(data.contract);
    } catch (err) {
      console.error(err);
      toast.error('Error loading contract');
    } finally {
      setLoading(false);
    }
  };

  // ── Status transitions ──────────────────────────────────────────────────
  const handleStatusTransition = async (toStatus) => {
    const confirmMap = {
      active:      'Mark contract as Active? The selected farmer will see this update.',
      in_progress: 'Mark as In Progress? This indicates deliveries have started.',
      completed:   'Mark as Completed? This action cannot be undone.',
    };
    if (!window.confirm(confirmMap[toStatus] || `Move to ${toStatus}?`)) return;
    try {
      if (toStatus === 'in_progress') await contractService.markAsInProgress(contractId);
      else if (toStatus === 'completed') await contractService.markAsCompleted(contractId);
      else await contractService.updateContractStatus(contractId, { status: toStatus });
      toast.success(`Contract moved to: ${toStatus.replace('_',' ')}`);
      loadContract();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    try {
      await contractService.cancelContract(contractId, cancelReason);
      toast.success('Contract cancelled');
      setModal(null);
      loadContract();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling');
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      await contractService.updatePayment(contractId, paymentData);
      toast.success('Payment updated!');
      setModal(null);
      loadContract();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating payment');
    }
  };

  const handleAddDelivery = async (e) => {
    e.preventDefault();
    try {
      await contractService.addDelivery(contractId, deliveryData);
      toast.success('Delivery recorded!');
      setModal(null);
      setDeliveryData({ quantity: '', notes: '' });
      loadContract();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error recording delivery');
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!contract) return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-neutral-500">Contract not found</p>
    </div>
  );

  const cfg             = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending;
  const totalValue      = contract.quantity * contract.agreedPrice;
  const delivered       = contract.deliveryStatus?.quantityDelivered || 0;
  const deliveryPct     = contract.quantity ? Math.min(100, (delivered / contract.quantity) * 100) : 0;
  const remaining       = contract.quantity - delivered;
  const isClosed        = ['completed','cancelled'].includes(contract.status);
  const availTransitions = TRANSITIONS[contract.status] || [];
  const legalVer        = contract.legalContractVerification;
  const hasLegal        = !!contract.legalContractFile?.filename;

  return (
    <div className="flex h-screen pt-6 bg-neutral-50">
      <Sidebar role="company" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6 space-y-6">

          {/* Back */}
          <button onClick={() => navigate('/company/contracts')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-semibold text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Contracts
          </button>

          {/* ── Header card ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className={`h-2 w-full bg-gradient-to-r ${cfg.bar}`} />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900 capitalize">{contract.cropType} Contract</h1>
                  <p className="text-neutral-500 text-sm mt-0.5">{contract.description}</p>
                </div>
                <span className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Value',       val: `${formatPrice(totalValue)}`,         color: 'text-primary-700', bg: 'bg-primary-50'  },
                  { label: 'Quantity',          val: `${contract.quantity} ${contract.unit}`, color: 'text-neutral-800', bg: 'bg-neutral-50'  },
                  { label: `Price/${contract.unit}`, val: `${formatPrice(contract.agreedPrice)}`, color: 'text-success-700', bg: 'bg-success-50' },
                  { label: 'Applications',      val: String(contract.applicationsCount || 0), color: 'text-blue-700',    bg: 'bg-blue-50'     },
                ].map(({ label, val, color, bg }) => (
                  <div key={label} className={`${bg} rounded-2xl p-4`}>
                    <p className="text-[10px] text-neutral-500 font-medium mb-1">{label}</p>
                    <p className={`text-xl font-bold ${color}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* ── Status transition buttons ─────────────────────── */}
              {!isClosed && (
                <div className="flex gap-3 mt-5 flex-wrap">
                  {/* Forward transitions */}
                  {availTransitions.map(({ to, label, color, icon: Icon }) => (
                    <button key={to} onClick={() => handleStatusTransition(to)}
                      className={`flex items-center gap-2 bg-gradient-to-r ${color} text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all`}>
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}

                  {/* Update payment */}
                  {['active','in_progress'].includes(contract.status) && (
                    <button onClick={() => setModal('payment')}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors">
                      <CreditCard className="w-4 h-4" />
                      Update Payment
                    </button>
                  )}

                  {/* Record delivery */}
                  {['active','in_progress'].includes(contract.status) && (
                    <button onClick={() => setModal('delivery')}
                      className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors">
                      <Truck className="w-4 h-4" />
                      Record Delivery
                    </button>
                  )}

                  {/* View applicants */}
                  {['approved','active'].includes(contract.status) && (
                    <button onClick={() => navigate(`/company/contracts/${contractId}/applicants`)}
                      className="flex items-center gap-2 bg-primary-50 text-primary-700 hover:bg-primary-100 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors">
                      <Users className="w-4 h-4" />
                      Applicants
                    </button>
                  )}

                  {/* Cancel — always available on non-closed contracts */}
                  <button onClick={() => setModal('cancel')}
                    className="flex items-center gap-2 ml-auto bg-danger-50 text-danger-700 hover:bg-danger-100 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border border-danger-200">
                    <Trash2 className="w-4 h-4" />
                    Cancel Contract
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Payment ─────────────────────────────────────────── */}
            <SectionCard title="Payment Details" icon={CreditCard} iconColor="from-success-500 to-success-700">
              <div className="space-y-3">
                {[
                  { label: 'Advance Payment', key: 'advancePayment' },
                  { label: 'Final Payment',   key: 'finalPayment'   },
                ].map(({ label, key }) => {
                  const p = contract.paymentDetails?.[key];
                  return (
                    <div key={key} className="bg-neutral-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
                        <p className="text-lg font-bold text-neutral-900">{formatPrice(p?.amount || 0)}</p>
                        {p?.paidDate && <p className="text-[10px] text-neutral-400 mt-0.5">Paid {formatDate(p.paidDate)}</p>}
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        p?.status === 'paid' ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
                      }`}>
                        {p?.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
                <div className="bg-success-50 rounded-xl p-4 border-l-4 border-success-500">
                  <p className="text-xs text-success-600 font-medium">Total Paid</p>
                  <p className="text-2xl font-bold text-success-800">{formatPrice(contract.paymentDetails?.totalPaid || 0)}</p>
                  <p className="text-xs text-success-600 mt-0.5">of {formatPrice(totalValue)} total</p>
                </div>
              </div>
            </SectionCard>

            {/* ── Delivery ─────────────────────────────────────────── */}
            <SectionCard title="Delivery Status" icon={Truck} iconColor="from-amber-500 to-orange-600">
              <div>
                <div className="flex justify-between text-xs text-neutral-500 mb-2">
                  <span>Progress</span>
                  <span className="font-bold text-neutral-800">
                    {delivered}/{contract.quantity} {contract.unit} ({deliveryPct.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden mb-4">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${deliveryPct}%` }}
                  />
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(contract.deliveryStatus?.deliveries || []).length > 0
                    ? contract.deliveryStatus.deliveries.map((d, i) => (
                      <div key={i} className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2.5">
                        <div>
                          <p className="text-sm font-bold text-neutral-800">{d.quantity} {contract.unit}</p>
                          {d.notes && <p className="text-xs text-neutral-500 mt-0.5">{d.notes}</p>}
                        </div>
                        <p className="text-xs text-neutral-400">{formatDate(d.date)}</p>
                      </div>
                    ))
                    : <p className="text-sm text-neutral-400 text-center py-4">No deliveries recorded yet</p>
                  }
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Legal contract ───────────────────────────────────── */}
          {hasLegal && (
            <SectionCard title="Legal Contract" icon={ShieldCheck} iconColor="from-green-500 to-emerald-700">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  {legalVer && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border mb-3 ${
                      legalVer.status === 'verified' ? 'bg-success-50 text-success-700 border-success-200' :
                      legalVer.status === 'rejected' ? 'bg-danger-50 text-danger-700 border-danger-200' :
                      'bg-warning-50 text-warning-700 border-warning-200'
                    }`}>
                      {legalVer.status === 'verified' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      {legalVer.status === 'verified' ? 'Verified by Admin' :
                       legalVer.status === 'rejected' ? 'Rejected — Re-upload required' : 'Pending Verification'}
                    </span>
                  )}
                  <p className="text-xs text-neutral-500">Uploaded {formatDate(contract.legalContractFile?.uploadedAt)}</p>
                </div>
                <a href={getFileUrl(contract.legalContractFile?.path)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all">
                  <FileText className="w-4 h-4" />
                  View PDF
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </SectionCard>
          )}

          {/* ── Location & Terms ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Location" icon={MapPin} iconColor="from-blue-500 to-cyan-600">
              <InfoRow label="District" value={contract.location?.district} />
              <InfoRow label="State"    value={contract.location?.state} />
              {contract.location?.pincode && <InfoRow label="Pincode" value={contract.location.pincode} />}
            </SectionCard>

            <SectionCard title="Terms & Conditions" icon={FileText} iconColor="from-violet-500 to-purple-700">
              <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {contract.terms || 'No specific terms defined'}
              </p>
            </SectionCard>
          </div>

        </main>
      </div>

      {/* ══════════════════════════════════════════════════════
          MODALS
          ══════════════════════════════════════════════════════ */}

      {/* Payment modal */}
      {modal === 'payment' && (
        <Modal title="Update Payment" onClose={() => setModal(null)}>
          <form onSubmit={handleUpdatePayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">Payment Type</label>
              <select value={paymentData.paymentType}
                onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 outline-none text-sm font-medium">
                <option value="advance">Advance Payment</option>
                <option value="final">Final Payment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">Amount (₹)</label>
              <input type="number" required min="0" value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 outline-none text-sm font-medium"
                placeholder="Enter amount" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">Status</label>
              <select value={paymentData.status}
                onChange={(e) => setPaymentData({ ...paymentData, status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 outline-none text-sm font-medium">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-bold text-sm shadow-md">
                Update
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delivery modal */}
      {modal === 'delivery' && (
        <Modal title="Record Delivery" onClose={() => setModal(null)}>
          <form onSubmit={handleAddDelivery} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                Quantity ({contract.unit}) — Remaining: {remaining}
              </label>
              <input type="number" required min="0.01" step="0.01"
                max={remaining} value={deliveryData.quantity}
                onChange={(e) => setDeliveryData({ ...deliveryData, quantity: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 outline-none text-sm font-medium"
                placeholder={`Max: ${remaining} ${contract.unit}`} />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">Notes (optional)</label>
              <textarea rows="3" value={deliveryData.notes}
                onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 outline-none text-sm font-medium resize-none"
                placeholder="e.g. Batch 1 — Quality grade A" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md">
                Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Cancel modal */}
      {modal === 'cancel' && (
        <Modal title="Cancel Contract" onClose={() => setModal(null)}>
          <p className="text-sm text-neutral-600 mb-4">
            This will permanently cancel the contract and notify the selected farmer. Please provide a reason.
          </p>
          <form onSubmit={handleCancel} className="space-y-4">
            <textarea required rows="3" value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-danger-200 focus:border-danger-400 outline-none text-sm font-medium resize-none"
              placeholder="Reason for cancellation…" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors">
                Keep Contract
              </button>
              <button type="submit"
                className="flex-1 bg-gradient-to-r from-danger-500 to-danger-600 text-white py-3 rounded-xl font-bold text-sm shadow-md">
                Cancel Contract
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CompanyContractDetails;