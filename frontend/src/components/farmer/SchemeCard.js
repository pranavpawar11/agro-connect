import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

const SchemeCard = ({ scheme }) => {
  const navigate = useNavigate();

  const getCategoryColor = (category) => {
    const colors = {
      subsidy: 'bg-green-100 text-green-800',
      loan: 'bg-blue-100 text-blue-800',
      insurance: 'bg-purple-100 text-purple-800',
      training: 'bg-orange-100 text-orange-800',
      equipment: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  return (
    <div
      onClick={() => navigate(`/farmer/schemes/${scheme._id}`)}
      className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary-light p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{scheme.name}</h3>
            <p className="text-sm text-gray-600">{scheme.state}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getCategoryColor(scheme.category)}`}>
          {scheme.category}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{scheme.description}</p>

      <button className="w-full flex items-center justify-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors">
        View Details
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SchemeCard;