const mongoose = require('mongoose');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{11}$/;

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required.'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required.'],
            trim: true,
            lowercase: true,
            match: [emailPattern, 'Enter a valid email address.']
        },
        phone: {
            type: String,
            required: [true, 'Phone is required.'],
            trim: true,
            match: [phonePattern, 'Phone must be exactly 11 digits.']
        },
        status: {
            type: String,
            enum: ['New', 'Contacted', 'Converted', 'Lost'],
            default: 'New'
        },
        assignedTo: {
            type: String,
            required: [true, 'Assigned To is required.'],
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Lead', leadSchema);
