import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, Globe, Phone, Tag } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import schemeService from '../../services/schemeService';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { SCHEME_CATEGORIES } from '../../utils/constants';

const SchemeManagement = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_hi: '',
    name_mr: '',
    description_en: '',
    description_hi: '',
    description_mr: '',
    eligibility_en: '',
    eligibility_hi: '',
    eligibility_mr: '',
    steps_en: '',
    steps_hi: '',
    steps_mr: '',
    documents_en: '',
    documents_hi: '',
    documents_mr: '',
    benefits_en: '',
    benefits_hi: '',
    benefits_mr: '',
    state: '',
    category: 'subsidy',
    officialWebsite: '',
    contactNumber: '',
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const data = await schemeService.getAllSchemes();
      setSchemes(data.schemes);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const schemeData = {
        name: { en: formData.name_en, hi: formData.name_hi, mr: formData.name_mr },
        description: { en: formData.description_en, hi: formData.description_hi, mr: formData.description_mr },
        eligibility: { en: formData.eligibility_en, hi: formData.eligibility_hi, mr: formData.eligibility_mr },
        steps: { en: formData.steps_en, hi: formData.steps_hi, mr: formData.steps_mr },
        documents: { en: formData.documents_en, hi: formData.documents_hi, mr: formData.documents_mr },
        benefits: { en: formData.benefits_en, hi: formData.benefits_hi, mr: formData.benefits_mr },
        state: formData.state,
        category: formData.category,
        officialWebsite: formData.officialWebsite,
        contactNumber: formData.contactNumber,
      };

      if (editMode && selectedScheme) {
        await schemeService.updateScheme(selectedScheme._id, schemeData);
        toast.success('Scheme updated successfully');
      } else {
        await schemeService.createScheme(schemeData);
        toast.success('Scheme created successfully');
      }

      resetForm();
      fetchSchemes();
    } catch (error) {
      console.error('Error saving scheme:', error);
    }
  };

  const handleEdit = (scheme) => {
    setSelectedScheme(scheme);
    setEditMode(true);
    setFormData({
      name_en: scheme.name.en || '',
      name_hi: scheme.name.hi || '',
      name_mr: scheme.name.mr || '',
      description_en: scheme.description.en || '',
      description_hi: scheme.description.hi || '',
      description_mr: scheme.description.mr || '',
      eligibility_en: scheme.eligibility.en || '',
      eligibility_hi: scheme.eligibility.hi || '',
      eligibility_mr: scheme.eligibility.mr || '',
      steps_en: scheme.steps.en || '',
      steps_hi: scheme.steps.hi || '',
      steps_mr: scheme.steps.mr || '',
      documents_en: scheme.documents.en || '',
      documents_hi: scheme.documents.hi || '',
      documents_mr: scheme.documents.mr || '',
      benefits_en: scheme.benefits?.en || '',
      benefits_hi: scheme.benefits?.hi || '',
      benefits_mr: scheme.benefits?.mr || '',
      state: scheme.state || '',
      category: scheme.category || 'subsidy',
      officialWebsite: scheme.officialWebsite || '',
      contactNumber: scheme.contactNumber || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (schemeId) => {
    if (window.confirm('Are you sure you want to delete this scheme?')) {
      try {
        await schemeService.deleteScheme(schemeId);
        toast.success('Scheme deleted successfully');
        fetchSchemes();
      } catch (error) {
        console.error('Error deleting scheme:', error);
      }
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedScheme(null);
    setFormData({
      name_en: '', name_hi: '', name_mr: '',
      description_en: '', description_hi: '', description_mr: '',
      eligibility_en: '', eligibility_hi: '', eligibility_mr: '',
      steps_en: '', steps_hi: '', steps_mr: '',
      documents_en: '', documents_hi: '', documents_mr: '',
      benefits_en: '', benefits_hi: '', benefits_mr: '',
      state: '', category: 'subsidy', officialWebsite: '', contactNumber: '',
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      subsidy: 'bg-green-100 text-green-800 border border-green-200',
      loan: 'bg-blue-100 text-blue-800 border border-blue-200',
      insurance: 'bg-purple-100 text-purple-800 border border-purple-200',
      training: 'bg-orange-100 text-orange-800 border border-orange-200',
      equipment: 'bg-red-100 text-red-800 border border-red-200',
      other: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    };
    return colors[category] || colors.other;
  };

  const inputClass = "w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all";
  const textareaClass = `${inputClass} resize-none`;
  const sectionHeaderClass = "flex items-center gap-2 font-black text-neutral-800 mb-3 pb-2 border-b-2 border-neutral-100";

  return (
    <div className="flex h-screen bg-gradient-mesh-light farmland-pattern">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6">
          {/* Hero Header */}
          <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-900" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/5 rounded-full" />
            <div className="absolute top-4 right-40 w-32 h-32 bg-indigo-300/10 rounded-full" />

            <div className="relative p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-indigo-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-display font-black text-white tracking-tight">
                    Scheme Management
                  </h1>
                  <p className="text-indigo-100 text-lg mt-1">Create and manage government schemes for farmers</p>
                </div>
              </div>
              <button
                onClick={() => { setEditMode(false); setShowModal(true); }}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-2xl border border-white/30 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Scheme
              </button>
            </div>
          </div>

          {/* Schemes Table */}
          <div className="glass-card rounded-3xl border-2 border-white/50 shadow-soft overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loading />
              </div>
            ) : schemes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-neutral-50 to-indigo-50 border-b border-neutral-200">
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Scheme Name</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">State</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Website</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {schemes.map((scheme, index) => (
                      <tr
                        key={scheme._id}
                        className="hover:bg-indigo-50/50 transition-colors duration-150 animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-800">{scheme.name?.en}</p>
                              {scheme.name?.hi && (
                                <p className="text-xs text-neutral-500 mt-0.5">{scheme.name.hi}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getCategoryColor(scheme.category)}`}>
                            {scheme.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-700 font-medium text-sm">
                          {scheme.state || <span className="text-neutral-400 italic">All States</span>}
                        </td>
                        <td className="px-6 py-4">
                          {scheme.officialWebsite ? (
                            <a
                              href={scheme.officialWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              Visit
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-neutral-600 text-sm">{formatDate(scheme.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(scheme)}
                              className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 hover:scale-110 transition-all duration-200 border border-indigo-100"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(scheme._id)}
                              className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:scale-110 transition-all duration-200 border border-red-100"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-12 h-12 text-indigo-400" />
                </div>
                <p className="text-neutral-500 font-semibold text-lg">No schemes found</p>
                <p className="text-neutral-400 text-sm mt-1">Add your first government scheme to get started</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-3xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900">
                  {editMode ? 'Edit Scheme' : 'Create New Scheme'}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Info */}
              <div>
                <h3 className={sectionHeaderClass}>
                  <Tag className="w-4 h-4 text-indigo-500" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className={inputClass}
                      placeholder="e.g., Maharashtra (blank for all)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={inputClass}
                    >
                      {SCHEME_CATEGORIES?.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      )) || (
                        <>
                          <option value="subsidy">Subsidy</option>
                          <option value="loan">Loan</option>
                          <option value="insurance">Insurance</option>
                          <option value="training">Training</option>
                          <option value="equipment">Equipment</option>
                          <option value="other">Other</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">
                      <Globe className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />
                      Official Website
                    </label>
                    <input
                      type="url"
                      value={formData.officialWebsite}
                      onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">
                      <Phone className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className={inputClass}
                      placeholder="1800-xxx-xxxx"
                    />
                  </div>
                </div>
              </div>

              {/* Scheme Name */}
              <div>
                <h3 className={sectionHeaderClass}>Scheme Name</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[['name_en', 'English *', true], ['name_hi', 'Hindi'], ['name_mr', 'Marathi']].map(([field, label, required]) => (
                    <div key={field}>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">{label}</label>
                      <input
                        type="text"
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        required={!!required}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className={sectionHeaderClass}>Description</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[['description_en', 'English *', true], ['description_hi', 'Hindi'], ['description_mr', 'Marathi']].map(([field, label, required]) => (
                    <div key={field}>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">{label}</label>
                      <textarea
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        required={!!required}
                        rows="3"
                        className={textareaClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility */}
              <div>
                <h3 className={sectionHeaderClass}>Eligibility</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[['eligibility_en', 'English *', true], ['eligibility_hi', 'Hindi'], ['eligibility_mr', 'Marathi']].map(([field, label, required]) => (
                    <div key={field}>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">{label}</label>
                      <textarea
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        required={!!required}
                        rows="3"
                        className={textareaClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Steps */}
              <div>
                <h3 className={sectionHeaderClass}>Application Steps</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[['steps_en', 'English *', true], ['steps_hi', 'Hindi'], ['steps_mr', 'Marathi']].map(([field, label, required]) => (
                    <div key={field}>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">{label}</label>
                      <textarea
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        required={!!required}
                        rows="3"
                        className={textareaClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h3 className={sectionHeaderClass}>Required Documents</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[['documents_en', 'English *', true], ['documents_hi', 'Hindi'], ['documents_mr', 'Marathi']].map(([field, label, required]) => (
                    <div key={field}>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">{label}</label>
                      <textarea
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        required={!!required}
                        rows="3"
                        className={textareaClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className={sectionHeaderClass}>Benefits</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[['benefits_en', 'English'], ['benefits_hi', 'Hindi'], ['benefits_mr', 'Marathi']].map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">{label}</label>
                      <textarea
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        rows="3"
                        className={textareaClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white border-t border-neutral-100 pb-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
                >
                  {editMode ? 'Update Scheme' : 'Create Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeManagement;
