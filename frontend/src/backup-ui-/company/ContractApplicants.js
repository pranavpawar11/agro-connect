import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, User, MapPin, Phone, Mail, Upload, FileText } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const ContractApplicants = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingLegal, setUploadingLegal] = useState(false);
  const [legalContractFile, setLegalContractFile] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [contractId]);

  const fetchApplications = async () => {
    try {
      const [appData, contractData] = await Promise.all([
        contractService.getContractApplications(contractId),
        contractService.getContractById(contractId),
      ]);
      setApplications(appData.applications);
      setContract(contractData.contract);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFarmer = async (applicationId) => {
    if (!window.confirm('Are you sure you want to select this farmer? Other applications will be rejected.')) {
      return;
    }

    try {
      await contractService.selectFarmer(contractId, applicationId);
      toast.success('Farmer selected successfully! You can now upload the legal contract.');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error selecting farmer');
      console.error('Error selecting farmer:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setLegalContractFile(file);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleUploadLegalContract = async () => {
    if (!legalContractFile) {
      toast.error('Please select a PDF file');
      return;
    }

    setUploadingLegal(true);
    try {
      await contractService.uploadLegalContract(contractId, legalContractFile);
      toast.success('Legal contract uploaded successfully!');
      setLegalContractFile(null);
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading legal contract');
      console.error('Error uploading legal contract:', error);
    } finally {
      setUploadingLegal(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  if (loading) return <Loading fullScreen />;

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

          {/* Contract Info */}
          {contract && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 capitalize mb-2">{contract.cropType}</h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                    <div>
                      <span className="font-semibold">Quantity:</span> {contract.quantity} {contract.unit}
                    </div>
                    <div>
                      <span className="font-semibold">Price:</span> ₹{contract.agreedPrice} per {contract.unit}
                    </div>
                    <div>
                      <span className="font-semibold">Applications:</span> {contract.applicationsCount}
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full capitalize ${
                  contract.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                  contract.status === 'active' ? 'bg-green-100 text-green-800' :
                  contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {contract.status}
                </span>
              </div>

              {/* Selected Farmer Info */}
              {contract.selectedFarmer && (
                <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <p className="text-green-800 font-semibold mb-2">
                    ✓ Farmer Selected
                  </p>
                  <p className="text-sm text-green-700">
                    You have selected a farmer for this contract. 
                    {!contract.legalContractFile && ' Please upload the legal contract document below.'}
                  </p>
                </div>
              )}

              {/* Upload Legal Contract Section */}
              {contract.selectedFarmer && !contract.legalContractFile && (
                <div className="mt-6 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Legal Contract Document
                  </h3>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="legal-contract-upload"
                      />
                      <label
                        htmlFor="legal-contract-upload"
                        className="cursor-pointer inline-block px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Choose PDF File
                      </label>
                      {legalContractFile && (
                        <p className="text-sm text-gray-600 mt-2">
                          Selected: {legalContractFile.name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleUploadLegalContract}
                      disabled={!legalContractFile || uploadingLegal}
                      className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingLegal ? 'Uploading...' : 'Upload Contract'}
                    </button>
                  </div>
                </div>
              )}

              {/* Legal Contract Uploaded */}
              {contract.legalContractFile && (
                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-800">Legal Contract Uploaded</p>
                      <p className="text-sm text-blue-600">
                        Uploaded on: {formatDate(contract.legalContractFile.uploadedAt)}
                      </p>
                      <p className="text-sm text-blue-600">
                        Verification Status: <span className="font-semibold capitalize">
                          {contract.legalContractVerification.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Applications List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Applications</h2>

            {applications.length > 0 ? (
              <div className="space-y-6">
                {applications.map((application) => (
                  <div key={application._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                          {application.farmer?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{application.farmer?.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {application.farmer?.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {application.farmer?.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-gray-700">
                      <div>
                        <span className="font-semibold">Proposed Quantity:</span> {application.proposedQuantity} {contract?.unit}
                      </div>
                      <div>
                        <span className="font-semibold">Applied on:</span> {formatDate(application.createdAt)}
                      </div>
                      {application.farmerLocation?.village && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{application.farmerLocation.village}, {application.farmerLocation.district}</span>
                        </div>
                      )}
                      {application.farmer?.farmerDetails?.landSize && (
                        <div>
                          <span className="font-semibold">Land Size:</span> {application.farmer.farmerDetails.landSize} acres
                        </div>
                      )}
                    </div>

                    {application.farmerMessage && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Message:</p>
                        <p className="text-gray-700">{application.farmerMessage}</p>
                      </div>
                    )}

                    {application.experience && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Experience:</p>
                        <p className="text-gray-700">{application.experience}</p>
                      </div>
                    )}

                    {application.status === 'pending' && !contract.selectedFarmer && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleSelectFarmer(application._id)}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Select Farmer
                        </button>
                      </div>
                    )}

                    {application.status === 'accepted' && (
                      <div className="mt-4 bg-green-50 rounded-lg p-4">
                        <p className="text-green-700 font-semibold">
                          ✓ This farmer has been selected for the contract
                        </p>
                        {application.acceptedAt && (
                          <p className="text-sm text-green-600 mt-1">
                            Selected on: {formatDate(application.acceptedAt)}
                          </p>
                        )}
                      </div>
                    )}

                    {application.companyRemarks && (
                      <div className="mt-4 bg-blue-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-700 mb-1">Remarks:</p>
                        <p className="text-blue-700">{application.companyRemarks}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No applications yet</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ContractApplicants;