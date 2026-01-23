import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, Eye } from 'lucide-react';
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
        name: {
          en: formData.name_en,
          hi: formData.name_hi,
          mr: formData.name_mr,
        },
        description: {
          en: formData.description_en,
          hi: formData.description_hi,
          mr: formData.description_mr,
        },
        eligibility: {
          en: formData.eligibility_en,
          hi: formData.eligibility_hi,
          mr: formData.eligibility_mr,
        },
        steps: {
          en: formData.steps_en,
          hi: formData.steps_hi,
          mr: formData.steps_mr,
        },
        documents: {
          en: formData.documents_en,
          hi: formData.documents_hi,
          mr: formData.documents_mr,
        },
        benefits: {
          en: formData.benefits_en,
          hi: formData.benefits_hi,
          mr: formData.benefits_mr,
        },
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
  };

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
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Scheme Management</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Scheme
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <Loading />
            ) : schemes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Scheme Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">State</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {schemes.map((scheme) => (
                      <tr key={scheme._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{scheme.name.en}</td>
                        <td className="px-6 py-4 text-gray-700">{scheme.state}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getCategoryColor(scheme.category)}`}>
                            {scheme.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{scheme.contactNumber || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(scheme.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(scheme)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(scheme._id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No schemes found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Scheme Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            <div className="p-6 border-b sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-2xl font-bold text-gray-800">
                {editMode ? 'Edit Scheme' : 'Add New Scheme'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {SCHEME_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Official Website
                  </label>
                  <input
                    type="url"
                    value={formData.officialWebsite}
                    onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Multi-language Fields */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">Scheme Name</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">English *</label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hindi</label>
                    <input
                      type="text"
                      value={formData.name_hi}
                      onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marathi</label>
                    <input
                      type="text"
                      value={formData.name_mr}
                      onChange={(e) => setFormData({ ...formData, name_mr: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">Description</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">English *</label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      required
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hindi</label>
                    <textarea
                      value={formData.description_hi}
                      onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marathi</label>
                    <textarea
                      value={formData.description_mr}
                      onChange={(e) => setFormData({ ...formData, description_mr: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">Eligibility</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">English *</label>
                    <textarea
                      value={formData.eligibility_en}
                      onChange={(e) => setFormData({ ...formData, eligibility_en: e.target.value })}
                      required
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hindi</label>
                    <textarea
                      value={formData.eligibility_hi}
                      onChange={(e) => setFormData({ ...formData, eligibility_hi: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marathi</label>
                    <textarea
                      value={formData.eligibility_mr}
                      onChange={(e) => setFormData({ ...formData, eligibility_mr: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">Application Steps</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">English *</label>
                    <textarea
                      value={formData.steps_en}
                      onChange={(e) => setFormData({ ...formData, steps_en: e.target.value })}
                      required
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hindi</label>
                    <textarea
                      value={formData.steps_hi}
                      onChange={(e) => setFormData({ ...formData, steps_hi: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marathi</label>
                    <textarea
                      value={formData.steps_mr}
                      onChange={(e) => setFormData({ ...formData, steps_mr: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">Required Documents</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">English *</label>
                    <textarea
                      value={formData.documents_en}
                      onChange={(e) => setFormData({ ...formData, documents_en: e.target.value })}
                      required
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hindi</label>
                    <textarea
                      value={formData.documents_hi}
                      onChange={(e) => setFormData({ ...formData, documents_hi: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marathi</label>
                    <textarea
                      value={formData.documents_mr}
                      onChange={(e) => setFormData({ ...formData, documents_mr: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">Benefits</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">English</label>
                    <textarea
                      value={formData.benefits_en}
                      onChange={(e) => setFormData({ ...formData, benefits_en: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hindi</label>
                    <textarea
                      value={formData.benefits_hi}
                      onChange={(e) => setFormData({ ...formData, benefits_hi: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marathi</label>
                    <textarea
                      value={formData.benefits_mr}
                      onChange={(e) => setFormData({ ...formData, benefits_mr: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark"
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