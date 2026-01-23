import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import alertService from '../../services/alertService';
import useAuth from '../../hooks/useAuth';
import { formatPrice, formatDate } from '../../utils/helpers';

const MandiPrices = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const data = await alertService.getMandiPrices({
        district: user?.farmerDetails?.district,
        state: user?.farmerDetails?.state,
      });
      setPrices(data.prices);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrices = prices.filter((price) =>
    price.mandiPrice.crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Mandi Prices</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 focus:outline-none"
          />
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <Loading />
        ) : filteredPrices.length > 0 ? (
          <div className="space-y-4">
            {filteredPrices.map((price) => (
              <div key={price._id} className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 capitalize">
                      {price.mandiPrice.crop}
                    </h3>
                    <p className="text-sm text-gray-600">{price.mandiPrice.market}</p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold">{formatPrice(price.mandiPrice.price)}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Per {price.mandiPrice.unit}</p>
                  <p>{price.mandiPrice.district}, {price.mandiPrice.state}</p>
                  <p className="text-xs text-gray-500">{formatDate(price.mandiPrice.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No mandi prices available</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MandiPrices;