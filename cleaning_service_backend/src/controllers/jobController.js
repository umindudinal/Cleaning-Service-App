// src/controllers/jobController.js
const path = require('path');
const fs = require('fs');
const supabase = require('../services/supabaseService');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');

// 1. Checklist ප්‍රශ්න ටික ලබාගැනීම (Customer අනුව filter කිරීම)
exports.getQuestions = async (req, res) => {
    try {
        const { customerId } = req.query;

        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('is_active', true); // Active ප්‍රශ්න විතරක් ගන්නවා

        if (error) throw error;

        // Parse questions and extract customerId (from column or [CID:...] tag)
        const formatted = (data || []).map(q => {
            let qCustomerId = q.customer_id || null;
            let text = q.question_text || '';

            const match = text.match(/^\[CID:([^\]]+)\]\s*(.*)$/);
            if (match) {
                qCustomerId = match[1];
                text = match[2];
            }

            return {
                ...q,
                customer_id: qCustomerId,
                question_text: text
            };
        });

        // Customer කෙනෙකු සඳහන් කර ඇත්නම් එම Customer ට අදාළ ප්‍රශ්න පමණක් ලබාදීම
        let result = formatted;
        if (customerId) {
            result = formatted.filter(q => q.customer_id === customerId);
        }

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Staff කෙනෙකුට අදාළ ਅද දවසේ Jobs ටික ලබාගැනීම
// 2. Staff කෙනෙකුට අදාළ Jobs ටික ලබාගැනීම
exports.getStaffJobs = async (req, res) => {
    try {
        const { staffId } = req.params;

        const { data, error } = await supabase
            .from('jobs')
            .select(`
                *,
                customers (name, address, phone) 
            `) // Join කරලා Customer ගේ විස්තරත් ගන්නවා
            .eq('staff_id', staffId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2.1 සියලුම Jobs ලබාගැනීම (Admin සහ Reference සඳහා)
exports.getAllJobs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select(`
                *,
                customers (name, email, address, phone)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2.2 එක් Job එකක විස්තර ලබාගැනීම
exports.getJobById = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { data, error } = await supabase
            .from('jobs')
            .select(`
                *,
                customers (name, email, address, phone)
            `)
            .eq('id', jobId)
            .single();

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Job එක ඉවර කරලා Data Submit කිරීම (Photos සහ Checklist සමඟ)
exports.submitJob = async (req, res) => {
    try {
        const { jobId, answers } = req.body;

        if (!jobId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, error: "jobId and answers array are required." });
        }
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // 1. Job එකට අදාළ Customer ගේ විස්තර Database එකෙන් ගැනීම (PDF එකට සහ Email එකට අවශ්‍ය නිසා)
        const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select(`
                *,
                customers (name, email, address, phone)
            `)
            .eq('id', jobId)
            .single();

        if (jobError) throw jobError;
        const customer = jobData.customers || {};

        // 2. Photos process කිරීම සහ පිළිතුරු සකස් කිරීම
        const processedAnswers = [];
        const responsesData = [];

        for (let i = 0; i < answers.length; i++) {
            const ans = { ...answers[i] };
            let photoUrl = ans.photoUrl || null;
            let photoBuffer = null;

            if (ans.photoBase64) {
                try {
                    const cleanBase64 = ans.photoBase64.replace(/^data:image\/\w+;base64,/, '');
                    photoBuffer = Buffer.from(cleanBase64, 'base64');
                    
                    const fileName = `proof_${jobId}_${ans.questionId || i}_${Date.now()}.jpg`;
                    const filePath = path.join(uploadsDir, fileName);
                    fs.writeFileSync(filePath, photoBuffer);

                    const host = req.get('host') || 'localhost:3000';
                    photoUrl = `${req.protocol}://${host}/uploads/${fileName}`;
                } catch (imgSaveErr) {
                    console.error("Photo processing error:", imgSaveErr);
                }
            }

            ans.photoUrl = photoUrl;
            ans.photoBuffer = photoBuffer;
            processedAnswers.push(ans);

            responsesData.push({
                job_id: jobId,
                question_id: ans.questionId,
                answer: Boolean(ans.answer),
                photo_url: photoUrl
            });
        }

        // 3. පිළිතුරු ටික job_responses table එකට දැමීම
        const { error: insertError } = await supabase
            .from('job_responses')
            .insert(responsesData);

        if (insertError) throw insertError;

        // 4. Job එකේ status එක 'completed' කිරීම
        const { error: updateError } = await supabase
            .from('jobs')
            .update({ status: 'completed', completed_at: new Date() })
            .eq('id', jobId);

        if (updateError) throw updateError;

        // 5. Photos සහිතව PDF එක Generate කිරීම සහ Disk එකේ සුරැකීම (Admin Dashboard එක සඳහා)
        const pdfBuffer = await pdfService.generateJobReportPDF(customer, processedAnswers);

        const reportsDir = path.join(__dirname, '../../uploads/reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        const pdfFileName = `report_${jobId}.pdf`;
        const pdfFilePath = path.join(reportsDir, pdfFileName);
        fs.writeFileSync(pdfFilePath, pdfBuffer);

        const host = req.get('host') || 'localhost:3000';
        const pdfUrl = `${req.protocol}://${host}/uploads/reports/${pdfFileName}`;

        // 6. Customer ට සහ Admin ට Email එක යැවීම
        let emailSent = false;
        try {
            if (customer.email) {
                await emailService.sendReportEmail(customer.email, pdfBuffer, customer);
                emailSent = true;
            }
        } catch (emailErr) {
            console.error("Email sending failed:", emailErr.message);
        }

        res.status(200).json({ 
            success: true, 
            message: "Job completed, photos saved, PDF generated, and email sent successfully!",
            pdfUrl,
            emailSent
        });
    } catch (error) {
        console.error("Submit Job Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. Staff Login වීම
exports.loginStaff = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Supabase Auth එකෙන් login වීම Backend එක හරහා සිද්ධ වෙනවා
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Login සාර්ථක නම් user ගේ දත්ත App එකට යවනවා
        res.status(200).json({
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email
            },
            session: data.session
        });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
};