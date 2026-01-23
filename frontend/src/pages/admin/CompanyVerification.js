import React, { useEffect, useState } from 'react';
import { Building, CheckCircle, XCircle, Eye } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const CompanyVerification = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    status: '',
    remarks: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/users/companies');
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      await api.put(`/users/companies/${selectedCompany._id}/verify`, verificationData);
      toast.success(`Company ${verificationData.status} successfully!`);
      setShowModal(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error('Error verifying company:', error);
    }
  };

  const openVerificationModal = (company, status) => {
    setSelectedCompany(company);
    setVerificationData({ status, remarks: '' });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      blocked: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Company Verification</h1>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <Loading />
            ) : companies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Company Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact Person</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Registration Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {companies.map((company) => (
                      <tr key={company._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {company.companyDetails?.companyName}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{company.name}</td>
                        <td className="px-6 py-4 text-gray-700">{company.email}</td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(company.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(company.verificationStatus)}`}>
                            {company.verificationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {company.verificationStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => openVerificationModal(company, 'verified')}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                  title="Verify"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openVerificationModal(company, 'rejected')}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setShowModal(true);
                              }}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No companies found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Verification Modal */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Company Details</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-semibold text-gray-800">{selectedCompany.companyDetails?.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="font-semibold text-gray-800">{selectedCompany.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{selectedCompany.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-800">{selectedCompany.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registration Number</p>
                  <p className="font-semibold text-gray-800">{selectedCompany.companyDetails?.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">GST Number</p>
                  <p className="font-semibold text-gray-800">{selectedCompany.companyDetails?.gstNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-800">
                    {selectedCompany.companyDetails?.address}, {selectedCompany.companyDetails?.city}, {selectedCompany.companyDetails?.state}
                  </p>
                </div>
              </div>

              {verificationData.status && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={verificationData.remarks}
                    onChange={(e) => setVerificationData({ ...verificationData, remarks: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Add remarks..."
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCompany(null);
                  setVerificationData({ status: '', remarks: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Close
              </button>
              {verificationData.status && (
                <button
                  onClick={handleVerify}
                  className={`flex-1 text-white py-3 rounded-lg font-semibold ${
                    verificationData.status === 'verified' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {verificationData.status === 'verified' ? 'Verify Company' : 'Reject Company'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyVerification; 