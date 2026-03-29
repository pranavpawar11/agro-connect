import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Package, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import disputeService from '../../services/disputeService';
import { formatDate, formatPrice } from '../../utils/helpers';
import { toast } from 'react-toastify';

const ContractDetails = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentType: 'advance',
    amount: '',
    status: 'paid'
  });
  const [deliveryData, setDeliveryData] = useState({
    quantity: '',
    notes: ''
  });
  const [disputeData, setDisputeData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      const data = await contractService.getContractById(contractId);
      setContract(data.contract);
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error('Error loading contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      await contractService.updatePayment(contractId, paymentData);
      toast.success('Payment updated successfully!');
      setShowPaymentModal(false);
      fetchContract();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating payment');
    }
  };

  const handleAddDelivery = async (e) => {
    e.preventDefault();
    try {
      await contractService.addDelivery(contractId, deliveryData);
      toast.success('Delivery recorded successfully!');
      setShowDeliveryModal(false);
      setDeliveryData({ quantity: '', notes: '' });
      fetchContract();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error recording delivery');
    }
  };

  const handleMarkInProgress = async () => {
    try {
      await contractService.markAsInProgress(contractId);
      toast.success('Contract marked as in progress!');
      fetchContract();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const handleMarkCompleted = async () => {
    if (!window.confirm('Are you sure you want to mark this contract as completed?')) {
      return;
    }
    try {
      await contractService.markAsCompleted(contractId);
      toast.success('Contract marked as completed!');
      fetchContract();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const handleCancelContract = async () => {
    const reason = window.prompt('Please enter the cancellation reason:');
    if (!reason) return;

    try {
      await contractService.cancelContract(contractId, reason);
      toast.success('Contract cancelled successfully');
      fetchContract();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cancelling contract');
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    try {
      await disputeService.raiseDispute({
        contractId,
        ...disputeData
      });
      toast.success('Dispute raised successfully!');
      setShowDisputeModal(false);
      setDisputeData({ subject: '', message: '', priority: 'medium' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error raising dispute');
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

  if (!contract) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Contract not found</p>
      </div>
    );
  }

  const deliveryProgress = (contract.deliveryStatus.quantityDelivered / contract.quantity) * 100;
  const totalContractValue = contract.quantity * contract.agreedPrice;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="company" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <button
            onClick={() => navigate('/company/contracts')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Contracts
          </button>

          {/* Contract Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 capitalize">{contract.cropType} Contract</h1>
                <p className="text-gray-600 mt-2">{contract.description}</p>
              </div>
              <span className={`px-4 py-2 text-sm font-semibold rounded-full capitalize ${getStatusColor(contract.status)}`}>
                {contract.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-semibold">Total Value</p>
                <p className="text-2xl font-bold text-blue-800">{formatPrice(totalContractValue)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-semibold">Quantity</p>
                <p className="text-2xl font-bold text-green-800">{contract.quantity} {contract.unit}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-semibold">Price per {contract.unit}</p>
                <p className="text-2xl font-bold text-purple-800">{formatPrice(contract.agreedPrice)}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-semibold">Duration</p>
                <p className="text-sm font-bold text-orange-800">
                  {formatDate(contract.duration.startDate)} to {formatDate(contract.duration.endDate)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {(contract.status === 'approved' || contract.status === 'active') && (
                <button
                  onClick={handleMarkInProgress}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600"
                >
                  Mark as In Progress
                </button>
              )}
              {contract.status === 'in_progress' && (
                <button
                  onClick={handleMarkCompleted}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600"
                >
                  Mark as Completed
                </button>
              )}
              {!['completed', 'cancelled'].includes(contract.status) && (
                <>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
                  >
                    Update Payment
                  </button>
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-600"
                  >
                    Record Delivery
                  </button>
                  <button
                    onClick={() => setShowDisputeModal(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600"
                  >
                    Raise Dispute
                  </button>
                  <button
                    onClick={handleCancelContract}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
                  >
                    Cancel Contract
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Payment Details
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">Advance Payment</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      contract.paymentDetails.advancePayment.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {contract.paymentDetails.advancePayment.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatPrice(contract.paymentDetails.advancePayment.amount || 0)}
                  </p>
                  {contract.paymentDetails.advancePayment.paidDate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Paid on: {formatDate(contract.paymentDetails.advancePayment.paidDate)}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">Final Payment</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      contract.paymentDetails.finalPayment.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {contract.paymentDetails.finalPayment.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatPrice(contract.paymentDetails.finalPayment.amount || 0)}
                  </p>
                  {contract.paymentDetails.finalPayment.paidDate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Paid on: {formatDate(contract.paymentDetails.finalPayment.paidDate)}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <span className="text-sm font-semibold text-green-700">Total Paid</span>
                  <p className="text-3xl font-bold text-green-800">
                    {formatPrice(contract.paymentDetails.totalPaid || 0)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    of {formatPrice(totalContractValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Delivery Status
              </h2>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">Delivery Progress</span>
                  <span className="text-sm font-bold text-blue-600">{deliveryProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(deliveryProgress, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {contract.deliveryStatus.quantityDelivered} of {contract.quantity} {contract.unit} delivered
                </p>
              </div>

              <h3 className="font-semibold text-gray-700 mb-3">Delivery History</h3>
              {contract.deliveryStatus.deliveries.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {contract.deliveryStatus.deliveries.map((delivery, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {delivery.quantity} {contract.unit}
                          </p>
                          <p className="text-sm text-gray-600">{formatDate(delivery.date)}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      {delivery.notes && (
                        <p className="text-sm text-gray-600 mt-2">{delivery.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No deliveries recorded yet</p>
              )}
            </div>
          </div>

          {/* Location & Terms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Location</h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">District:</span> {contract.location.district}</p>
                <p><span className="font-semibold">State:</span> {contract.location.state}</p>
                {contract.location.pincode && (
                  <p><span className="font-semibold">Pincode:</span> {contract.location.pincode}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Terms & Conditions</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {contract.terms || 'No specific terms defined'}
              </p>
            </div>
          </div>

          {/* Modals */}
          {/* Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Update Payment</h3>
                <form onSubmit={handleUpdatePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <select
                      value={paymentData.paymentType}
                      onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="advance">Advance Payment</option>
                      <option value="final">Final Payment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={paymentData.status}
                      onChange={(e) => setPaymentData({ ...paymentData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delivery Modal */}
          {showDeliveryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Record Delivery</h3>
                <form onSubmit={handleAddDelivery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity ({contract.unit})
                    </label>
                    <input
                      type="number"
                      value={deliveryData.quantity}
                      onChange={(e) => setDeliveryData({ ...deliveryData, quantity: e.target.value })}
                      required
                      min="0"
                      max={contract.quantity - contract.deliveryStatus.quantityDelivered}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={deliveryData.notes}
                      onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeliveryModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold"
                    >
                      Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Dispute Modal */}
          {showDisputeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Raise Dispute</h3>
                <form onSubmit={handleRaiseDispute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={disputeData.subject}
                      onChange={(e) => setDisputeData({ ...disputeData, subject: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={disputeData.message}
                      onChange={(e) => setDisputeData({ ...disputeData, message: e.target.value })}
                      required
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={disputeData.priority}
                      onChange={(e) => setDisputeData({ ...disputeData, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDisputeModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ContractDetails;