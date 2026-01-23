const ContractDispute = require('../models/ContractDispute');
const Contract = require('../models/Contract');

exports.raiseDispute = async (req, res) => {
  try {
    const { contractId, subject, message, priority } = req.body;
    
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    const dispute = await ContractDispute.create({
      contract: contractId,
      raisedBy: req.userId,
      raisedByRole: req.user.role,
      subject,
      message,
      priority: priority || 'medium'
    });
    
    res.status(201).json({
      success: true,
      message: 'Dispute raised successfully',
      dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyDisputes = async (req, res) => {
  try {
    const disputes = await ContractDispute.find({ raisedBy: req.userId })
      .populate('contract', 'cropType quantity agreedPrice')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllDisputes = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    const disputes = await ContractDispute.find(filter)
      .populate('contract', 'cropType quantity agreedPrice')
      .populate('raisedBy', 'name email role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateDisputeStatus = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { status, adminRemarks, actionTaken } = req.body;
    
    const validStatuses = ['open', 'under_review', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const dispute = await ContractDispute.findById(disputeId);
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }
    
    dispute.status = status;
    dispute.adminRemarks = adminRemarks || dispute.adminRemarks;
    dispute.actionTaken = actionTaken || dispute.actionTaken;
    dispute.assignedTo = req.userId;
    
    if (status === 'resolved') {
      dispute.resolvedAt = new Date();
    }
    
    if (status === 'closed') {
      dispute.closedAt = new Date();
    }
    
    await dispute.save();
    
    res.status(200).json({
      success: true,
      message: 'Dispute status updated successfully',
      dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDisputeById = async (req, res) => {
  try {
    const { disputeId } = req.params;
    
    const dispute = await ContractDispute.findById(disputeId)
      .populate('contract')
      .populate('raisedBy', 'name email phone role')
      .populate('assignedTo', 'name email');
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }
    
    res.status(200).json({
      success: true,
      dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};