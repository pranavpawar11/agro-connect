import React, { useEffect, useState } from 'react';
import { TrendingUp, Plus, Trash2, MapPin, Package, Calendar } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import alertService from '../../services/alertService';
import { formatDate, formatPrice } from '../../utils/helpers';
import { toast } from 'react-toastify';

const MandiPriceManagement = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    crop: '',
    market: '',
    district: '',
    state: '',
    price: '',
    unit: 'quintal',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const data = await alertService.getMandiPrices();
      setPrices(data.prices);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrice = async (e) => {
    e.preventDefault();
    try {
      await alertService.createMandiPrice(formData);
      toast.success('Mandi price added successfully');
      setShowModal(false);
      setFormData({
        crop: '',
        market: '',
        district: '',
        state: '',
        price: '',
        unit: 'quintal',
        date: new Date().toISOString().split('T')[0],
      });
      fetchPrices();
    } catch (error) {
      console.error('Error creating price:', error);
    }
  };

  const handleDeletePrice = async (priceId) => {
    if (window.confirm('Are you sure you want to delete this price entry?')) {
      try {
        await alertService.deleteAlert(priceId);
        toast.success('Price entry deleted successfully');
        fetchPrices();
      } catch (error) {
        console.error('Error deleting price:', error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gradient-mesh-light farmland-pattern">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6">
          {/* Hero Header */}
          <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-700 to-green-900" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/5 rounded-full" />
            <div className="absolute top-4 right-40 w-32 h-32 bg-lime-300/10 rounded-full" />

            <div className="relative p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <TrendingUp className="w-8 h-8 text-green-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-display font-black text-white tracking-tight">
                    Mandi Price Management
                  </h1>
                  <p className="text-green-100 text-lg mt-1">Update and manage market commodity prices</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-2xl border border-white/30 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Price
              </button>
            </div>
          </div>

          {/* Prices Table */}
          <div className="glass-card rounded-3xl border-2 border-white/50 shadow-soft overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loading />
              </div>
            ) : prices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-neutral-50 to-green-50 border-b border-neutral-200">
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Crop</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Market</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {prices.map((price, index) => (
                      <tr
                        key={price._id}
                        className="hover:bg-green-50/50 transition-colors duration-150 animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
                              <Package className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-neutral-800 capitalize">{price.mandiPrice?.crop}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-neutral-700">{price.mandiPrice?.market}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-neutral-600 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-green-500" />
                            {price.mandiPrice?.district}, {price.mandiPrice?.state}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                            <span className="font-black text-green-700">{formatPrice(price.mandiPrice?.price)}</span>
                            <span className="text-green-600 text-xs font-semibold">/ {price.mandiPrice?.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-neutral-600 text-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(price.mandiPrice?.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeletePrice(price._id)}
                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:scale-110 transition-all duration-200 border border-red-100"
                            title="Delete Price"
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
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-12 h-12 text-green-400" />
                </div>
                <p className="text-neutral-500 font-semibold text-lg">No price entries found</p>
                <p className="text-neutral-400 text-sm mt-1">Add your first mandi price to get started</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Price Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-bounce-in">
            <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900">Add Mandi Price</h2>
              </div>
            </div>

            <form onSubmit={handleCreatePrice} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">Crop *</label>
                  <input
                    type="text"
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                    placeholder="e.g., Wheat, Rice"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">Market *</label>
                  <input
                    type="text"
                    value={formData.market}
                    onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                    placeholder="e.g., Ahmednagar APMC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">District *</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
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
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                    placeholder="e.g., Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                    placeholder="₹"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                  >
                    <option value="quintal">Quintal</option>
                    <option value="ton">Ton</option>
                    <option value="kg">Kg</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-neutral-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                  />
                </div>
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
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
                >
                  Add Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MandiPriceManagement;
