import Inquiry from '../models/Inquiry.js';

// @desc    Get all inquiries
// @route   GET /api/inquiries
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an inquiry
// @route   POST /api/inquiries
export const createInquiry = async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }

  try {
    const inquiry = await Inquiry.create({ name, email, phone, message });
    res.status(201).json({ status: 'success', data: inquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
export const updateInquiryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status && status !== 'read' && status !== 'unread') {
    return res.status(400).json({ message: "Status must be 'read' or 'unread'" });
  }

  try {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry.status = status || inquiry.status;
    await inquiry.save();
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
export const deleteInquiry = async (req, res) => {
  const { id } = req.params;

  try {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    await inquiry.deleteOne();
    res.status(200).json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
