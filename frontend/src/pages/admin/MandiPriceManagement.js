import React, { useEffect, useState } from 'react';
import { TrendingUp, Plus, Trash2 } from 'lucide-react';
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Mandi Price Management</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Price
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <Loading />
            ) : prices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Crop</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Market</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prices.map((price) => (
                      <tr key={price._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800 capitalize">{price.mandiPrice?.crop}</td>
                        <td className="px-6 py-4 text-gray-700">{price.mandiPrice?.market}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {price.mandiPrice?.district}, {price.mandiPrice?.state}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <span className="font-semibold text-green-600">
                            {formatPrice(price.mandiPrice?.price)}
                          </span> / {price.mandiPrice?.unit}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(price.mandiPrice?.date)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeletePrice(price._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            title="Delete Price"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No price entries found</p>
              </div>
            )}</div>
        </main>
      </div>
  {/* Add Price Modal */}
  {showModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Add Mandi Price</h2>
        </div>

        <form onSubmit={handleCreatePrice} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crop *
              </label>
              <input
                type="text"
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="e.g., Wheat, Rice"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market *
              </label>
              <input
                type="text"
                value={formData.market}
                onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="e.g., Ahmednagar APMC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="1"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="₹"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="quintal">Quintal</option>
                <option value="ton">Ton</option>
                <option value="kg">Kg</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark"
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