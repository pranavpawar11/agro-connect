import React, { useEffect, useState } from 'react';
import { MessageSquare, Eye } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import disputeService from '../../services/disputeService';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const DisputeManagement = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    adminRemarks: '',
    actionTaken: '',
  });

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const data = await disputeService.getAllDisputes();
      setDisputes(data.disputes);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDispute = async () => {
    try {
      await disputeService.updateDisputeStatus(selectedDispute._id, updateData);
      toast.success('Dispute updated successfully');
      setShowModal(false);
      setSelectedDispute(null);
      fetchDisputes();
    } catch (error) {
      console.error('Error updating dispute:', error);
    }
  };

  const openDisputeModal = (dispute) => {
    setSelectedDispute(dispute);
    setUpdateData({
      status: dispute.status,
      adminRemarks: dispute.adminRemarks || '',
      actionTaken: dispute.actionTaken || '',
    });
    setShowModal(true);
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Dispute Management</h1>

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

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <Loading />
            ) : filteredDisputes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Raised By</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contract</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDisputes.map((dispute) => (
                      <tr key={dispute._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{dispute.subject}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {dispute.raisedBy?.name}
                          <span className="block text-xs text-gray-500 capitalize">({dispute.raisedByRole})</span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 capitalize">
                          {dispute.contract?.cropType}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getPriorityColor(dispute.priority)}`}>
                            {dispute.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(dispute.status)}`}>
                            {dispute.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(dispute.createdAt)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openDisputeModal(dispute)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No disputes found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dispute Details Modal */}
      {showModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Dispute Details</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Subject</p>
                <p className="font-semibold text-gray-800">{selectedDispute.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Message</p>
                <p className="text-gray-700">{selectedDispute.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Raised By</p>
                  <p className="font-semibold text-gray-800">
                    {selectedDispute.raisedBy?.name}
                    <span className="block text-xs text-gray-500 capitalize">({selectedDispute.raisedByRole})</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${getPriorityColor(selectedDispute.priority)}`}>
                    {selectedDispute.priority}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Remarks
                </label>
                <textarea
                  value={updateData.adminRemarks}
                  onChange={(e) => setUpdateData({ ...updateData, adminRemarks: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Add your remarks..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Taken
                </label>
                <textarea
                  value={updateData.actionTaken}
                  onChange={(e) => setUpdateData({ ...updateData, actionTaken: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Describe the action taken..."
                />
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDispute(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDispute}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark"
              >
                Update Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeManagement;