import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, FileText, Phone, Globe, Volume2, Award } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 text-white overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-display font-bold">{t('farmer.schemes')}</h1>
                    </div>
                    {isEnabled && (
                        <button 
                            onClick={handleSpeak} 
                            className="p-3 glass-effect backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all"
                        >
                            <Volume2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4 animate-fade-in">
                {/* Title Card */}
                <div className="glass-effect rounded-3xl shadow-strong p-6 border border-neutral-200">
                    <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-4 rounded-2xl shadow-soft shrink-0">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
                                {getLocalizedText(scheme.name)}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-4 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 text-sm font-bold rounded-full capitalize border border-purple-300">
                                    {scheme.category}
                                </span>
                                <span className="px-4 py-1.5 bg-neutral-100 text-neutral-700 text-sm font-semibold rounded-full border border-neutral-300">
                                    📍 {scheme.state}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="glass-effect rounded-2xl shadow-soft p-6 border border-neutral-200">
                    <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-700 rounded-full"></div>
                        {t('scheme.description')}
                    </h3>
                    <p className="text-neutral-700 leading-relaxed">
                        {getLocalizedText(scheme.description)}
                    </p>
                </div>

                {/* Eligibility */}
                <div className="glass-effect rounded-2xl shadow-soft p-6 border border-neutral-200">
                    <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success-600" />
                        {t('scheme.eligibility')}
                    </h3>
                    <p className="text-neutral-700 leading-relaxed">
                        {getLocalizedText(scheme.eligibility)}
                    </p>
                </div>

                {/* Steps */}
                <div className="glass-effect rounded-2xl shadow-soft p-6 border border-neutral-200">
                    <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-accent-500 to-accent-700 rounded-full"></div>
                        {t('scheme.howToApply')}
                    </h3>
                    <div className="text-neutral-700 leading-relaxed whitespace-pre-line">
                        {getLocalizedText(scheme.steps)}
                    </div>
                </div>

                {/* Documents */}
                <div className="glass-effect rounded-2xl shadow-soft p-6 border border-neutral-200">
                    <h3 className="font-bold text-lg text-neutral-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-accent-600" />
                        {t('scheme.requiredDocuments')}
                    </h3>
                    <p className="text-neutral-700 leading-relaxed">
                        {getLocalizedText(scheme.documents)}
                    </p>
                </div>

                {/* Benefits */}
                {scheme.benefits && (
                    <div className="bg-gradient-to-br from-success-500 to-success-700 rounded-2xl shadow-strong p-6 text-white">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            {t('scheme.benefits')}
                        </h3>
                        <p className="leading-relaxed opacity-95">
                            {getLocalizedText(scheme.benefits)}
                        </p>
                    </div>
                )}

                {/* Contact Info */}
                <div className="glass-effect rounded-2xl shadow-soft p-6 border border-neutral-200 space-y-4">
                    <h3 className="font-bold text-lg text-neutral-800 mb-3">
                        {t('scheme.contactInformation')}
                    </h3>
                    {scheme.contactNumber && (
                        <a 
                            href={`tel:${scheme.contactNumber}`}
                            className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group"
                        >
                            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-xl">
                                <Phone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-primary-700 mb-0.5">Phone</p>
                                <p className="font-bold text-primary-900 group-hover:underline">
                                    {scheme.contactNumber}
                                </p>
                            </div>
                        </a>
                    )}
                    {scheme.officialWebsite && (
                        <a 
                            href={scheme.officialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-accent-50 rounded-xl hover:bg-accent-100 transition-colors group"
                        >
                            <div className="bg-gradient-to-br from-accent-500 to-accent-700 p-3 rounded-xl">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-accent-700 mb-0.5">Website</p>
                                <p className="font-bold text-accent-900 truncate group-hover:underline">
                                    {scheme.officialWebsite}
                                </p>
                            </div>
                        </a>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default SchemeDetail;
