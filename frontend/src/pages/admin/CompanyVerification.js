import React, { useEffect, useState } from 'react';
import { Building, CheckCircle, XCircle, Eye, Shield, MapPin, Phone, Mail, Hash } from 'lucide-react';
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
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      verified: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
      blocked: 'bg-red-100 text-red-800 border border-red-200',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="flex h-screen bg-gradient-mesh-light farmland-pattern">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6">
          {/* Hero Header */}
          <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-800 to-indigo-900" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/5 rounded-full" />
            <div className="absolute top-4 right-40 w-32 h-32 bg-cyan-400/10 rounded-full" />

            <div className="relative p-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <Building className="w-8 h-8 text-blue-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-display font-black text-white tracking-tight">
                    Company Verification
                  </h1>
                  <p className="text-blue-100 text-lg mt-1">Review and verify company registrations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Companies Table */}
          <div className="glass-card rounded-3xl border-2 border-white/50 shadow-soft overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loading />
              </div>
            ) : companies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-neutral-50 to-blue-50 border-b border-neutral-200">
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Company Name</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Contact Person</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Registration Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {companies.map((company, index) => (
                      <tr
                        key={company._id}
                        className="hover:bg-blue-50/50 transition-colors duration-150 animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm">
                              {company.companyDetails?.companyName?.charAt(0)}
                            </div>
                            <span className="font-bold text-neutral-800">{company.companyDetails?.companyName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-700 font-medium">{company.name}</td>
                        <td className="px-6 py-4 text-neutral-600 text-sm">{company.email}</td>
                        <td className="px-6 py-4 text-neutral-600 text-sm">{formatDate(company.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getStatusColor(company.verificationStatus)}`}>
                            {company.verificationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {company.verificationStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => openVerificationModal(company, 'verified')}
                                  className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 hover:scale-110 transition-all duration-200 border border-green-100"
                                  title="Verify"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openVerificationModal(company, 'rejected')}
                                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:scale-110 transition-all duration-200 border border-red-100"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setShowModal(true);
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 hover:scale-110 transition-all duration-200 border border-blue-100"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Building className="w-12 h-12 text-blue-400" />
                </div>
                <p className="text-neutral-500 font-semibold text-lg">No companies found</p>
                <p className="text-neutral-400 text-sm mt-1">Companies will appear here once they register</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Verification Modal */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900">Company Details</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Company Name</p>
                  <p className="font-bold text-neutral-800">{selectedCompany.companyDetails?.companyName}</p>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Contact Person</p>
                  <p className="font-bold text-neutral-800">{selectedCompany.name}</p>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email</p>
                  </div>
                  <p className="font-semibold text-neutral-800 text-sm">{selectedCompany.email}</p>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Phone</p>
                  </div>
                  <p className="font-bold text-neutral-800">{selectedCompany.phone}</p>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-3.5 h-3.5 text-neutral-400" />
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Registration No.</p>
                  </div>
                  <p className="font-bold text-neutral-800">{selectedCompany.companyDetails?.registrationNumber}</p>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">GST Number</p>
                  <p className="font-bold text-neutral-800">{selectedCompany.companyDetails?.gstNumber}</p>
                </div>
                <div className="col-span-2 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Address</p>
                  </div>
                  <p className="font-semibold text-neutral-800">
                    {selectedCompany.companyDetails?.address}, {selectedCompany.companyDetails?.city}, {selectedCompany.companyDetails?.state}
                  </p>
                </div>
              </div>

              {verificationData.status && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-neutral-700 mb-2">Remarks</label>
                  <textarea
                    value={verificationData.remarks}
                    onChange={(e) => setVerificationData({ ...verificationData, remarks: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all resize-none"
                    placeholder="Add remarks..."
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-100 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCompany(null);
                  setVerificationData({ status: '', remarks: '' });
                }}
                className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
              {verificationData.status && (
                <button
                  onClick={handleVerify}
                  className={`flex-1 text-white py-3 rounded-xl font-bold shadow-lg transition-opacity hover:opacity-90 ${
                    verificationData.status === 'verified'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : 'bg-gradient-to-r from-red-500 to-pink-600'
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
