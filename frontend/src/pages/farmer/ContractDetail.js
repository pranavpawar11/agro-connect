import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, IndianRupee, Package, FileText, Building, MessageSquare, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
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
      toast.error('Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await contractService.applyToContract(contractId, applicationData);
      toast.success('Application submitted successfully!');
      setShowApplicationForm(false);
      fetchContractDetail(); // Refresh contract data
    } catch (error) {
      console.error('Error applying:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
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
      toast.success('Dispute raised successfully!');
      setShowDisputeForm(false);
      setDisputeData({
        subject: '',
        message: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error raising dispute:', error);
      toast.error(error.response?.data?.message || 'Failed to raise dispute');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  if (loading) return <Loading fullScreen />;
  if (!contract) return <div className="flex items-center justify-center h-screen">Contract not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Contract Details</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 capitalize">{contract.cropType}</h2>
              <p className="text-gray-600">{contract.company?.companyDetails?.companyName}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(contract.status)}`}>
              {contract.status.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <Package className="w-5 h-5 mr-3 text-primary" />
              <span className="font-semibold mr-2">Quantity:</span>
              <span>{contract.quantity} {contract.unit}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <IndianRupee className="w-5 h-5 mr-3 text-primary" />
              <span className="font-semibold mr-2">Price:</span>
              <span>{formatPrice(contract.agreedPrice)} per {contract.unit}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 mr-3 text-primary" />
              <span className="font-semibold mr-2">Location:</span>
              <span>{contract.location.district}, {contract.location.state}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-3 text-primary" />
              <span className="font-semibold mr-2">Duration:</span>
              <span>{formatDate(contract.duration.startDate)} - {formatDate(contract.duration.endDate)}</span>
            </div>
          </div>
        </div>

        {/* Payment Status (if contract is active/in_progress/completed) */}
        {(contract.status === 'active' || contract.status === 'in_progress' || contract.status === 'completed') && contract.paymentDetails && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              Payment Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Advance Payment:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {contract.paymentDetails.advancePayment?.amount 
                      ? formatPrice(contract.paymentDetails.advancePayment.amount)
                      : 'Not set'}
                  </span>
                  {contract.paymentDetails.advancePayment?.status === 'paid' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Final Payment:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {contract.paymentDetails.finalPayment?.amount 
                      ? formatPrice(contract.paymentDetails.finalPayment.amount)
                      : 'Not set'}
                  </span>
                  {contract.paymentDetails.finalPayment?.status === 'paid' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-bold text-gray-800">Total Paid:</span>
                <span className="font-bold text-green-600">
                  {formatPrice(contract.paymentDetails.totalPaid || 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Status */}
        {(contract.status === 'in_progress' || contract.status === 'completed') && contract.deliveryStatus && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Delivery Status
            </h3>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Delivered:</span>
                <span className="font-bold text-primary">
                  {contract.deliveryStatus.quantityDelivered} / {contract.quantity} {contract.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${(contract.deliveryStatus.quantityDelivered / contract.quantity) * 100}%` }}
                ></div>
              </div>
            </div>

            {contract.deliveryStatus.deliveries && contract.deliveryStatus.deliveries.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Delivery History:</p>
                {contract.deliveryStatus.deliveries.map((delivery, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{delivery.quantity} {contract.unit}</span>
                      <span className="text-sm text-gray-600">{formatDate(delivery.date)}</span>
                    </div>
                    {delivery.notes && (
                      <p className="text-sm text-gray-600 mt-1">{delivery.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Company Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Company Information
          </h3>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-semibold">Name:</span> {contract.company?.name || contract.company?.companyDetails?.companyName}</p>
            <p><span className="font-semibold">Email:</span> {contract.company?.email}</p>
            <p><span className="font-semibold">Phone:</span> {contract.company?.phone}</p>
          </div>
        </div>

        {/* Description */}
        {contract.description && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{contract.description}</p>
          </div>
        )}

        {/* Terms & Conditions */}
        {contract.terms && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-3">Terms & Conditions</h3>
            <p className="text-gray-700 leading-relaxed">{contract.terms}</p>
          </div>
        )}

        {/* Legal Contract */}
        {contract.legalContractFile && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Legal Contract Document
            </h3>
            <a
              href={getFileUrl(contract.legalContractFile.path)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline mb-3"
            >
              <FileText className="w-4 h-4" />
              View Contract PDF
              <ExternalLink className="w-4 h-4" />
            </a>
            {contract.legalContractVerification && (
              <div className="mt-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  contract.legalContractVerification.status === 'verified' 
                    ? 'bg-green-100 text-green-800'
                    : contract.legalContractVerification.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {contract.legalContractVerification.status}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {contract.status === 'approved' && !showApplicationForm && (
          <div className="space-y-3">
            <button
              onClick={() => setShowApplicationForm(true)}
              className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors shadow-lg"
            >
              Apply to Contract
            </button>
          </div>
        )}

        {/* Raise Dispute Button (for active/in_progress contracts) */}
        {(contract.status === 'active' || contract.status === 'in_progress') && (
          <button
            onClick={() => setShowDisputeForm(true)}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <AlertTriangle className="w-5 h-5" />
            Raise Dispute
          </button>
        )}

        {/* Application Form */}
        {showApplicationForm && (
          <form onSubmit={handleApply} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <h3 className="font-bold text-gray-800 mb-3">Apply to Contract</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Quantity ({contract.unit})
              </label>
              <input
                type="number"
                value={applicationData.proposedQuantity}
                onChange={(e) => setApplicationData({ ...applicationData, proposedQuantity: e.target.value })}
                required
                min="1"
                max={contract.quantity}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Company
              </label>
              <textarea
                value={applicationData.farmerMessage}
                onChange={(e) => setApplicationData({ ...applicationData, farmerMessage: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Tell us about your experience and why you're interested..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowApplicationForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={applying}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}

        {/* Dispute Form */}
        {showDisputeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Raise Dispute
                </h2>
              </div>
              
              <form onSubmit={handleRaiseDispute} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={disputeData.subject}
                    onChange={(e) => setDisputeData({ ...disputeData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Brief subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={disputeData.priority}
                    onChange={(e) => setDisputeData({ ...disputeData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={disputeData.message}
                    onChange={(e) => setDisputeData({ ...disputeData, message: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Describe the issue in detail..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDisputeForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Submit Dispute
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