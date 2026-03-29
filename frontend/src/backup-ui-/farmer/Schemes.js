import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import SchemeCard from '../../components/farmer/SchemeCard';
import Loading from '../../components/common/Loading';
import schemeService from '../../services/schemeService';
import useAuth from '../../hooks/useAuth';
import { SCHEME_CATEGORIES } from '../../utils/constants';

const Schemes = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  const fetchSchemes = async () => {
    try {
      const currentLang = user?.language || i18n.language || 'en';
      const filters = {
        language: currentLang,
      };
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      const data = await schemeService.getAllSchemes(filters);
      setSchemes(data.schemes);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative p-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('farmer.schemes')}
            </h1>
            <p className="text-purple-100 text-sm mt-0.5">Government welfare programs</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="glass-effect mx-4 mt-4 rounded-2xl shadow-soft border border-neutral-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-purple-600" />
          <span className="font-bold text-neutral-800">{t('scheme.category')}:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-medium'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {t('scheme.all')}
          </button>
          {SCHEME_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-medium'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {t(`scheme.category_${category}`) || category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 animate-fade-in">
        {loading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : schemes.length > 0 ? (
          <div className="space-y-4">
            {schemes.map((scheme) => (
              <SchemeCard key={scheme._id} scheme={scheme} />
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-3xl p-12 text-center border border-neutral-200">
            <div className="bg-neutral-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-semibold mb-1">{t('scheme.noSchemes')}</p>
            <p className="text-sm text-neutral-500">Try selecting a different category</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Schemes;
