const express = require('express');

const {
    createLead,
    getLeads,
    updateLead,
    updateLeadStatus,
    deleteLead
} = require('../controllers/leadController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createLead);
router.get('/', protect, getLeads);
router.put('/:id', protect, updateLead);
router.put('/:id/status', protect, updateLeadStatus);
router.delete('/:id', protect, deleteLead);

module.exports = router;
