const Scheme = require('../models/Scheme');

exports.createScheme = async (req, res) => {
  try {
    const {
      name,
      description,
      eligibility,
      steps,
      documents,
      benefits,
      state,
      category,
      officialWebsite,
      contactNumber
    } = req.body;
    
    const scheme = await Scheme.create({
      name,
      description,
      eligibility,
      steps,
      documents,
      benefits,
      state,
      category,
      officialWebsite,
      contactNumber,
      createdBy: req.userId
    });
    
    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      scheme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllSchemes = async (req, res) => {
  try {
    const { state, category, language } = req.query;
    
    const filter = { isActive: true };
    
    if (state) filter.state = state;
    if (category) filter.category = category;
    
    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
    
    if (language && ['hi', 'mr'].includes(language)) {
      const translatedSchemes = schemes.map(scheme => {
        return {
          _id: scheme._id,
          name: scheme.name[language] || scheme.name.en,
          description: scheme.description[language] || scheme.description.en,
          eligibility: scheme.eligibility[language] || scheme.eligibility.en,
          steps: scheme.steps[language] || scheme.steps.en,
          documents: scheme.documents[language] || scheme.documents.en,
          benefits: scheme.benefits?.[language] || scheme.benefits?.en || '',
          state: scheme.state,
          category: scheme.category,
          officialWebsite: scheme.officialWebsite,
          contactNumber: scheme.contactNumber,
          createdAt: scheme.createdAt
        };
      });
      
      return res.status(200).json({
        success: true,
        count: translatedSchemes.length,
        schemes: translatedSchemes
      });
    }
    
    res.status(200).json({
      success: true,
      count: schemes.length,
      schemes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSchemeById = async (req, res) => {
  try {
    const { schemeId } = req.params;
    const { language } = req.query;
    
    const scheme = await Scheme.findById(schemeId);
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }
    
    if (language && ['hi', 'mr'].includes(language)) {
      const translatedScheme = {
        _id: scheme._id,
        name: scheme.name[language] || scheme.name.en,
        description: scheme.description[language] || scheme.description.en,
        eligibility: scheme.eligibility[language] || scheme.eligibility.en,
        steps: scheme.steps[language] || scheme.steps.en,
        documents: scheme.documents[language] || scheme.documents.en,
        benefits: scheme.benefits?.[language] || scheme.benefits?.en || '',
        state: scheme.state,
        category: scheme.category,
        officialWebsite: scheme.officialWebsite,
        contactNumber: scheme.contactNumber,
        createdAt: scheme.createdAt
      };
      
      return res.status(200).json({
        success: true,
        scheme: translatedScheme
      });
    }
    
    res.status(200).json({
      success: true,
      scheme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateScheme = async (req, res) => {
  try {
    const { schemeId } = req.params;
    
    const scheme = await Scheme.findByIdAndUpdate(
      schemeId,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Scheme updated successfully',
      scheme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteScheme = async (req, res) => {
  try {
    const { schemeId } = req.params;
    
    const scheme = await Scheme.findByIdAndUpdate(
      schemeId,
      { isActive: false },
      { new: true }
    );
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Scheme deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};