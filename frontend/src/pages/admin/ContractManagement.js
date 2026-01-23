import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
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
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Contract Management</h1>

          {/* Filter Buttons */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'pending', 'approved', 'active', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
                    filter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <Loading />
            ) : filteredContracts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Crop Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Applications</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Legal Doc</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredContracts.map((contract) => (
                      <tr key={contract._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800 capitalize">{contract.cropType}</td>
                        <td className="px-6 py-4 text-gray-700">{contract.company?.companyDetails?.companyName}</td>
                        <td className="px-6 py-4 text-gray-700">{contract.quantity} {contract.unit}</td>
                        <td className="px-6 py-4 text-gray-700">{formatPrice(contract.agreedPrice)}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                            {contract.applicationsCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(contract.status)}`}>
                            {contract.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {contract.legalContractFile ? (
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                              contract.legalContractVerification.status === 'verified'
                                ? 'bg-green-100 text-green-800'
                                : contract.legalContractVerification.status === 'rejected'
                                ? 'bg-red-100 text-red-800': 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {contract.legalContractVerification.status}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">No file</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {contract.legalContractFile && contract.legalContractVerification.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerifyLegalContract(contract._id, 'verified', 'Approved')}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              title="Verify Legal Contract"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleVerifyLegalContract(contract._id, 'rejected', 'Rejected')}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Reject Legal Contract"
                            >
                              <XCircle className="w-5 h-5" />
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
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No contracts found</p>
          </div>
        )}
      </div>
    </main>
  </div>
</div>);
};
export default ContractManagement;