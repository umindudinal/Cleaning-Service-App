// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Overview Stats
router.get('/stats', adminController.getStats);

// Customer Management
router.get('/customers', adminController.getCustomers);
router.post('/customers', adminController.createCustomer);
router.put('/customers/:id', adminController.updateCustomer);
router.delete('/customers/:id', adminController.deleteCustomer);

// Staff Management
router.get('/staff', adminController.getStaff);
router.post('/staff', adminController.createStaff);
router.delete('/staff/:id', adminController.deleteStaff);

// Questions (Checklist) Management
router.get('/questions', adminController.getQuestions);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// Jobs & Assignments Management
router.get('/jobs', adminController.getJobs);
router.post('/jobs', adminController.createJob);
router.get('/jobs/:id/report-pdf', adminController.getJobReportPDF);
router.delete('/jobs/:id', adminController.deleteJob);

module.exports = router;

