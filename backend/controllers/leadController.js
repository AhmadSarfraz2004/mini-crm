const mongoose = require('mongoose');
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

const duplicateCheckedFields = ['email', 'phone'];

const getLeadIdValues = (id) => {
    const values = [id];

    if (mongoose.Types.ObjectId.isValid(id)) {
        values.push(new mongoose.Types.ObjectId(id));
    }

    return values;
};

const getLeadIdFilter = (id) => ({
    _id: {
        $in: getLeadIdValues(id)
    }
});

const findDuplicateLead = (values, excludedLeadId, fields = duplicateCheckedFields) => {
    const duplicateChecks = fields
        .filter((field) => values[field])
        .map((field) => ({ [field]: values[field] }));

    if (duplicateChecks.length === 0) {
        return null;
    }

    const query = {
        $or: duplicateChecks
    };

    if (excludedLeadId) {
        query._id = { $nin: getLeadIdValues(excludedLeadId) };
    }

    return Lead.collection.findOne(query);
};

const findLeadById = (id) => Lead.collection.findOne(getLeadIdFilter(id));

const updateLeadById = async (id, values) => {
    const result = await Lead.collection.findOneAndUpdate(
        getLeadIdFilter(id),
        {
            $set: {
                ...values,
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );

    return result?.value || result;
};

const deleteLeadById = async (id) => {
    const result = await Lead.collection.findOneAndDelete(getLeadIdFilter(id));

    return result?.value || result;
};

const getDuplicateLeadErrors = (lead, values, fields = duplicateCheckedFields) => {
    const errors = {};

    if (fields.includes('email') && lead.email === values.email) {
        errors.email = 'A lead with this email already exists.';
    }

    if (fields.includes('phone') && lead.phone === values.phone) {
        errors.phone = 'A lead with this phone already exists.';
    }

    return errors;
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

        const duplicateLead = await findDuplicateLead(values);

        if (duplicateLead) {
            return res.status(409).json({
                message: 'Lead already exists',
                errors: getDuplicateLeadErrors(duplicateLead, values)
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

        const existingLead = await findLeadById(req.params.id);

        if (!existingLead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        const changedDuplicateFields = duplicateCheckedFields.filter(
            (field) => existingLead[field] !== values[field]
        );
        const duplicateLead = await findDuplicateLead(
            values,
            req.params.id,
            changedDuplicateFields
        );

        if (duplicateLead) {
            return res.status(409).json({
                message: 'Lead already exists',
                errors: getDuplicateLeadErrors(duplicateLead, values, changedDuplicateFields)
            });
        }

        const lead = await updateLeadById(req.params.id, values);

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

        const lead = await updateLeadById(
            req.params.id,
            { status }
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
        const lead = await deleteLeadById(req.params.id);

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
