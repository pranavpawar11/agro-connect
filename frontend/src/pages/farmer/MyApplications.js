import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import { formatDate, formatPrice } from '../../utils/helpers';

const MyApplications = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await contractService.getFarmerApplications();
      setApplications(data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">My Applications</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <Loading />
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application._id} className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 capitalize">
                      {application.contract?.cropType}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {application.contract?.company?.companyDetails?.companyName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-3">
                  <p><span className="font-semibold">Quantity:</span> {application.proposedQuantity} {application.contract?.unit}</p>
                  <p><span className="font-semibold">Price:</span> {formatPrice(application.contract?.agreedPrice)} per {application.contract?.unit}</p>
                  <p><span className="font-semibold">Applied on:</span> {formatDate(application.createdAt)}</p>
                </div>

                {application.companyRemarks && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Company Remarks:</p>
                    <p className="text-sm text-gray-700">{application.companyRemarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No applications yet</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyApplications;