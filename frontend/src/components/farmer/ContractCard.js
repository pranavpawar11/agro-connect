import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, IndianRupee, Package } from 'lucide-react';
import { formatDate, formatPrice } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';

const ContractCard = ({ contract }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      onClick={() => navigate(`/farmer/contracts/${contract._id}`)}
      className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800 capitalize">{contract.cropType}</h3>
          <p className="text-sm text-gray-600">{contract.company?.companyDetails?.companyName}</p>
        </div>
        <span className="px-3 py-1 bg-primary-light text-primary text-xs font-semibold rounded-full">
          {contract.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <Package className="w-4 h-4 mr-2" />
          <span>{contract.quantity} {contract.unit}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <IndianRupee className="w-4 h-4 mr-2" />
          <span>{formatPrice(contract.agreedPrice)} per {contract.unit}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{contract.location.district}, {contract.location.state}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{formatDate(contract.duration.startDate)} - {formatDate(contract.duration.endDate)}</span>
        </div>
      </div>

      <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
        {t('contract.viewDetails')}
      </button>
    </div>
  );
};

export default ContractCard;