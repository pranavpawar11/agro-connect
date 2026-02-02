import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, FileText, Phone, Globe, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import schemeService from '../../services/schemeService';
import useAuth from '../../hooks/useAuth';
import useVoice from '../../hooks/useVoice';

const SchemeDetail = () => {
    const { schemeId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { speak, isEnabled } = useVoice();
    const [scheme, setScheme] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchemeDetail();
    }, [schemeId]);

    const fetchSchemeDetail = async () => {
        try {
            const data = await schemeService.getSchemeById(schemeId, user?.language || 'en');
            setScheme(data.scheme);
        } catch (error) {
            console.error('Error fetching scheme:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get current language
    const currentLang = user?.language || i18n.language || 'en';

    // Helper function to get localized text
    const getLocalizedText = (field) => {
        if (!scheme || !field) return '';
        if (typeof field === 'string') return field; // Already a string
        return field[currentLang] || field.en || ''; // Multilingual object
    };

    const handleSpeak = () => {
        if (scheme) {
            const name = getLocalizedText(scheme.name);
            const description = getLocalizedText(scheme.description);
            const text = `${name}. ${description}`;
            speak(text, currentLang);
        }
    };

    if (loading) return <Loading fullScreen />;
    if (!scheme) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">{t('common.loading')}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">{t('farmer.schemes')}</h1>
                </div>
                {isEnabled && (
                    <button onClick={handleSpeak} className="p-2 bg-white bg-opacity-20 rounded-full">
                        <Volume2 className="w-6 h-6" />
                    </button>
                )}
            </div>

            <div className="p-4 space-y-4">
                {/* Title Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-primary-light p-3 rounded-lg">
                            <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {getLocalizedText(scheme.name)}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-primary-light text-primary text-xs font-semibold rounded-full capitalize">
                                    {scheme.category}
                                </span>
                                <span className="text-sm text-gray-600">{scheme.state}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-gray-800 mb-3">
                        {t('scheme.description')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                        {getLocalizedText(scheme.description)}
                    </p>
                </div>

                {/* Eligibility */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        {t('scheme.eligibility')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                        {getLocalizedText(scheme.eligibility)}
                    </p>
                </div>

                {/* Steps */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-gray-800 mb-3">
                        {t('scheme.howToApply')}
                    </h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {getLocalizedText(scheme.steps)}
                    </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        {t('scheme.requiredDocuments')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                        {getLocalizedText(scheme.documents)}
                    </p>
                </div>

                {/* Benefits */}
                {scheme.benefits && (
                    <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl shadow-lg p-6">
                        <h3 className="font-bold mb-3">{t('scheme.benefits')}</h3>
                        <p className="leading-relaxed">
                            {getLocalizedText(scheme.benefits)}
                        </p>
                    </div>
                )}

                {/* Contact Info */}
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-3">
                    <h3 className="font-bold text-gray-800 mb-3">
                        {t('scheme.contactInformation')}
                    </h3>
                    {scheme.contactNumber && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <Phone className="w-5 h-5 text-primary" />
                            <a 
                                href={`tel:${scheme.contactNumber}`} 
                                className="hover:text-primary"
                            >
                                {scheme.contactNumber}
                            </a>
                        </div>
                    )}
                    {scheme.officialWebsite && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <Globe className="w-5 h-5 text-primary" />
                            <a 
                                href={scheme.officialWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary break-all"
                            >
                                {scheme.officialWebsite}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default SchemeDetail;