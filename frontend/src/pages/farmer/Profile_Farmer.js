import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X, 
  LogOut, Leaf, Award, TrendingUp, Settings 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import useAuth from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSave = () => {
    // TODO: Implement profile update
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-mesh-light farmland-pattern pb-20">
      {/* Hero Header with Background */}
      <div className="relative bg-gradient-to-br from-primary-700 via-emerald-600 to-primary-800 text-white overflow-hidden pb-24">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&auto=format&fit=crop')`,
            backgroundBlendMode: 'overlay',
          }}
        />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-emerald-400 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative p-6 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
              <User className="w-7 h-7" />
              {t('farmer.profile')}
            </h1>
            <button
              onClick={() => navigate('/farmer/settings')}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-colors active:scale-95"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Profile Avatar Card */}
          <div className="glass-effect backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-400 to-primary-600 w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold shadow-strong">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                <p className="text-primary-100 text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Verified Farmer
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">4.8</p>
                <p className="text-primary-100 text-xs">Rating</p>
              </div>
              <div className="text-center border-l border-r border-white/20">
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-primary-100 text-xs">Contracts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-primary-100 text-xs">Years</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-16 space-y-5 animate-fade-in">
        {/* Personal Information Card */}
        <div className="glass-card rounded-3xl shadow-xl p-6 border-2 border-white/50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Personal Information
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-xl font-semibold text-sm hover:bg-primary-200 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
              <User className="w-5 h-5 text-neutral-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-neutral-600 mb-1">Full Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border-2 border-neutral-200 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="font-semibold text-neutral-900">{user?.name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
              <Mail className="w-5 h-5 text-neutral-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-neutral-600 mb-1">Email Address</p>
                <p className="font-semibold text-neutral-900">{user?.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
              <Phone className="w-5 h-5 text-neutral-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-neutral-600 mb-1">Phone Number</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border-2 border-neutral-200 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="font-semibold text-neutral-900">{user?.phone}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
              <MapPin className="w-5 h-5 text-neutral-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-neutral-600 mb-1">Location</p>
                <p className="font-semibold text-neutral-900">
                  {user?.farmerDetails?.village}, {user?.farmerDetails?.district}, {user?.farmerDetails?.state}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
              <Calendar className="w-5 h-5 text-neutral-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-neutral-600 mb-1">Member Since</p>
                <p className="font-semibold text-neutral-900">{formatDate(user?.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Farm Details Card */}
        <div className="glass-card rounded-3xl shadow-xl p-6 border-2 border-white/50">
          <h3 className="text-lg font-bold text-neutral-900 mb-5 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            Farm Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200/50">
              <p className="text-xs text-green-700 mb-1">Land Size</p>
              <p className="text-2xl font-bold text-green-900">{user?.farmerDetails?.landSize || 'N/A'}</p>
              <p className="text-xs text-green-600">acres</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200/50">
              <p className="text-xs text-blue-700 mb-1">Irrigation</p>
              <p className="text-2xl font-bold text-blue-900 capitalize">{user?.farmerDetails?.irrigationType || 'Mixed'}</p>
              <p className="text-xs text-blue-600">type</p>
            </div>
          </div>

          {user?.farmerDetails?.crops && (
            <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200/50">
              <p className="text-xs text-amber-700 mb-2">Primary Crops</p>
              <div className="flex flex-wrap gap-2">
                {user.farmerDetails.crops.map((crop, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-white/80 text-amber-900 text-xs font-bold rounded-lg border border-amber-200 capitalize"
                  >
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Performance Card with Background */}
        <div className="relative overflow-hidden rounded-3xl shadow-xl">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-emerald-900/90 backdrop-blur-sm"></div>
          
          <div className="relative p-6 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Performance Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/80 text-xs mb-1">Total Contracts</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <div>
                <p className="text-white/80 text-xs mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-400">10</p>
              </div>
              <div>
                <p className="text-white/80 text-xs mb-1">Success Rate</p>
                <p className="text-3xl font-bold">83%</p>
              </div>
              <div>
                <p className="text-white/80 text-xs mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-yellow-400">₹2.4L</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-2xl font-bold text-base shadow-strong hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
