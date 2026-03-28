import React, { useEffect, useState } from 'react';
import { MessageSquare, Eye, AlertOctagon, User, Clock } from 'lucide-react';
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
      open: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 border border-blue-200',
      resolved: 'bg-green-100 text-green-800 border border-green-200',
      closed: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border border-orange-200',
      critical: 'bg-red-100 text-red-800 border border-red-200',
    };
    return colors[priority] || colors.medium;
  };

  const filterOptions = ['all', 'open', 'under_review', 'resolved', 'closed'];

  const filterGradients = {
    all: 'from-neutral-500 to-neutral-600',
    open: 'from-yellow-500 to-orange-500',
    under_review: 'from-blue-500 to-cyan-600',
    resolved: 'from-green-500 to-emerald-600',
    closed: 'from-neutral-400 to-neutral-500',
  };

  return (
    <div className="flex h-screen bg-gradient-mesh-light farmland-pattern">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6">
          {/* Hero Header */}
          <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-800 to-orange-900" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/5 rounded-full" />
            <div className="absolute top-4 right-40 w-32 h-32 bg-orange-300/10 rounded-full" />

            <div className="relative p-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <MessageSquare className="w-8 h-8 text-red-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-display font-black text-white tracking-tight">
                    Dispute Management
                  </h1>
                  <p className="text-red-100 text-lg mt-1">Review and resolve platform disputes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="glass-card rounded-2xl border-2 border-white/50 shadow-soft p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filterOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all duration-200 ${
                    filter === status
                      ? `bg-gradient-to-r ${filterGradients[status]} text-white shadow-md scale-105`
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Disputes Table */}
          <div className="glass-card rounded-3xl border-2 border-white/50 shadow-soft overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loading />
              </div>
            ) : filteredDisputes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-neutral-50 to-red-50 border-b border-neutral-200">
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Raised By</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Contract</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredDisputes.map((dispute, index) => (
                      <tr
                        key={dispute._id}
                        className="hover:bg-red-50/50 transition-colors duration-150 animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-red-500 to-orange-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                              <AlertOctagon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-neutral-800 text-sm">{dispute.subject}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-neutral-200 w-7 h-7 rounded-full flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-neutral-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-800 text-sm">{dispute.raisedBy?.name}</p>
                              <p className="text-xs text-neutral-500 capitalize">({dispute.raisedByRole})</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-700 capitalize text-sm">{dispute.contract?.cropType}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getPriorityColor(dispute.priority)}`}>
                            {dispute.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getStatusColor(dispute.status)}`}>
                            {dispute.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-neutral-600 text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(dispute.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openDisputeModal(dispute)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 hover:scale-110 transition-all duration-200 border border-blue-100"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-red-100 to-orange-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-12 h-12 text-red-400" />
                </div>
                <p className="text-neutral-500 font-semibold text-lg">No disputes found</p>
                <p className="text-neutral-400 text-sm mt-1">All clear! No disputes match the selected filter</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dispute Details Modal */}
      {showModal && selectedDispute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2.5 rounded-xl">
                  <AlertOctagon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900">Dispute Details</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Subject</p>
                <p className="font-bold text-neutral-800">{selectedDispute.subject}</p>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Message</p>
                <p className="text-neutral-700 text-sm leading-relaxed">{selectedDispute.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Raised By</p>
                  <p className="font-bold text-neutral-800">{selectedDispute.raisedBy?.name}</p>
                  <p className="text-xs text-neutral-500 capitalize mt-0.5">({selectedDispute.raisedByRole})</p>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Priority</p>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full capitalize ${getPriorityColor(selectedDispute.priority)}`}>
                    {selectedDispute.priority}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all"
                >
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Admin Remarks</label>
                <textarea
                  value={updateData.adminRemarks}
                  onChange={(e) => setUpdateData({ ...updateData, adminRemarks: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all resize-none"
                  placeholder="Add your remarks..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Action Taken</label>
                <textarea
                  value={updateData.actionTaken}
                  onChange={(e) => setUpdateData({ ...updateData, actionTaken: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all resize-none"
                  placeholder="Describe the action taken..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-100 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDispute(null);
                }}
                className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDispute}
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
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
