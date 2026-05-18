const Lead = require('../models/Lead');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{11}$/;

const sanitizeRequiredString = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return '';
    }

    return String(value).trim();
};

const validateLeadPayload = (body = {}) => {
    const values = {
        name: sanitizeRequiredString(body.name),
        email: sanitizeRequiredString(body.email).toLowerCase(),
        phone: sanitizeRequiredString(body.phone),
        assignedTo: sanitizeRequiredString(body.assignedTo)
    };
    const errors = {};

    if (!values.name) {
        errors.name = 'Name is required.';
    }

    if (!values.email) {
        errors.email = 'Email is required.';
    } else if (!emailPattern.test(values.email)) {
        errors.email = 'Enter a valid email address.';
    }

    if (!values.phone) {
        errors.phone = 'Phone is required.';
    } else if (!phonePattern.test(values.phone)) {
        errors.phone = 'Phone must be exactly 11 digits.';
    }

    if (!values.assignedTo) {
        errors.assignedTo = 'Assigned To is required.';
    }

    return { values, errors };
};

// Create a new lead
const createLead = async (req, res) => {
    try {
        const { values, errors } = validateLeadPayload(req.body);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: 'Please fix the highlighted fields',
                errors
            });
        }

        const lead = await Lead.create(values);

        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
};

// UPDATE LEAD DETAILS
const updateLead = async (req, res) => {
    try {
        const { values, errors } = validateLeadPayload(req.body);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: 'Please fix the highlighted fields',
                errors
            });
        }

        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            values,
            {
                new: true,
                runValidators: true
            }
        );

        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        res.status(200).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET ALL LEADS WITH PAGINATION, SEARCH, AND STATUS FILTERING
const getLeads = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = 5;
        const search = String(req.query.search || '').trim();
        const status = String(req.query.status || '').trim();
        const query = {};

        if (search) {
            const searchRegex = new RegExp(escapeRegExp(search), 'i');
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ];
        }

        if (status) {
            query.status = new RegExp(`^${escapeRegExp(status)}$`, 'i');
        }

        const [
            totalLeads,
            totalLeadStats,
            newLeadStats,
            contactedLeadStats,
            convertedLeadStats,
            lostLeadStats
        ] = await Promise.all([
            Lead.countDocuments(query),
            Lead.countDocuments(),
            Lead.countDocuments({ status: /^New$/i }),
            Lead.countDocuments({ status: /^Contacted$/i }),
            Lead.countDocuments({ status: /^Converted$/i }),
            Lead.countDocuments({ status: /^Lost$/i })
        ]);
        const totalPages = Math.max(Math.ceil(totalLeads / limit), 1);

        const leads = await Lead.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            totalLeads,
            currentPage: page,
            totalPages,
            leads,
            stats: {
                total: totalLeadStats,
                new: newLeadStats,
                contacted: contactedLeadStats,
                converted: convertedLeadStats,
                lost: lostLeadStats
            },
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
    updateLead,
    updateLeadStatus,
    deleteLead
};
