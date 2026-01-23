const Contract = require('../models/Contract');
const ContractApplication = require('../models/ContractApplication');
const User = require('../models/User');

exports.createContract = async (req, res) => {
  try {
    const {
      cropType,
      quantity,
      unit,
      agreedPrice,
      duration,
      location,
      description,
      terms
    } = req.body;
    
    const contractData = {
      company: req.userId,
      cropType,
      quantity,
      unit: unit || 'quintal',
      agreedPrice,
      duration,
      location,
      description,
      terms: terms || ''
    };
    
    const contract = await Contract.create(contractData);
    
    res.status(201).json({
      success: true,
      message: 'Contract created successfully. Upload legal contract after selecting a farmer.',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllContracts = async (req, res) => {
  try {
    const { cropType, district, state, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { isActive: true };
    
    if (cropType) filter.cropType = cropType;
    if (district) filter['location.district'] = district;
    if (state) filter['location.state'] = state;
    if (status) filter.status = status;
    
    const contracts = await Contract.find(filter)
      .populate('company', 'name email companyDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Contract.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: contracts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      contracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await Contract.findById(contractId)
      .populate('company', 'name email phone companyDetails');
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    res.status(200).json({
      success: true,
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCompanyContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ company: req.userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contracts.length,
      contracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.applyToContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { proposedQuantity, farmerLocation, farmerMessage, experience } = req.body;
    
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    if (!contract.isActive || contract.status === 'completed' || contract.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Contract is not available for applications'
      });
    }
    
    const existingApplication = await ContractApplication.findOne({
      contract: contractId,
      farmer: req.userId
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this contract'
      });
    }
    
    const application = await ContractApplication.create({
      contract: contractId,
      farmer: req.userId,
      proposedQuantity,
      farmerLocation: farmerLocation || {},
      farmerMessage: farmerMessage || '',
      experience: experience || ''
    });
    
    contract.applicationsCount += 1;
    await contract.save();
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getContractApplications = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await Contract.findOne({
      _id: contractId,
      company: req.userId
    });
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found or access denied'
      });
    }
    
    const applications = await ContractApplication.find({ contract: contractId })
      .populate('farmer', 'name email phone farmerDetails')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFarmerApplications = async (req, res) => {
  try {
    const applications = await ContractApplication.find({ farmer: req.userId })
      .populate('contract')
      .populate({
        path: 'contract',
        populate: {
          path: 'company',
          select: 'name email companyDetails'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, companyRemarks } = req.body;
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const application = await ContractApplication.findById(applicationId)
      .populate('contract');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    if (application.contract.company.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    application.status = status;
    application.companyRemarks = companyRemarks || '';
    
    if (status === 'accepted') {
      application.acceptedAt = new Date();
      application.contract.status = 'active';
      await application.contract.save();
    } else {
      application.rejectedAt = new Date();
    }
    
    await application.save();
    
    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.verifyLegalContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { status, remarks } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    if (!contract.legalContractFile) {
      return res.status(400).json({
        success: false,
        message: 'No legal contract file uploaded'
      });
    }
    
    contract.legalContractVerification.status = status;
    contract.legalContractVerification.verifiedBy = req.userId;
    contract.legalContractVerification.verifiedAt = new Date();
    contract.legalContractVerification.remarks = remarks || '';
    
    await contract.save();
    
    res.status(200).json({
      success: true,
      message: `Legal contract ${status} successfully`,
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateContractStatus = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'approved', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    contract.status = status;
    await contract.save();
    
    res.status(200).json({
      success: true,
      message: 'Contract status updated successfully',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Add after existing functions

exports.uploadLegalContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await Contract.findOne({
      _id: contractId,
      company: req.userId
    });
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found or access denied'
      });
    }
    
    if (!contract.selectedFarmer) {
      return res.status(400).json({
        success: false,
        message: 'Please select a farmer before uploading legal contract'
      });
    }
    
    if (req.file) {
      contract.legalContractFile = {
        filename: req.file.filename,
        path: req.file.path,
        uploadedAt: new Date()
      };
      
      await contract.save();
      
      res.status(200).json({
        success: true,
        message: 'Legal contract uploaded successfully',
        contract
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.selectFarmer = async (req, res) => {
  try {
    const { contractId, applicationId } = req.params;
    
    const contract = await Contract.findOne({
      _id: contractId,
      company: req.userId
    });
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found or access denied'
      });
    }
    
    const application = await ContractApplication.findById(applicationId);
    
    if (!application || application.contract.toString() !== contractId) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    contract.selectedFarmer = application.farmer;
    contract.status = 'approved';
    await contract.save();
    
    application.status = 'accepted';
    application.acceptedAt = new Date();
    await application.save();
    
    // Reject other applications
    await ContractApplication.updateMany(
      { 
        contract: contractId,
        _id: { $ne: applicationId }
      },
      { 
        status: 'rejected',
        rejectedAt: new Date(),
        companyRemarks: 'Another farmer was selected'
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Farmer selected successfully',
      contract,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { paymentType, amount, status } = req.body;
    
    const contract = await Contract.findOne({
      _id: contractId,
      company: req.userId
    });
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found or access denied'
      });
    }
    
    if (paymentType === 'advance') {
      contract.paymentDetails.advancePayment.amount = amount;
      contract.paymentDetails.advancePayment.status = status;
      if (status === 'paid') {
        contract.paymentDetails.advancePayment.paidDate = new Date();
      }
    } else if (paymentType === 'final') {
      contract.paymentDetails.finalPayment.amount = amount;
      contract.paymentDetails.finalPayment.status = status;
      if (status === 'paid') {
        contract.paymentDetails.finalPayment.paidDate = new Date();
      }
    }
    
    contract.paymentDetails.totalPaid = 
      (contract.paymentDetails.advancePayment.status === 'paid' ? contract.paymentDetails.advancePayment.amount : 0) +
      (contract.paymentDetails.finalPayment.status === 'paid' ? contract.paymentDetails.finalPayment.amount : 0);
    
    await contract.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addDelivery = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { quantity, notes } = req.body;
    
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    contract.deliveryStatus.deliveries.push({
      quantity,
      date: new Date(),
      notes: notes || ''
    });
    
    contract.deliveryStatus.quantityDelivered += quantity;
    
    if (contract.deliveryStatus.quantityDelivered >= contract.quantity) {
      contract.status = 'completed';
      contract.completedAt = new Date();
    } else {
      contract.status = 'in_progress';
    }
    
    await contract.save();
    
    res.status(200).json({
      success: true,
      message: 'Delivery recorded successfully',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markAsInProgress = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    contract.status = 'in_progress';
    await contract.save();
    
    res.status(200).json({
      success: true,
      message: 'Contract marked as in progress',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markAsCompleted = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    contract.status = 'completed';
    contract.completedAt = new Date();
    await contract.save();
    
    res.status(200).json({
      success: true,
      message: 'Contract marked as completed',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { reason } = req.body;
    
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    contract.status = 'cancelled';
    contract.cancelledAt = new Date();
    contract.cancellationReason = reason || '';
    await contract.save();
    
    res.status(200).json({
      success: true,
      message: 'Contract cancelled',
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};