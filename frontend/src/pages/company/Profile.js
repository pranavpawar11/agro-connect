import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Building, MapPin, Globe, LogOut, AlertCircle, FileText, Edit2, X, AlertTriangle } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyDetails: {
      companyName: '',
      registrationNumber: '',
      gstNumber: '',
      businessType: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      website: '',
    }
  });
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        companyDetails: {
          companyName: user.companyDetails?.companyName || '',
          registrationNumber: user.companyDetails?.registrationNumber || '',
          gstNumber: user.companyDetails?.gstNumber || '',
          businessType: user.companyDetails?.businessType || '',
          address: user.companyDetails?.address || '',
          city: user.companyDetails?.city || '',
          state: user.companyDetails?.state || '',
          pincode: user.companyDetails?.pincode || '',
          website: user.companyDetails?.website || '',
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        companyDetails: formData.companyDetails
      };

      const data = await authService.updateProfile(updateData);
      updateUser(data.user);
      setEditing(false);
      setShowWarning(false);
      
      // Show appropriate message based on previous verification status
      if (user.verificationStatus === 'verified') {
        toast.success('Profile updated successfully. Your account will be re-verified by admin.');
      } else if (user.verificationStatus === 'pending') {
        toast.success('Profile updated successfully. Verification is still pending.');
      } else if (user.verificationStatus === 'rejected') {
        toast.success('Profile updated successfully. Resubmitted for verification.');
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        companyDetails: {
          companyName: user.companyDetails?.companyName || '',
          registrationNumber: user.companyDetails?.registrationNumber || '',
          gstNumber: user.companyDetails?.gstNumber || '',
          businessType: user.companyDetails?.businessType || '',
          address: user.companyDetails?.address || '',
          city: user.companyDetails?.city || '',
          state: user.companyDetails?.state || '',
          pincode: user.companyDetails?.pincode || '',
          website: user.companyDetails?.website || '',
        }
      });
    }
    setEditing(false);
    setShowWarning(false);
  };

  const getVerificationBadge = () => {
    const status = user?.verificationStatus || 'pending';
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      verified: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
      blocked: 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${colors[status] || colors.pending}`}>
        {status}
      </span>
    );
  };

  const handleEditClick = () => {
    if (user?.verificationStatus === 'verified') {
      setShowWarning(true);
    } else {
      setEditing(true);
    }
  };

  const confirmEdit = () => {
    setShowWarning(false);
    setEditing(true);
  };

  const isVerified = user?.verificationStatus === 'verified';
  const isPending = user?.verificationStatus === 'pending';
  const isRejected = user?.verificationStatus === 'rejected';

  // If no user data, show loading
  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar role="company" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="company" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Company Profile</h1>
                <p className="text-gray-600 mt-1">Manage your company information and contact details</p>
              </div>
              <div className="flex items-center gap-4">
                {getVerificationBadge()}
                {!editing && (
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Warning Modal */}
            {showWarning && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">Verification Required</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Your company is currently verified. Any changes will reset your verification status to "pending".
                        </p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <p className="text-yellow-800 text-sm">
                        <span className="font-semibold">Note:</span> After editing, your profile will need to be re-verified by the admin team. This may take 1-2 business days.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowWarning(false)}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmEdit}
                        className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                      >
                        Continue Editing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Status Alerts */}
            {isPending && !editing && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Verification Pending</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Your company profile is under review by our admin team. You can still edit your information if needed.
                      {user.verificationRemarks && (
                        <span className="block mt-1 italic">Admin remarks: {user.verificationRemarks}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isRejected && !editing && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800">Verification Rejected</h4>
                    <p className="text-red-700 text-sm mt-1">
                      {user.verificationRemarks || 'Please update your information and resubmit for verification.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isVerified && editing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Editing Verified Profile</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Your verification status will be reset to "pending" after saving changes. Admin will need to re-verify your updated information.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact & Legal Information Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Contact & Legal Information</h2>
                  {editing && (
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      Editing Mode
                    </span>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Person Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                          required
                          placeholder="Enter contact person name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                          required
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Contact support to change your email address</p>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Company Legal Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.companyDetails.companyName}
                            onChange={(e) => setFormData({
                              ...formData,
                              companyDetails: { ...formData.companyDetails, companyName: e.target.value }
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            required
                            placeholder="Enter company name"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Registration Number
                            </label>
                            <input
                              type="text"
                              value={formData.companyDetails.registrationNumber}
                              onChange={(e) => setFormData({
                                ...formData,
                                companyDetails: { ...formData.companyDetails, registrationNumber: e.target.value }
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                              placeholder="Company registration number"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              GST Number
                            </label>
                            <input
                              type="text"
                              value={formData.companyDetails.gstNumber}
                              onChange={(e) => setFormData({
                                ...formData,
                                companyDetails: { ...formData.companyDetails, gstNumber: e.target.value }
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                              placeholder="GST number"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Type
                          </label>
                          <input
                            type="text"
                            value={formData.companyDetails.businessType}
                            onChange={(e) => setFormData({
                              ...formData,
                              companyDetails: { ...formData.companyDetails, businessType: e.target.value }
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            placeholder="e.g., Manufacturer, Wholesaler, Retailer, Distributor"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">Email Address</p>
                          <p className="text-gray-800 mt-1">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">Phone Number</p>
                          <p className="text-gray-800 mt-1">{user.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">Company Name</p>
                          <p className="text-gray-800 font-medium mt-1">
                            {user.companyDetails?.companyName || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      
                      {user.companyDetails?.registrationNumber && (
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">Registration Number</p>
                            <p className="text-gray-800 mt-1">{user.companyDetails.registrationNumber}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Address & Additional Information Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Address & Additional Information</h2>

                {editing ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.companyDetails.address}
                          onChange={(e) => setFormData({
                            ...formData,
                            companyDetails: { ...formData.companyDetails, address: e.target.value }
                          })}
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                          required
                          placeholder="Enter company address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.companyDetails.city}
                            onChange={(e) => setFormData({
                              ...formData,
                              companyDetails: { ...formData.companyDetails, city: e.target.value }
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            required
                            placeholder="City"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.companyDetails.state}
                            onChange={(e) => setFormData({
                              ...formData,
                              companyDetails: { ...formData.companyDetails, state: e.target.value }
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            required
                            placeholder="State"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.companyDetails.pincode}
                            onChange={(e) => setFormData({
                              ...formData,
                              companyDetails: { ...formData.companyDetails, pincode: e.target.value }
                            })}
                            maxLength="6"
                            pattern="[0-9]*"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            required
                            placeholder="Pincode"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <input
                            type="url"
                            value={formData.companyDetails.website}
                            onChange={(e) => setFormData({
                              ...formData,
                              companyDetails: { ...formData.companyDetails, website: e.target.value }
                            })}
                            placeholder="https://www.example.com"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GST Number (if not entered above)
                        </label>
                        <input
                          type="text"
                          value={formData.companyDetails.gstNumber}
                          onChange={(e) => setFormData({
                            ...formData,
                            companyDetails: { ...formData.companyDetails, gstNumber: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                          placeholder="GST number (if applicable)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Type
                        </label>
                        <select
                          value={formData.companyDetails.businessType}
                          onChange={(e) => setFormData({
                            ...formData,
                            companyDetails: { ...formData.companyDetails, businessType: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        >
                          <option value="">Select business type</option>
                          <option value="Manufacturer">Manufacturer</option>
                          <option value="Wholesaler">Wholesaler</option>
                          <option value="Retailer">Retailer</option>
                          <option value="Distributor">Distributor</option>
                          <option value="Exporter">Exporter</option>
                          <option value="Importer">Importer</option>
                          <option value="Service Provider">Service Provider</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-5">
                      {user.companyDetails?.address ? (
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <MapPin className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">Company Address</p>
                            <div className="text-gray-800 mt-1 space-y-1">
                              <p>{user.companyDetails.address}</p>
                              <p>
                                {user.companyDetails.city}, {user.companyDetails.state} - {user.companyDetails.pincode}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <MapPin className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">Company Address</p>
                            <p className="text-gray-500 mt-1 italic">Not provided</p>
                          </div>
                        </div>
                      )}

                      {user.companyDetails?.website && (
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <Globe className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">Website</p>
                            <a
                              href={user.companyDetails.website.startsWith('http') ? user.companyDetails.website : `https://${user.companyDetails.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all mt-1 inline-block"
                            >
                              {user.companyDetails.website}
                            </a>
                          </div>
                        </div>
                      )}

                      {user.companyDetails?.gstNumber && (
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">GST Number</p>
                            <p className="text-gray-800 mt-1">{user.companyDetails.gstNumber}</p>
                          </div>
                        </div>
                      )}

                      {user.companyDetails?.businessType && (
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <Building className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">Business Type</p>
                            <p className="text-gray-800 mt-1">{user.companyDetails.businessType}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {!user.companyDetails?.address && !user.companyDetails?.website && 
                     !user.companyDetails?.gstNumber && !user.companyDetails?.businessType && (
                      <div className="text-center py-8">
                        <div className="bg-gray-50 rounded-lg p-6">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium">Additional information not provided</p>
                          <p className="text-gray-500 text-sm mt-1">
                            Click "Edit Profile" to add address, website, and other details
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full max-w-2xl mx-auto block bg-red-50 text-red-600 border border-red-200 py-4 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
              <p className="text-center text-gray-500 text-sm mt-3">
                Last updated: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;