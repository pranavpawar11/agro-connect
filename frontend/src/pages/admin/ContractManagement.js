import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, Package, DollarSign, Users } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import { formatDate, formatPrice } from '../../utils/helpers';
import { toast } from 'react-toastify';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const data = await contractService.getAllContracts();
      setContracts(data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (contractId, status) => {
    try {
      await contractService.updateContractStatus(contractId, { status });
      toast.success('Contract status updated successfully');
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
    }
  };

  const handleVerifyLegalContract = async (contractId, status, remarks) => {
    try {
      await contractService.verifyLegalContract(contractId, { status, remarks });
      toast.success(`Legal contract ${status} successfully`);
      fetchContracts();
    } catch (error) {
      console.error('Error verifying contract:', error);
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    if (filter === 'all') return true;
    return contract.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border border-blue-200',
      active: 'bg-green-100 text-green-800 border border-green-200',
      completed: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200',
    };
    return colors[status] || colors.pending;
  };

  const filterOptions = ['all', 'pending', 'approved', 'active', 'completed', 'cancelled'];

  const filterGradients = {
    all: 'from-neutral-500 to-neutral-600',
    pending: 'from-yellow-500 to-orange-500',
    approved: 'from-blue-500 to-cyan-600',
    active: 'from-green-500 to-emerald-600',
    completed: 'from-neutral-400 to-neutral-500',
    cancelled: 'from-red-500 to-pink-600',
  };

  return (
    <div className="flex h-screen bg-gradient-mesh-light farmland-pattern">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6">
          {/* Hero Header */}
          <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-700 to-blue-900" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/5 rounded-full" />
            <div className="absolute top-4 right-40 w-32 h-32 bg-cyan-300/10 rounded-full" />

            <div className="relative p-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <FileText className="w-8 h-8 text-cyan-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-display font-black text-white tracking-tight">
                    Contract Management
                  </h1>
                  <p className="text-blue-100 text-lg mt-1">Oversee all platform contracts and legal documents</p>
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
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Contracts Table */}
          <div className="glass-card rounded-3xl border-2 border-white/50 shadow-soft overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loading />
              </div>
            ) : filteredContracts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-neutral-50 to-blue-50 border-b border-neutral-200">
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Crop Type</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Applications</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Legal Doc</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredContracts.map((contract, index) => (
                      <tr
                        key={contract._id}
                        className="hover:bg-blue-50/50 transition-colors duration-150 animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
                              <Package className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-neutral-800 capitalize">{contract.cropType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-700 font-medium text-sm">{contract.company?.companyDetails?.companyName}</td>
                        <td className="px-6 py-4 text-neutral-700 text-sm">{contract.quantity} {contract.unit}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-green-700 font-bold">
                            <DollarSign className="w-3.5 h-3.5" />
                            {formatPrice(contract.agreedPrice)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="bg-blue-100 p-1 rounded-lg">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="font-bold text-blue-800">{contract.applicationsCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getStatusColor(contract.status)}`}>
                            {contract.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {contract.legalContractFile ? (
                            <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                              contract.legalContractVerification.status === 'verified'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : contract.legalContractVerification.status === 'rejected'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                              {contract.legalContractVerification.status}
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-xs bg-neutral-100 px-2 py-1 rounded-lg">No file</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {contract.legalContractFile && contract.legalContractVerification.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerifyLegalContract(contract._id, 'verified', 'Approved')}
                                  className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 hover:scale-110 transition-all duration-200 border border-green-100"
                                  title="Verify Legal Contract"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleVerifyLegalContract(contract._id, 'rejected', 'Rejected')}
                                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:scale-110 transition-all duration-200 border border-red-100"
                                  title="Reject Legal Contract"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-12 h-12 text-blue-400" />
                </div>
                <p className="text-neutral-500 font-semibold text-lg">No contracts found</p>
                <p className="text-neutral-400 text-sm mt-1">Contracts will appear here once created</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ContractManagement;
