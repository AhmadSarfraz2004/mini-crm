const Lead = require('../models/Lead');

// Create a new lead
const createLead = async (req, res) => {
    try {
        const { name, email, phone, assignedTo } = req.body;

        const lead = await Lead.create({
            name,
            email,
            phone,
            assignedTo
        });

        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
};

// GET ALL LEADS WITH PAGINATION
const getLeads = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 5;

        const totalLeads = await Lead.countDocuments();

        const leads = await Lead.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            totalLeads,
            currentPage: page,
            totalPages: Math.ceil(totalLeads / limit),
            leads,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// UPDATE LEAD STATUS
const updateLeadStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        res.status(200).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE LEAD
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);

        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        res.status(200).json({ message: "Lead deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// EXPORT CONTROLLERS
module.exports = {
    createLead,
    getLeads,
    updateLeadStatus,
    deleteLead
};