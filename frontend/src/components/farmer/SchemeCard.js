import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';

const SchemeCard = ({ scheme }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { user } = useAuth();
  
  // Get the current language from user preference or i18n, fallback to 'en'
  const currentLang = user?.language || i18n.language || 'en';
  
  // Extract the text in the current language with fallback to English
  const name = scheme.name?.[currentLang] || scheme.name?.en || 'Untitled Scheme';
  const description = scheme.description?.[currentLang] || scheme.description?.en || '';
  
  return (
    <div 
      onClick={() => navigate(`/farmer/schemes/${scheme._id}`)}
      className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">
            {name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {description}
          </p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full capitalize">
              {scheme.category}
            </span>
            <span className="text-xs text-gray-500">
              {scheme.state}
            </span>
          </div>
        </div>
        <ChevronRight className="text-gray-400 flex-shrink-0 ml-2" size={20} />
      </div>
    </div>
  );
};

export default SchemeCard;