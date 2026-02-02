import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Settings, Globe, Volume2, LogOut, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import useAuth from '../../hooks/useAuth';
import useVoice from '../../hooks/useVoice';
import { LanguageContext } from '../../context/LanguageContext';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const { language, changeLanguage } = React.useContext(LanguageContext);
  const { isEnabled, toggleVoice } = useVoice();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    farmerDetails: {
      address: user?.farmerDetails?.address || '',
      village: user?.farmerDetails?.village || '',
      district: user?.farmerDetails?.district || '',
      state: user?.farmerDetails?.state || '',
      pincode: user?.farmerDetails?.pincode || '',
      landSize: user?.farmerDetails?.landSize || '',
      crops: user?.farmerDetails?.crops?.join(', ') || '',
    }
  });

  const handleSave = async () => {
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        language,
        farmerDetails: {
          ...formData.farmerDetails,
          crops: formData.farmerDetails.crops.split(',').map(c => c.trim()).filter(c => c)
        }
      };

      const data = await authService.updateProfile(updateData);
      updateUser(data.user);
      setEditing(false);
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.updateError'));
    }
  };

  const handleLanguageChange = async (newLang) => {
    changeLanguage(newLang);
    try {
      await authService.updateProfile({ language: newLang });
      toast.success(t('profile.languageUpdated'));
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">{t('common.profile')}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
              <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full capitalize">
                {user?.verificationStatus}
              </span>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Farmer Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  {t('profile.farmDetails')}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.address')}
                    </label>
                    <input
                      type="text"
                      value={formData.farmerDetails.address}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        farmerDetails: { ...formData.farmerDetails, address: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.village')}
                      </label>
                      <input
                        type="text"
                        value={formData.farmerDetails.village}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          farmerDetails: { ...formData.farmerDetails, village: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.district')}
                      </label>
                      <input
                        type="text"
                        value={formData.farmerDetails.district}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          farmerDetails: { ...formData.farmerDetails, district: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.state')}
                      </label>
                      <input
                        type="text"
                        value={formData.farmerDetails.state}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          farmerDetails: { ...formData.farmerDetails, state: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.pincode')}
                      </label>
                      <input
                        type="text"
                        value={formData.farmerDetails.pincode}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          farmerDetails: { ...formData.farmerDetails, pincode: e.target.value }
                        })}
                        maxLength="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.landSize')}
                    </label>
                    <input
                      type="number"
                      value={formData.farmerDetails.landSize}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        farmerDetails: { ...formData.farmerDetails, landSize: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.crops')}
                    </label>
                    <input
                      type="text"
                      value={formData.farmerDetails.crops}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        farmerDetails: { ...formData.farmerDetails, crops: e.target.value }
                      })}
                      placeholder={t('profile.cropsPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold"
                >
                  {t('profile.saveChanges')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-primary" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-primary" />
                <span>{user?.phone}</span>
              </div>
              
              {/* Farm Details Display */}
              {user?.farmerDetails?.village && (
                <>
                  <div className="border-t pt-3 mt-3">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-primary" />
                      {t('profile.farmDetails')}
                    </h3>
                  </div>
                  
                  {user.farmerDetails.address && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">{t('profile.address')}</p>
                        <p className="text-sm">{user.farmerDetails.address}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>
                      {user.farmerDetails.village}, {user.farmerDetails.district}, {user.farmerDetails.state}
                      {user.farmerDetails.pincode && ` - ${user.farmerDetails.pincode}`}
                    </span>
                  </div>

                  {user.farmerDetails.landSize && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Leaf className="w-5 h-5 text-primary" />
                      <span>{t('profile.landSizeLabel')}: {user.farmerDetails.landSize} {t('profile.acres')}</span>
                    </div>
                  )}

                  {user.farmerDetails.crops && user.farmerDetails.crops.length > 0 && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <Leaf className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">{t('profile.cropsLabel')}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.farmerDetails.crops.map((crop, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={() => setEditing(true)}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold mt-4"
              >
                {t('profile.editProfile')}
              </button>
            </div>
          )}
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('common.settings')}
          </h3>

          {/* Language Setting */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-semibold text-gray-700">{t('common.language')}</span>
            </div>
            <div className="flex gap-3">
              {['en', 'hi', 'mr'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    language === lang
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Guide Setting */}
          <div>
            <div className="flex items-center justify-between py-3 border-t">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-700">{t('profile.voiceGuide')}</span>
              </div>
              <button
                onClick={toggleVoice}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isEnabled ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-4 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          {t('common.logout')}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;