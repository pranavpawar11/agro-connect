import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Search, X } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('farmer.contracts')}</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by crop or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 focus:outline-none"
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full bg-white bg-opacity-20 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filters {(filters.cropType || filters.minPrice || filters.maxPrice) && '(Active)'}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Filters</h3>
            <button onClick={() => setShowFilters(false)}>
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
              <input
                type="text"
                value={filters.cropType}
                onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}
                placeholder="e.g., Wheat, Rice"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  value={filters.district}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={clearFilters}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Quick Links */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => navigate('/farmer/applications')}
            className="flex-1 bg-white text-primary border-2 border-primary py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors"
          >
            My Applications
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['approved', 'active', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilters({ ...filters, status })}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
                filters.status === status
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : filteredContracts.length > 0 ? (
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <ContractCard key={contract._id} contract={contract} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No contracts available</p>
            {(searchTerm || filters.cropType || filters.minPrice || filters.maxPrice) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-primary font-semibold hover:underline"
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