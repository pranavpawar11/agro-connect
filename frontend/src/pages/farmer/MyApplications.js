import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Package, IndianRupee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import { formatDate, formatPrice } from '../../utils/helpers';

const MyApplications = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await contractService.getFarmerApplications();
      setApplications(data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-danger-500" />;
      default:
        return <Clock className="w-5 h-5 text-warning-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-gradient-to-r from-success-500 to-success-600 text-white';
      case 'rejected':
        return 'bg-gradient-to-r from-danger-500 to-danger-600 text-white';
      default:
        return 'bg-gradient-to-r from-warning-500 to-warning-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative p-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">{t('applications.title')}</h1>
            <p className="text-primary-100 text-sm mt-0.5">{t('applications.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="p-4 animate-fade-in">
        {loading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : applications?.length > 0 ? (
          <div className="space-y-4">
            {applications?.map((application) => (
              <div 
                key={application._id} 
                className="glass-effect rounded-2xl shadow-soft border border-neutral-200 overflow-hidden hover:shadow-medium transition-all"
              >
                {/* Status Header */}
                <div className={`${getStatusColor(application.status)} px-5 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <span className="font-bold text-sm uppercase tracking-wide">
                      {t(`applications.status.${application.status}`)}
                    </span>
                  </div>
                  <span className="text-xs opacity-90">
                    {formatDate(application.createdAt)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-primary-50 p-3 rounded-xl">
                      <Package className="w-6 h-6 text-primary-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-neutral-800 capitalize mb-1">
                        {application.contract?.cropType || t('common.notAvailable')}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {application.contract?.company?.companyDetails?.companyName || t('common.notAvailable')}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-neutral-50 rounded-xl p-3">
                      <p className="text-xs text-neutral-600 mb-1 font-medium">{t('applications.quantity')}</p>
                      <p className="font-bold text-neutral-800">
                        {application.proposedQuantity} {application.contract?.unit}
                      </p>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-3">
                      <p className="text-xs text-neutral-600 mb-1 font-medium">{t('applications.pricePerUnit')}</p>
                      <p className="font-bold text-success-700 flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {formatPrice(application.contract?.agreedPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Company Remarks */}
                  {application.companyRemarks && (
                    <div className="bg-accent-50 border-l-4 border-accent-500 rounded-lg p-4">
                      <p className="text-xs font-bold text-accent-900 mb-2 flex items-center gap-1.5">
                        <span>💬</span>
                        {t('applications.companyRemarks')}
                      </p>
                      <p className="text-sm text-accent-800 leading-relaxed">
                        {application.companyRemarks}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-3xl p-12 text-center border border-neutral-200">
            <div className="bg-neutral-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-semibold mb-1">{t('applications.noApplications')}</p>
            <p className="text-sm text-neutral-500 mb-4">{t('applications.noApplicationsHint')}</p>
            <button
              onClick={() => navigate('/farmer/contracts')}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-medium hover:shadow-glow transition-all"
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
