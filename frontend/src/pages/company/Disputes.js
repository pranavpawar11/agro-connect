import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import disputeService from '../../services/disputeService';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const Disputes = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const data = await disputeService.getMyDisputes();
      setDisputes(data.disputes);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Error loading disputes');
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter((dispute) => {
    if (filter === 'all') return true;
    return dispute.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.open;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="company" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Disputes & Complaints</h1>
            <button
              onClick={() => navigate('/company/contracts')}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark"
            >
              Back to Contracts
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'open', 'under_review', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
                    filter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Disputes List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {loading ? (
              <Loading />
            ) : filteredDisputes.length > 0 ? (
              <div className="space-y-4">
                {filteredDisputes.map((dispute) => (
                  <div key={dispute._id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(dispute.status)}
                          <h3 className="font-bold text-lg text-gray-800">{dispute.subject}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded capitalize ${getPriorityColor(dispute.priority)}`}>
                            {dispute.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Contract: <span className="font-semibold capitalize">{dispute.contract?.cropType}</span> - {dispute.contract?.quantity} {dispute.contract?.unit}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(dispute.status)}`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Your Message:</p>
                      <p className="text-gray-700">{dispute.message}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-semibold">Raised on:</span> {formatDate(dispute.createdAt)}
                      </div>
                      {dispute.resolvedAt && (
                        <div>
                          <span className="font-semibold">Resolved on:</span> {formatDate(dispute.resolvedAt)}
                        </div>
                      )}
                      {dispute.closedAt && (
                        <div>
                          <span className="font-semibold">Closed on:</span> {formatDate(dispute.closedAt)}
                        </div>
                      )}
                    </div>

                    {dispute.adminRemarks && (
                      <div className="mt-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-700 mb-1">Admin Remarks:</p>
                        <p className="text-blue-700">{dispute.adminRemarks}</p>
                      </div>
                    )}

                    {dispute.actionTaken && (
                      <div className="mt-2 bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <p className="text-sm font-semibold text-green-700 mb-1">Action Taken:</p>
                        <p className="text-green-700">{dispute.actionTaken}</p>
                      </div>
                    )}

                    {dispute.contract && (
                      <div className="mt-4">
                        <button
                          onClick={() => navigate(`/company/contracts/${dispute.contract._id}`)}
                          className="text-primary hover:text-primary-dark font-semibold text-sm flex items-center gap-2"
                        >
                          View Contract Details →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No disputes found</p>
                <p className="text-sm text-gray-400">
                  {filter !== 'all' 
                    ? `No ${filter.replace('_', ' ')} disputes` 
                    : 'You can raise a dispute from the contract details page'}
                </p>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          {!loading && disputes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <p className="text-sm text-gray-600">Open</p>
                </div>
                <p className="text-3xl font-bold text-yellow-600">
                  {disputes.filter(d => d.status === 'open').length}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-blue-500" />
                  <p className="text-sm text-gray-600">Under Review</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {disputes.filter(d => d.status === 'under_review').length}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <p className="text-sm text-gray-600">Resolved</p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {disputes.filter(d => d.status === 'resolved').length}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-6 h-6 text-gray-500" />
                  <p className="text-sm text-gray-600">Closed</p>
                </div>
                <p className="text-3xl font-bold text-gray-600">
                  {disputes.filter(d => d.status === 'closed').length}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Disputes;