import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Search, IndianRupee, MapPin } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative p-4">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-display font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Mandi Prices
              </h1>
              <p className="text-amber-100 text-sm mt-0.5">Current market rates</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by crop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-neutral-800 font-medium focus:outline-none focus:ring-4 focus:ring-white/30 transition-all bg-white/95 backdrop-blur-sm shadow-soft"
            />
          </div>
        </div>
      </div>

      <div className="p-4 animate-fade-in">
        {loading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : filteredPrices.length > 0 ? (
          <div className="space-y-4">
            {filteredPrices.map((price) => (
              <div 
                key={price._id} 
                className="glass-effect rounded-2xl shadow-soft p-6 border border-neutral-200 hover:shadow-medium transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-neutral-800 capitalize mb-1 flex items-center gap-2">
                      <span className="text-2xl">🌾</span>
                      {price.mandiPrice.crop}
                    </h3>
                    <p className="text-sm text-neutral-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {price.mandiPrice.market}
                    </p>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-3 rounded-xl shadow-soft flex flex-col items-center min-w-[100px]">
                    <div className="flex items-center gap-1 mb-1">
                      <IndianRupee className="w-4 h-4" />
                      <span className="text-xl font-bold">{formatPrice(price.mandiPrice.price)}</span>
                    </div>
                    <span className="text-xs text-green-100">per {price.mandiPrice.unit}</span>
                  </div>
                </div>

                {/* Location & Date Info */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="bg-neutral-50 px-3 py-2 rounded-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-600" />
                    <span className="font-medium text-neutral-700">
                      {price.mandiPrice.district}, {price.mandiPrice.state}
                    </span>
                  </div>
                  <div className="bg-neutral-50 px-3 py-2 rounded-lg text-neutral-600">
                    📅 {formatDate(price.mandiPrice.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-3xl p-12 text-center border border-neutral-200">
            <div className="bg-neutral-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-10 h-10 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-semibold mb-1">No mandi prices available</p>
            <p className="text-sm text-neutral-500">Check back later for updated market rates</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MandiPrices;
