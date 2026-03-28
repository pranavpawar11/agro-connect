import React, { useEffect, useState } from 'react';
import { Bell, Plus, Trash2, AlertTriangle, MapPin, Clock } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import alertService from '../../services/alertService';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const AlertManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    district: '',
    state: '',
    severity: 'medium',
    message_en: '',
    message_hi: '',
    message_mr: '',
    expiresAt: '',
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await alertService.getWeatherAlerts();
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await alertService.createWeatherAlert({
        district: formData.district,
        state: formData.state,
        severity: formData.severity,
        message: {
          en: formData.message_en,
          hi: formData.message_hi,
          mr: formData.message_mr,
        },
        expiresAt: formData.expiresAt || undefined,
      });
      toast.success('Alert created successfully');
      setShowModal(false);
      setFormData({
        district: '',
        state: '',
        severity: 'medium',
        message_en: '',
        message_hi: '',
        message_mr: '',
        expiresAt: '',
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await alertService.deleteAlert(alertId);
        toast.success('Alert deleted successfully');
        fetchAlerts();
      } catch (error) {
        console.error('Error deleting alert:', error);
      }
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border border-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border border-orange-200',
      critical: 'bg-red-100 text-red-800 border border-red-200',
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityGradient = (severity) => {
    const gradients = {
      low: 'from-blue-500 to-cyan-600',
      medium: 'from-yellow-500 to-orange-500',
      high: 'from-orange-500 to-red-500',
      critical: 'from-red-500 to-pink-600',
    };
    return gradients[severity] || gradients.medium;
  };

  return (
    <div className="flex h-screen bg-gradient-mesh-light farmland-pattern">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6">
          {/* Hero Header */}
          <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
            {/* CSS-only background — no external image needed */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-700 to-rose-800" />
            {/* Decorative circles for depth */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/5 rounded-full" />
            <div className="absolute top-4 right-40 w-32 h-32 bg-yellow-400/10 rounded-full" />

            <div className="relative p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <Bell className="w-8 h-8 text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-display font-black text-white tracking-tight">
                    Weather Alerts
                  </h1>
                  <p className="text-orange-100 text-lg mt-1">Manage district-level weather notifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-2xl border border-white/30 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create Alert
              </button>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="glass-card rounded-3xl border-2 border-white/50 shadow-soft overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loading />
              </div>
            ) : alerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-neutral-50 to-orange-50 border-b border-neutral-200">
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Message (EN)</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Expires</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {alerts.map((alert, index) => (
                      <tr
                        key={alert._id}
                        className="hover:bg-orange-50/50 transition-colors duration-150 animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-orange-100 p-1.5 rounded-lg">
                              <MapPin className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="font-semibold text-neutral-800">
                              {alert.weatherAlert?.district}, {alert.weatherAlert?.state}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getSeverityColor(alert.weatherAlert?.severity)}`}>
                            {alert.weatherAlert?.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-700 max-w-xs">
                          <p className="line-clamp-2 text-sm">{alert.weatherAlert?.message?.en}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-neutral-600 text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(alert.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 text-sm">
                          {alert.expiresAt ? formatDate(alert.expiresAt) : (
                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full text-xs">No expiry</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteAlert(alert._id)}
                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:scale-110 transition-all duration-200 border border-red-100"
                            title="Delete Alert"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-orange-100 to-red-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-12 h-12 text-orange-400" />
                </div>
                <p className="text-neutral-500 font-semibold text-lg">No alerts found</p>
                <p className="text-neutral-400 text-sm mt-1">Create your first weather alert to get started</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900">Create Weather Alert</h2>
              </div>
            </div>

            <form onSubmit={handleCreateAlert} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">District *</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                    placeholder="e.g., Pune"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                    placeholder="e.g., Maharashtra"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Severity *</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Message (English) *</label>
                <textarea
                  value={formData.message_en}
                  onChange={(e) => setFormData({ ...formData, message_en: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all resize-none"
                  placeholder="Alert message in English..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Message (Hindi)</label>
                <textarea
                  value={formData.message_hi}
                  onChange={(e) => setFormData({ ...formData, message_hi: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all resize-none"
                  placeholder="हिंदी में संदेश..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Message (Marathi)</label>
                <textarea
                  value={formData.message_mr}
                  onChange={(e) => setFormData({ ...formData, message_mr: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all resize-none"
                  placeholder="मराठीत संदेश..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Expires At</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
                >
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertManagement;
