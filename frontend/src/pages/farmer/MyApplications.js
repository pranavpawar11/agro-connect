import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Package,
  IndianRupee, ChevronRight, MapPin, Calendar, Building,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import { formatDate, formatPrice } from '../../utils/helpers';

const STATUS_CONFIG = {
  pending:  { bar: 'from-blue-400 to-cyan-500',      badgeBg: 'bg-blue-100',    badgeText: 'text-blue-700',    icon: Clock,       iconBg: 'bg-blue-50',    iconColor: 'text-blue-500'    },
  accepted: { bar: 'from-success-500 to-emerald-500', badgeBg: 'bg-success-100', badgeText: 'text-success-700', icon: CheckCircle, iconBg: 'bg-success-50', iconColor: 'text-success-500' },
  rejected: { bar: 'from-danger-500 to-rose-500',     badgeBg: 'bg-danger-100',  badgeText: 'text-danger-700',  icon: XCircle,     iconBg: 'bg-danger-50',  iconColor: 'text-danger-500'  },
};

const FILTER_TABS = ['all', 'pending', 'accepted', 'rejected'];

const MyApplications = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await contractService.getFarmerApplications();
        setApplications(data.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = activeTab === 'all'
    ? applications
    : applications.filter((a) => a.status === activeTab);

  // Navigate to ContractDetail passing the application so the detail
  // page knows this farmer already applied — no second lookup needed.
  const handleView = (application) => {
    const contractId = application.contract?._id || application.contract;
    navigate(`/farmer/contracts/${contractId}`, {
      state: { myApplication: application }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">

      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative p-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">{t('applications.title')}</h1>
            <p className="text-primary-100 text-xs mt-0.5">{t('applications.subtitle')}</p>
          </div>
          {!loading && applications.length > 0 && (
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {applications.length} {t('applications.total')}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {FILTER_TABS.map((tab) => {
            const count = tab === 'all' ? applications.length : applications.filter((a) => a.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300'
                }`}
              >
                {tab === 'all' ? t('filterAll') : t(`applications.status.${tab}`)}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12"><Loading /></div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3 animate-fade-in">
            {filtered.map((application) => {
              const config     = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;
              const StatusIcon = config.icon;
              const contract   = application.contract;

              return (
                <div
                  key={application._id}
                  onClick={() => handleView(application)}
                  className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
                >
                  {/* Colour bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${config.bar}`} />

                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`${config.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0`}>
                        <Package className="w-6 h-6 text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-neutral-900 capitalize text-base leading-tight truncate">
                            {contract?.cropType || t('common.notAvailable')}
                          </h3>
                          {/* Status badge */}
                          <span className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.badgeBg} ${config.badgeText}`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {t(`applications.status.${application.status}`)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1 truncate">
                          <Building className="w-3 h-3 shrink-0" />
                          {contract?.company?.companyDetails?.companyName || t('common.notAvailable')}
                        </p>
                        {contract?.location && (
                          <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {contract.location.district}, {contract.location.state}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-neutral-50 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-neutral-400 mb-0.5">{t('applications.quantity')}</p>
                        <p className="text-sm font-bold text-neutral-800">
                          {application.proposedQuantity}
                          <span className="text-[10px] font-normal text-neutral-500 ml-0.5">{contract?.unit}</span>
                        </p>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-neutral-400 mb-0.5">{t('applications.pricePerUnit')}</p>
                        <p className="text-sm font-bold text-success-700 flex items-center justify-center gap-0.5">
                          <IndianRupee className="w-3 h-3" />
                          {formatPrice(contract?.agreedPrice)}
                        </p>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-neutral-400 mb-0.5">{t('common.appliedOn')}</p>
                        <p className="text-xs font-bold text-neutral-700">{formatDate(application.createdAt)}</p>
                      </div>
                    </div>

                    {/* Company remarks */}
                    {application.companyRemarks && (
                      <div className="bg-accent-50 border-l-4 border-accent-400 rounded-r-xl px-3 py-2.5 mb-3">
                        <p className="text-[10px] font-bold text-accent-800 mb-0.5 uppercase tracking-wide">
                          {t('applications.companyRemarks')}
                        </p>
                        <p className="text-xs text-accent-900 italic leading-relaxed">
                          "{application.companyRemarks}"
                        </p>
                      </div>
                    )}

                    {/* Status label + CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                      <span className="text-xs text-neutral-500 leading-tight">
                        {t(`applications.statusLabel.${application.status}`)}
                      </span>
                      <span className="text-xs text-primary-600 font-bold flex items-center gap-1 shrink-0 ml-2">
                        {t('contract.viewDetails')}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm">
            <div className="bg-neutral-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-neutral-400" />
            </div>
            <p className="text-neutral-700 font-bold mb-1">{t('applications.noApplications')}</p>
            <p className="text-sm text-neutral-500 mb-5">{t('applications.noApplicationsHint')}</p>
            <button
              onClick={() => navigate('/farmer/contracts')}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm"
            >
              {t('applications.browseContracts')}
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyApplications;