import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Search, X, ChevronRight, FileText, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import ContractCard from '../../components/farmer/ContractCard';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import useAuth from '../../hooks/useAuth';

const Contracts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cropType: '',
    district: user?.farmerDetails?.district || '',
    state: user?.farmerDetails?.state || '',
    minPrice: '',
    maxPrice: '',
    status: 'approved',
  });

  useEffect(() => {
    fetchContracts();
  }, [filters.status]);

  const fetchContracts = async () => {
    try {
      const queryFilters = {
        status: filters.status,
      };
      
      const data = await contractService.getAllContracts(queryFilters);
      setContracts(data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchContracts();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      cropType: '',
      district: user?.farmerDetails?.district || '',
      state: user?.farmerDetails?.state || '',
      minPrice: '',
      maxPrice: '',
      status: 'approved',
    });
    setSearchTerm('');
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.company?.companyDetails?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCrop = !filters.cropType || contract.cropType.toLowerCase().includes(filters.cropType.toLowerCase());
    const matchesDistrict = !filters.district || contract.location.district.toLowerCase().includes(filters.district.toLowerCase());
    const matchesState = !filters.state || contract.location.state.toLowerCase().includes(filters.state.toLowerCase());
    const matchesMinPrice = !filters.minPrice || contract.agreedPrice >= parseFloat(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || contract.agreedPrice <= parseFloat(filters.maxPrice);
    
    return matchesSearch && matchesCrop && matchesDistrict && matchesState && matchesMinPrice && matchesMaxPrice;
  });

  const hasActiveFilters = filters.cropType || filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
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
              <h1 className="text-xl font-display font-bold">{t('farmer.contracts')}</h1>
              <p className="text-primary-100 text-sm">Browse farming opportunities</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by crop or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-neutral-800 font-medium focus:outline-none focus:ring-4 focus:ring-white/30 transition-all bg-white/95 backdrop-blur-sm shadow-soft"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full glass-effect backdrop-blur-sm border border-white/30 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-all shadow-soft"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters 
            {hasActiveFilters && (
              <span className="bg-secondary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel - Enhanced */}
      {showFilters && (
        <div className="glass-effect mx-4 mt-4 rounded-2xl shadow-strong border border-neutral-200 overflow-hidden animate-slide-down">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 flex items-center justify-between border-b border-primary-200">
            <h3 className="font-bold text-primary-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Contracts
            </h3>
            <button 
              onClick={() => setShowFilters(false)}
              className="p-1.5 hover:bg-primary-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-primary-700" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Crop Type</label>
              <input
                type="text"
                value={filters.cropType}
                onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}
                placeholder="e.g., Wheat, Rice"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">District</label>
                <input
                  type="text"
                  value={filters.district}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">State</label>
                <input
                  type="text"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Min Price (₹)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Max Price (₹)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={clearFilters}
                className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-bold shadow-medium hover:shadow-glow transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 animate-fade-in">
        {/* My Applications Quick Link */}
        <button
          onClick={() => navigate('/farmer/applications')}
          className="group w-full glass-effect border-2 border-primary-300 text-primary-800 py-4 rounded-2xl font-bold shadow-soft hover:shadow-medium hover:border-primary-500 transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          My Applications
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['approved', 'active', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilters({ ...filters, status })}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
                filters.status === status
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-medium'
                  : 'glass-effect text-neutral-700 border border-neutral-200 hover:border-primary-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Contracts List */}
        {loading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : filteredContracts.length > 0 ? (
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <ContractCard key={contract._id} contract={contract} />
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-3xl p-12 text-center border border-neutral-200">
            <div className="bg-neutral-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-semibold mb-2">No contracts available</p>
            {(searchTerm || hasActiveFilters) && (
              <button
                onClick={clearFilters}
                className="mt-3 text-primary-700 font-bold hover:text-primary-800 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Contracts;
