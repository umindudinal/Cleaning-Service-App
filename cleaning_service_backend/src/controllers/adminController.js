// src/controllers/adminController.js
const path = require('path');
const fs = require('fs');
const supabase = require('../services/supabaseService');
const pdfService = require('../services/pdfService');

// 1. Dashboard Overview Stats
exports.getStats = async (req, res) => {
    try {
        const [customersRes, staffRes, questionsRes, jobsRes] = await Promise.all([
            supabase.from('customers').select('id', { count: 'exact' }),
            supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'staff'),
            supabase.from('questions').select('id', { count: 'exact' }),
            supabase.from('jobs').select('id, status', { count: 'exact' })
        ]);

        const totalCustomers = customersRes.count || 0;
        const totalStaff = staffRes.count || 0;
        const totalQuestions = questionsRes.count || 0;
        const totalJobs = jobsRes.count || 0;
        const jobs = jobsRes.data || [];
        const completedJobs = jobs.filter(j => (j.status || '').toLowerCase() === 'completed').length;
        const pendingJobs = totalJobs - completedJobs;

        res.status(200).json({
            success: true,
            data: {
                totalCustomers,
                totalStaff,
                totalQuestions,
                totalJobs,
                completedJobs,
                pendingJobs
            }
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Customers Management
exports.getCustomers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, error: "Customer Name and Email are required" });
        }

        const { data, error } = await supabase
            .from('customers')
            .insert([{ name, email, phone: phone || '', address: address || '' }])
            .select();

        if (error) throw error;
        res.status(201).json({ success: true, message: "Customer added successfully", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address } = req.body;

        const { data, error } = await supabase
            .from('customers')
            .update({ name, email, phone, address })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ success: true, message: "Customer updated successfully", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ success: true, message: "Customer deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Staff Management
exports.getStaff = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'staff')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email) {
            return res.status(400).json({ success: false, error: "Full name and email are required" });
        }

        // Try creating auth user in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: password || 'CleanPro@123',
            options: {
                data: { full_name: fullName, role: 'staff' }
            }
        });

        if (authError) {
            return res.status(400).json({ success: false, error: authError.message });
        }

        const userId = authData.user?.id;
        if (userId) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: userId,
                    full_name: fullName,
                    role: 'staff'
                }]);

            if (profileError) {
                console.error("Profile insert error:", profileError);
            }
        }

        res.status(201).json({
            success: true,
            message: "Staff member added successfully!",
            data: { id: userId, full_name: fullName, email, role: 'staff' }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ success: true, message: "Staff member removed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. Questions / Checklist Items Management
exports.getQuestions = async (req, res) => {
    try {
        const { customerId } = req.query;

        const [questionsRes, customersRes] = await Promise.all([
            supabase.from('questions').select('*').order('created_at', { ascending: true }),
            supabase.from('customers').select('id, name')
        ]);

        if (questionsRes.error) throw questionsRes.error;

        const customerMap = {};
        (customersRes.data || []).forEach(c => {
            customerMap[c.id] = c.name;
        });

        let formatted = (questionsRes.data || []).map(q => {
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
                customer_name: qCustomerId ? (customerMap[qCustomerId] || 'Specific Customer') : 'General (All Customers)',
                question_text: text
            };
        });

        if (customerId) {
            formatted = formatted.filter(q => q.customer_id === customerId);
        }

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createQuestion = async (req, res) => {
    try {
        const { questionText, customerId, isActive = true } = req.body;
        if (!questionText || !questionText.trim()) {
            return res.status(400).json({ success: false, error: "Question text is required" });
        }

        let insertObj = {
            question_text: questionText.trim(),
            is_active: Boolean(isActive)
        };
        if (customerId) {
            insertObj.customer_id = customerId;
        }

        let { data, error } = await supabase.from('questions').insert([insertObj]).select();

        // Fallback if customer_id column does not exist in Supabase questions table
        if (error && (error.code === '42703' || (error.message && error.message.includes('customer_id')))) {
            const taggedText = customerId ? `[CID:${customerId}] ${questionText.trim()}` : questionText.trim();
            const fallbackRes = await supabase.from('questions').insert([{
                question_text: taggedText,
                is_active: Boolean(isActive)
            }]).select();

            data = fallbackRes.data;
            error = fallbackRes.error;
        }

        if (error) throw error;
        res.status(201).json({ success: true, message: "Checklist question created successfully", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionText, customerId, isActive } = req.body;

        const updateData = {};
        if (questionText !== undefined) updateData.question_text = questionText.trim();
        if (isActive !== undefined) updateData.is_active = Boolean(isActive);
        if (customerId !== undefined) updateData.customer_id = customerId;

        let { data, error } = await supabase
            .from('questions')
            .update(updateData)
            .eq('id', id)
            .select();

        // Fallback if customer_id column does not exist
        if (error && (error.code === '42703' || (error.message && error.message.includes('customer_id')))) {
            const cleanText = questionText !== undefined ? questionText.trim() : '';
            const finalCustId = customerId !== undefined ? customerId : null;
            const taggedText = finalCustId ? `[CID:${finalCustId}] ${cleanText}` : cleanText;

            const fallbackUpdate = { is_active: Boolean(isActive) };
            if (cleanText) fallbackUpdate.question_text = taggedText;

            const fallbackRes = await supabase
                .from('questions')
                .update(fallbackUpdate)
                .eq('id', id)
                .select();

            data = fallbackRes.data;
            error = fallbackRes.error;
        }

        if (error) throw error;
        res.status(200).json({ success: true, message: "Question updated successfully", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ success: true, message: "Question deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 5. Jobs & Cleaning Task Assignments
exports.getJobs = async (req, res) => {
    try {
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select(`
                *,
                customers (id, name, email, address, phone)
            `)
            .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Also fetch profiles to map staff names
        const { data: staffProfiles } = await supabase
            .from('profiles')
            .select('id, full_name');

        const staffMap = {};
        (staffProfiles || []).forEach(p => {
            staffMap[p.id] = p.full_name;
        });

        const host = req.get('host') || 'localhost:3000';
        const formattedJobs = (jobs || []).map(j => {
            const isCompleted = (j.status || '').toLowerCase() === 'completed';
            return {
                ...j,
                staff_name: staffMap[j.staff_id] || 'Assigned Staff',
                pdf_url: isCompleted ? `${req.protocol}://${host}/api/admin/jobs/${j.id}/report-pdf` : null
            };
        });

        res.status(200).json({ success: true, data: formattedJobs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createJob = async (req, res) => {
    try {
        const { customerId, staffId, jobDate } = req.body;
        if (!customerId || !staffId) {
            return res.status(400).json({ success: false, error: "customerId and staffId are required" });
        }

        const newJob = {
            customer_id: customerId,
            staff_id: staffId,
            status: 'pending',
            job_date: jobDate || new Date().toISOString().split('T')[0]
        };

        const { data, error } = await supabase
            .from('jobs')
            .insert([newJob])
            .select(`
                *,
                customers (id, name, email, address, phone)
            `);

        if (error) throw error;
        res.status(201).json({ success: true, message: "Cleaning job assigned successfully", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ success: true, message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 6. Download / View PDF Completion Report for Job
exports.getJobReportPDF = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if report PDF is already on disk
        const reportsDir = path.join(__dirname, '../../uploads/reports');
        const cachedPath = path.join(reportsDir, `report_${id}.pdf`);
        if (fs.existsSync(cachedPath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="Cleaning_Report_${id}.pdf"`);
            return fs.createReadStream(cachedPath).pipe(res);
        }

        // Dynamically generate from Supabase if not on disk
        const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select(`
                *,
                customers (name, email, address, phone)
            `)
            .eq('id', id)
            .single();

        if (jobError || !jobData) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        const customer = jobData.customers || {};

        const { data: responses, error: respError } = await supabase
            .from('job_responses')
            .select(`
                *,
                questions (question_text)
            `)
            .eq('job_id', id);

        if (respError) throw respError;

        const uploadsDir = path.join(__dirname, '../../uploads');
        const formattedAnswers = (responses || []).map(r => {
            let photoBuffer = null;
            if (r.photo_url) {
                try {
                    const fileName = path.basename(r.photo_url);
                    const localPath = path.join(uploadsDir, fileName);
                    if (fs.existsSync(localPath)) {
                        photoBuffer = fs.readFileSync(localPath);
                    }
                } catch (e) {
                    console.error("Error reading photo file:", e.message);
                }
            }

            return {
                questionId: r.question_id,
                questionText: r.questions?.question_text || 'Inspection Item',
                answer: r.answer,
                photoUrl: r.photo_url,
                photoBuffer
            };
        });

        const pdfBuffer = await pdfService.generateJobReportPDF(customer, formattedAnswers);

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        fs.writeFileSync(cachedPath, pdfBuffer);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Cleaning_Report_${customer.name || id}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Get job report PDF error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

