import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Settings, Globe, Volume2, LogOut, Leaf, Edit3, Save, X } from 'lucide-react';
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

  const getVerificationBadge = () => {
    const status = user?.verificationStatus;
    if (status === 'verified') return { bg: 'bg-gradient-to-r from-success-500 to-success-600', text: 'Verified' };
    if (status === 'pending') return { bg: 'bg-gradient-to-r from-warning-500 to-warning-600', text: 'Pending' };
    return { bg: 'bg-gradient-to-r from-neutral-400 to-neutral-500', text: status };
  };

  const badge = getVerificationBadge();

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative p-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">{t('common.profile')}</h1>
            <p className="text-primary-100 text-sm mt-0.5">Manage your account</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Profile Card */}
        <div className="glass-effect rounded-3xl shadow-strong border border-neutral-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b border-primary-200">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                  <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-bold text-neutral-900">{user?.name}</h2>
                <p className="text-sm text-neutral-600 capitalize font-medium">{user?.role}</p>
                <span className={`inline-block mt-2 px-4 py-1.5 ${badge.bg} text-white text-xs font-bold rounded-full capitalize shadow-soft`}>
                  {badge.text}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {editing ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">
                      {t('profile.name')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">
                      {t('profile.phone')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Farmer Details */}
                <div className="border-t-2 border-neutral-200 pt-5 mt-5">
                  <h3 className="font-bold text-lg text-neutral-800 mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-primary-700" />
                    {t('profile.farmDetails')}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">
                        {t('profile.address')}
                      </label>
                      <input
                        type="text"
                        value={formData.farmerDetails.address}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          farmerDetails: { ...formData.farmerDetails, address: e.target.value }
                        })}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">
                          {t('profile.village')}
                        </label>
                        <input
                          type="text"
                          value={formData.farmerDetails.village}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            farmerDetails: { ...formData.farmerDetails, village: e.target.value }
                          })}
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">
                          {t('profile.district')}
                        </label>
                        <input
                          type="text"
                          value={formData.farmerDetails.district}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            farmerDetails: { ...formData.farmerDetails, district: e.target.value }
                          })}
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">
                          {t('profile.state')}
                        </label>
                        <input
                          type="text"
                          value={formData.farmerDetails.state}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            farmerDetails: { ...formData.farmerDetails, state: e.target.value }
                          })}
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">
                          {t('profile.pincode')}
                        </label>
                        <input
                          type="text"
                          value={formData.farmerDetails.pincode}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            farmerDetails: { ...formData.farmerDetails, pincode: e.target.value }
                          })}
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">
                        {t('profile.landSize')}
                      </label>
                      <input
                        type="number"
                        value={formData.farmerDetails.landSize}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          farmerDetails: { ...formData.farmerDetails, landSize: e.target.value }
                        })}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">
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
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 bg-neutral-100 text-neutral-700 py-3.5 rounded-xl font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl font-bold shadow-medium hover:shadow-glow transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {t('profile.saveChanges')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <Mail className="w-5 h-5 text-primary-700" />
                  <span className="font-medium text-neutral-800">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <Phone className="w-5 h-5 text-primary-700" />
                  <span className="font-medium text-neutral-800">{user?.phone}</span>
                </div>
                
                {/* Farm Details Display */}
                {user?.farmerDetails?.village && (
                  <>
                    <div className="border-t-2 border-neutral-200 pt-4 mt-4">
                      <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-primary-700" />
                        {t('profile.farmDetails')}
                      </h3>
                    </div>
                    
                    {user.farmerDetails.address && (
                      <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl">
                        <MapPin className="w-5 h-5 text-primary-700 mt-1 shrink-0" />
                        <div>
                          <p className="font-bold text-neutral-800 text-sm">{t('profile.address')}</p>
                          <p className="text-neutral-700">{user.farmerDetails.address}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-primary-700" />
                      <span className="font-medium text-neutral-800">
                        {user.farmerDetails.village}, {user.farmerDetails.district}, {user.farmerDetails.state}
                        {user.farmerDetails.pincode && ` - ${user.farmerDetails.pincode}`}
                      </span>
                    </div>

                    {user.farmerDetails.landSize && (
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                        <Leaf className="w-5 h-5 text-primary-700" />
                        <span className="font-medium text-neutral-800">
                          {t('profile.landSizeLabel')}: {user.farmerDetails.landSize} {t('profile.acres')}
                        </span>
                      </div>
                    )}

                    {user.farmerDetails.crops && user.farmerDetails.crops.length > 0 && (
                      <div className="p-3 bg-neutral-50 rounded-xl">
                        <p className="font-bold text-neutral-800 text-sm mb-2 flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-primary-700" />
                          {t('profile.cropsLabel')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {user.farmerDetails.crops.map((crop, index) => (
                            <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-success-500 to-success-600 text-white text-sm font-semibold rounded-full">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={() => setEditing(true)}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold shadow-medium hover:shadow-glow transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Edit3 className="w-5 h-5" />
                  {t('profile.editProfile')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Settings Card */}
        <div className="glass-effect rounded-3xl shadow-strong p-6 border border-neutral-200">
          <h3 className="font-bold text-lg text-neutral-800 mb-5 flex items-center gap-2">
            <div className="bg-gradient-to-br from-accent-500 to-accent-700 p-2 rounded-xl">
              <Settings className="w-5 h-5 text-white" />
            </div>
            {t('common.settings')}
          </h3>

          {/* Language Setting */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-accent-700" />
              <span className="font-bold text-neutral-800">{t('common.language')}</span>
            </div>
            <div className="flex gap-3">
              {['en', 'hi', 'mr'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-5 py-3 rounded-xl font-bold transition-all ${
                    language === lang
                      ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white shadow-medium'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Guide Setting */}
          <div className="border-t-2 border-neutral-200 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-primary-700" />
                <span className="font-bold text-neutral-800">{t('profile.voiceGuide')}</span>
              </div>
              <button
                onClick={toggleVoice}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-inner ${
                  isEnabled ? 'bg-gradient-to-r from-primary-600 to-primary-700' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-soft transition-transform ${
                    isEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-danger-500 to-danger-600 text-white py-5 rounded-2xl font-bold shadow-strong hover:shadow-glow transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-6 h-6" />
          {t('common.logout')}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
