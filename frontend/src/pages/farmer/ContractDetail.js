import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, IndianRupee, Package, FileText, Building, MessageSquare, AlertTriangle, CheckCircle, ExternalLink, Clock, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import disputeService from '../../services/disputeService';
import { formatDate, formatPrice, getFileUrl } from '../../utils/helpers';
import { toast } from 'react-toastify';

const ContractDetail = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposedQuantity: '',
    farmerMessage: '',
  });
  const [disputeData, setDisputeData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchContractDetail();
  }, [contractId]);

  const fetchContractDetail = async () => {
    try {
      const data = await contractService.getContractById(contractId);
      setContract(data.contract);
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error(t('contractDetail.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await contractService.applyToContract(contractId, applicationData);
      toast.success(t('contractDetail.applySuccess'));
      setShowApplicationForm(false);
      fetchContractDetail(); // Refresh contract data
    } catch (error) {
      console.error('Error applying:', error);
      toast.error(error.response?.data?.message || t('contractDetail.applyError'));
    } finally {
      setApplying(false);
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    try {
      await disputeService.raiseDispute({
        contractId: contractId,
        ...disputeData
      });
      toast.success(t('contractDetail.disputeSuccess'));
      setShowDisputeForm(false);
      setDisputeData({
        subject: '',
        message: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error raising dispute:', error);
      toast.error(error.response?.data?.message || t('contractDetail.disputeError'));
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-gradient-to-r from-warning-500 to-warning-600', text: 'text-white', label: t(`contract.status.${status}`) },
      approved: { bg: 'bg-gradient-to-r from-accent-500 to-accent-600', text: 'text-white', label: t(`contract.status.${status}`) },
      active: { bg: 'bg-gradient-to-r from-success-500 to-success-600', text: 'text-white', label: t(`contract.status.${status}`) },
      in_progress: { bg: 'bg-gradient-to-r from-purple-500 to-purple-600', text: 'text-white', label: t(`contract.status.${status}`) },
      completed: { bg: 'bg-gradient-to-r from-neutral-500 to-neutral-600', text: 'text-white', label: t(`contract.status.${status}`) },
      cancelled: { bg: 'bg-gradient-to-r from-danger-500 to-danger-600', text: 'text-white', label: t(`contract.status.${status}`) },
    };
    return configs[status] || configs.pending;
  };

  if (loading) return <Loading fullScreen />;
  if (!contract) return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
      <p className="text-neutral-600">{t('contractDetail.notFound') } </p>
    </div>
  );

  const statusConfig = getStatusConfig(contract.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden shadow-strong">
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
            <h1 className="text-xl font-display font-bold">{t('contractDetail.title')}</h1>
            <p className="text-primary-100 text-sm">{t('contractDetail.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Main Info Card */}
        <div className="glass-effect rounded-3xl shadow-strong overflow-hidden border border-neutral-200">
          {/* Status Header */}
          <div className={`${statusConfig.bg} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <span className={`${statusConfig.text} font-bold text-sm uppercase tracking-wide flex items-center gap-2`}>
                {statusConfig.label === 'Active' && <Award className="w-4 h-4" />}
                {statusConfig.label === 'Completed' && <CheckCircle className="w-4 h-4" />}
                {statusConfig.label === 'Pending' && <Clock className="w-4 h-4" />}
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-4 rounded-2xl shadow-soft">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-bold text-neutral-900 capitalize mb-1">
                  {contract.cropType}
                </h2>
                <p className="text-neutral-600 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {contract.company?.companyDetails?.companyName}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid gap-4">
              <div className="flex items-center bg-neutral-50 rounded-xl p-4">
                <Package className="w-5 h-5 mr-3 text-primary-700 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-neutral-600 mb-0.5">{t('contractDetail.quantity')}</p>
                  <p className="font-bold text-neutral-900">{contract.quantity} {contract.unit}</p>
                </div>
              </div>

              <div className="flex items-center bg-success-50 rounded-xl p-4">
                <IndianRupee className="w-5 h-5 mr-3 text-success-700 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-success-700 mb-0.5">{t('contractDetail.price')}</p>
                  <p className="font-bold text-success-900 flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {formatPrice(contract.agreedPrice)} per {contract.unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-accent-50 rounded-xl p-4">
                <MapPin className="w-5 h-5 mr-3 text-accent-700 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-accent-700 mb-0.5">{t('contractDetail.location')}</p>
                  <p className="font-bold text-accent-900">{contract.location.district}, {contract.location.state}</p>
                </div>
              </div>

              <div className="flex items-center bg-purple-50 rounded-xl p-4">
                <Calendar className="w-5 h-5 mr-3 text-purple-700 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-purple-700 mb-0.5">{t('contractDetail.duration')}</p>
                  <p className="font-bold text-purple-900 text-sm">
                    {formatDate(contract.duration.startDate)} → {formatDate(contract.duration.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {(contract.status === 'active' || contract.status === 'in_progress' || contract.status === 'completed') && contract.paymentDetails && (
          <div className="glass-effect rounded-2xl shadow-soft p-6 border border-neutral-200">
            <h3 className="font-bold text-lg text-neutral-800 mb-4 flex items-center gap-2">
              <div className="bg-gradient-to-br from-success-500 to-success-700 p-2 rounded-xl">
                <IndianRupee className="w-4 h-4 text-white" />
              </div>
              {t('contractDetail.paymentInfo')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-700 font-medium">{t('contractDetail.advancePayment')}:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900">
                    {contract.paymentDetails.advancePayment?.amount 
                      ? formatPrice(contract.paymentDetails.advancePayment.amount)
                      : t('common.notAvailable')}
                  </span>
                  {contract.paymentDetails.advancePayment?.status === 'paid' && (
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-700 font-medium">{t('contractDetail.finalPayment')}:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900">
                    {contract.paymentDetails.finalPayment?.amount 
                      ? formatPrice(contract.paymentDetails.finalPayment.amount)
                      : t('common.notAvailable')}
                  </span>
                  {contract.paymentDetails.finalPayment?.status === 'paid' && (
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-neutral-200">
                <span className="font-bold text-neutral-800 text-lg">{t('contractDetail.totalPaid')}:</span>
                <span className="font-bold text-success-700 text-lg flex items-center gap-1">
                  <IndianRupee className="w-5 h-5" />
                  {formatPrice(contract.paymentDetails.totalPaid || 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {contract.description && (
          <div className="glass-effect rounded-2xl shadow-soft p-6 border border-neutral-200">
            <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent-600" />
              {t('contractDetail.description')}
            </h3>
            <p className="text-neutral-700 leading-relaxed">{contract.description}</p>
          </div>
        )}

        {/* Requirements & Terms */}
        {contract.requirements && (
          <div className="glass-effect rounded-2xl shadow-soft p-6 border border-neutral-200">
            <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              {t('contractDetail.requirements')}
            </h3>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{contract.requirements}</p>
          </div>
        )}

        {/* Legal Contract PDF */}
        {contract.legalContract && (
          <div className="glass-effect rounded-2xl shadow-soft p-6 border border-neutral-200">
            <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-danger-600" />
              {t('contractDetail.legalDoc')}
            </h3>
            <a
              href={getFileUrl(contract.legalContract)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-3 rounded-xl font-bold shadow-medium hover:shadow-glow transition-all"
            >
              <FileText className="w-5 h-5" />
              {t('contractDetail.viewPdf')}
              <ExternalLink className="w-4 h-4" />
            </a>
            {contract.legalContractVerification && (
              <div className="mt-4">
                <span className={`px-4 py-2 text-sm font-bold rounded-xl inline-block ${
                  contract.legalContractVerification.status === 'verified' 
                    ? 'bg-gradient-to-r from-success-500 to-success-600 text-white'
                    : contract.legalContractVerification.status === 'rejected'
                    ? 'bg-gradient-to-r from-danger-500 to-danger-600 text-white'
                    : 'bg-gradient-to-r from-warning-500 to-warning-600 text-white'
                }`}>
                  {contract.legalContractVerification.status}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {contract.status === 'approved' && !showApplicationForm && (
          <button
            onClick={() => setShowApplicationForm(true)}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-5 rounded-2xl font-bold text-lg shadow-strong hover:shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-6 h-6" />
            {t('contractDetail.apply')}
          </button>
        )}

        {/* Raise Dispute Button */}
        {(contract.status === 'active' || contract.status === 'in_progress') && (
          <button
            onClick={() => setShowDisputeForm(true)}
            className="w-full bg-gradient-to-r from-danger-500 to-danger-600 text-white py-4 rounded-2xl font-bold shadow-medium hover:shadow-strong transition-all flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {t('contractDetail.raiseDispute')}
          </button>
        )}

        {/* Application Form */}
        {showApplicationForm && (
          <form onSubmit={handleApply} className="glass-effect rounded-2xl shadow-strong p-6 border border-neutral-200 space-y-5 animate-scale-in">
            <h3 className="font-bold text-xl text-neutral-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary-700" />
              {t('contractDetail.apply')}
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                {t('contractDetail.proposedQty')} ({contract.unit})
              </label>
              <input
                type="number"
                value={applicationData.proposedQuantity}
                onChange={(e) => setApplicationData({ ...applicationData, proposedQuantity: e.target.value })}
                required
                min="1"
                max={contract.quantity}
                className="w-full px-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                {t('contractDetail.messageToCompany')}
              </label>
              <textarea
                value={applicationData.farmerMessage}
                onChange={(e) => setApplicationData({ ...applicationData, farmerMessage: e.target.value })}
                rows="4"
                className="w-full px-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium resize-none"
                placeholder={t('contractDetail.messagePlaceholder')}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApplicationForm(false)}
                className="flex-1 bg-neutral-100 text-neutral-700 py-3.5 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={applying}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl font-bold shadow-medium hover:shadow-glow disabled:opacity-50 transition-all"
              >
                {applying ? t('common.submitting') : t('contractDetail.submitApplication')}
              </button>
            </div>
          </form>
        )}

        {/* Dispute Form Modal */}
        {showDisputeForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-effect rounded-3xl shadow-strong max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-scale-in">
              <div className="bg-gradient-to-r from-danger-500 to-danger-600 p-6 rounded-t-3xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  {t('contractDetail.raiseDispute')}
                </h2>
                <p className="text-danger-100 text-sm mt-1">{t('contractDetail.disputeSubtitle')}</p>
              </div>
              
              <form onSubmit={handleRaiseDispute} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    {t('contractDetail.subject')} *
                  </label>
                  <input
                    type="text"
                    value={disputeData.subject}
                    onChange={(e) => setDisputeData({ ...disputeData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-danger-100 focus:border-danger-500 outline-none transition-all font-medium"
                    placeholder={t('contractDetail.subject')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    {t('contractDetail.priority')}
                  </label>
                  <select
                    value={disputeData.priority}
                    onChange={(e) => setDisputeData({ ...disputeData, priority: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-danger-100 focus:border-danger-500 outline-none transition-all font-medium"
                  >
                    <option value="low">{t('contractDetail.priority.low')}</option>
                    <option value="medium">{t('contractDetail.priority.medium')}</option>
                    <option value="high">{t('contractDetail.priority.high')}</option>
                    <option value="critical">{t('contractDetail.priority.critical')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    {t('contractDetail.message')} *
                  </label>
                  <textarea
                    value={disputeData.message}
                    onChange={(e) => setDisputeData({ ...disputeData, message: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-danger-100 focus:border-danger-500 outline-none transition-all font-medium resize-none"
                    placeholder={t('contractDetail.disputePlaceholder')}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDisputeForm(false)}
                    className="flex-1 bg-neutral-100 text-neutral-700 py-3.5 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-danger-500 to-danger-600 text-white py-3.5 rounded-xl font-bold shadow-medium hover:shadow-strong transition-all"
                  >
                    {t('contractDetail.submitDispute')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ContractDetail;
