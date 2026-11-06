// src/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Routes ටික නිර්වචනය කිරීම
router.get('/', jobController.getAllJobs);
router.get('/questions', jobController.getQuestions);
router.get('/job/:jobId', jobController.getJobById);
router.get('/staff/:staffId', jobController.getStaffJobs);
router.post('/submit', jobController.submitJob);
router.post('/login', jobController.loginStaff);

module.exports = router;