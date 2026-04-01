import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Eye, Users, Plus, TrendingUp, CheckCircle,
  Clock, AlertCircle, XCircle, IndianRupee, Package, ChevronRight,
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import { formatDate, formatPrice } from '../../utils/helpers';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { bar: 'from-warning-400 to-yellow-500',   badge: 'bg-yellow-100 text-yellow-800',   label: 'Pending Admin Approval' },
  approved:    { bar: 'from-blue-500 to-cyan-500',        badge: 'bg-blue-100 text-blue-800',       label: 'Open for Applications'  },
  active:      { bar: 'from-success-500 to-emerald-500',  badge: 'bg-success-100 text-success-800', label: 'Active'                 },
  in_progress: { bar: 'from-purple-500 to-violet-600',    badge: 'bg-purple-100 text-purple-800',   label: 'In Progress'            },
  completed:   { bar: 'from-neutral-400 to-neutral-500',  badge: 'bg-neutral-100 text-neutral-700', label: 'Completed'              },
  cancelled:   { bar: 'from-danger-500 to-danger-600',    badge: 'bg-danger-100 text-danger-800',   label: 'Cancelled'              },
};

const ALL_STATUSES = ['all', 'pending', 'approved', 'active', 'in_progress', 'completed', 'cancelled'];

const STAT_CARDS = [
  { label: 'Total',       key: 'total',       color: 'text-neutral-800', bg: 'bg-neutral-50',  icon: FileText    },
  { label: 'Active',      key: 'active',       color: 'text-success-700', bg: 'bg-success-50',  icon: CheckCircle },
  { label: 'Pending',     key: 'pending',      color: 'text-yellow-700',  bg: 'bg-yellow-50',   icon: Clock       },
  { label: 'Completed',   key: 'completed',    color: 'text-blue-700',    bg: 'bg-blue-50',     icon: TrendingUp  },
];

const MyContracts = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await contractService.getCompanyContracts();
        setContracts(data.contracts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() =>
    filter === 'all' ? contracts : contracts.filter((c) => c.status === filter),
    [contracts, filter]
  );

  const stats = useMemo(() => ({
    total:     contracts.length,
    active:    contracts.filter((c) => ['active','in_progress'].includes(c.status)).length,
    pending:   contracts.filter((c) => c.status === 'pending').length,
    completed: contracts.filter((c) => c.status === 'completed').length,
  }), [contracts]);

  return (
    <div className="flex pt-6 h-screen bg-neutral-50">
      <Sidebar role="company" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6 space-y-6">

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">My Contracts</h1>
              <p className="text-sm text-neutral-500 mt-0.5">Manage your farming contracts end-to-end</p>
            </div>
            <button
              onClick={() => navigate('/company/create-contract')}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Contract
            </button>
          </div>

          {/* ── Summary stats ────────────────────────────────────────── */}
          {!loading && contracts.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS.map(({ label, key, color, bg, icon: Icon }) => (
                <div key={key} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex items-center gap-4">
                  <div className={`${bg} p-3 rounded-xl`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-medium">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{stats[key]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Filter tabs ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all shrink-0 ${
                    filter === s
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s.replace('_',' ')}
                  {s !== 'all' && (
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                      filter === s ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      {contracts.filter((c) => c.status === s).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Contract cards ───────────────────────────────────────── */}
          {loading ? (
            <Loading />
          ) : filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((contract) => {
                const cfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending;
                const totalValue = contract.quantity * contract.agreedPrice;
                const deliveryPct = contract.quantity
                  ? Math.round((contract.deliveryStatus?.quantityDelivered || 0) / contract.quantity * 100)
                  : 0;

                return (
                  <div key={contract._id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-all">
                    {/* Colour bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.bar}`} />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="font-bold text-neutral-900 capitalize text-lg">{contract.cropType}</h3>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                            {/* Pending approval warning */}
                            {contract.status === 'pending' && (
                              <span className="flex items-center gap-1 text-[10px] text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                <Clock className="w-2.5 h-2.5" />
                                Awaiting admin approval
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <div>
                              <p className="text-[10px] text-neutral-400 mb-0.5">Quantity</p>
                              <p className="text-sm font-bold text-neutral-800">{contract.quantity} {contract.unit}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-neutral-400 mb-0.5">Price / {contract.unit}</p>
                              <p className="text-sm font-bold text-success-700">₹{formatPrice(contract.agreedPrice)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-neutral-400 mb-0.5">Total Value</p>
                              <p className="text-sm font-bold text-neutral-800">₹{formatPrice(totalValue)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-neutral-400 mb-0.5">Applications</p>
                              <p className="text-sm font-bold text-primary-700">{contract.applicationsCount || 0}</p>
                            </div>
                          </div>

                          {/* Delivery progress bar (only for active/in_progress/completed) */}
                          {['active','in_progress','completed'].includes(contract.status) && (
                            <div className="mt-3">
                              <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                                <span>Delivery</span>
                                <span className="font-bold text-neutral-600">
                                  {contract.deliveryStatus?.quantityDelivered || 0}/{contract.quantity} {contract.unit} ({deliveryPct}%)
                                </span>
                              </div>
                              <div className="w-full bg-neutral-100 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                                  style={{ width: `${deliveryPct}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-50 flex-wrap">
                        {/* Applicants — only useful when open or active */}
                        {['approved','active'].includes(contract.status) && (
                          <button
                            onClick={() => navigate(`/company/contracts/${contract._id}/applicants`)}
                            className="flex items-center gap-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 px-4 py-2 rounded-xl font-semibold text-xs transition-colors"
                          >
                            <Users className="w-3.5 h-3.5" />
                            Applicants ({contract.applicationsCount || 0})
                          </button>
                        )}

                        {/* View full details */}
                        <button
                          onClick={() => navigate(`/company/contracts/${contract._id}`)}
                          className="flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl font-semibold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Manage Contract
                        </button>

                        {/* Duration */}
                        <span className="ml-auto text-xs text-neutral-400 flex items-center gap-1 self-center">
                          {formatDate(contract.duration?.startDate)} → {formatDate(contract.duration?.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-16 text-center">
              <div className="bg-neutral-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-neutral-400" />
              </div>
              <p className="text-neutral-700 font-bold mb-1">No contracts found</p>
              <p className="text-sm text-neutral-500 mb-5">
                {filter === 'all' ? 'Create your first farming contract to get started.' : `No contracts with status "${filter}".`}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => navigate('/company/create-contract')}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Create Your First Contract
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyContracts;