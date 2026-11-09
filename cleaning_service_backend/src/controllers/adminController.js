// src/controllers/adminController.js
const path = require('path');
const fs = require('fs');
const supabase = require('../services/supabaseService');
const pdfService = require('../services/pdfService');

// Helper to create Supabase Auth user:
// Tries auth.admin.createUser first (bypasses email confirmation & rate limit if service_role key is used).
// Otherwise falls back to auth.signUp.
async function createAuthAccount(email, password, metadata) {
    try {
        if (supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
            const adminRes = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: metadata
            });
            if (adminRes.data?.user) {
                return { user: adminRes.data.user, session: null, error: null };
            }
            if (adminRes.error && adminRes.error.status !== 401 && adminRes.error.code !== 'no_authorization') {
                return { user: null, session: null, error: adminRes.error };
            }
        }
    } catch (e) {
        // Fallback to signUp
    }

    const signupRes = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata
        }
    });

    if (signupRes.error) {
        let msg = signupRes.error.message;
        if (msg && msg.toLowerCase().includes('rate limit')) {
            msg = "Supabase Email Rate Limit Exceeded: Supabase Free Tier allows only ~3 emails per hour. To fix: Open Supabase Dashboard -> Authentication -> Providers -> Email and turn OFF 'Confirm email', or add your SUPABASE_SERVICE_ROLE_KEY to backend .env.";
        }
        return { user: null, session: null, error: { ...signupRes.error, message: msg } };
    }

    return { user: signupRes.data?.user, session: signupRes.data?.session, error: null };
}

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
        const { user: authUser, error: authError } = await createAuthAccount(
            email,
            password || 'CleanPro@123',
            { full_name: fullName, role: 'staff' }
        );

        if (authError) {
            return res.status(400).json({ success: false, error: authError.message });
        }

        const userId = authUser?.id;
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

// 7. Check if Admin Exists in Database (Initial Setup Verification)
exports.checkAdminStatus = async (req, res) => {
    try {
        const { count, error } = await supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .eq('role', 'admin');

        if (error) throw error;

        const adminExists = (count || 0) > 0;
        res.status(200).json({
            success: true,
            adminExists,
            count: count || 0
        });
    } catch (error) {
        console.error("Check admin status error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 8. Register Admin (First Admin Setup / Multi-Admin Registration)
exports.registerAdmin = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "Full name, email, and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters long"
            });
        }

        // Verify that no admin exists - exactly one administrator is allowed in the entire system
        const { count: existingAdminCount, error: countErr } = await supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .eq('role', 'admin');

        if (countErr) throw countErr;

        if ((existingAdminCount || 0) > 0) {
            return res.status(403).json({
                success: false,
                error: "Registration closed. The system allows only one administrator, and an administrator account already exists."
            });
        }

        // Try creating auth user in Supabase
        const { user: authUser, session: authSession, error: authError } = await createAuthAccount(
            email,
            password,
            { full_name: fullName, role: 'admin' }
        );

        if (authError) {
            return res.status(400).json({ success: false, error: authError.message });
        }

        const userId = authUser?.id;
        if (!userId) {
            return res.status(400).json({ success: false, error: "Failed to create user account" });
        }

        // Insert into profiles table with role: 'admin'
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                full_name: fullName,
                role: 'admin'
            }])
            .select();

        if (profileError) {
            console.error("Profile insert error for admin:", profileError);
            return res.status(500).json({
                success: false,
                error: "Failed to create admin profile: " + profileError.message
            });
        }

        res.status(201).json({
            success: true,
            message: "System Administrator registered successfully!",
            data: {
                id: userId,
                full_name: fullName,
                email,
                role: 'admin'
            },
            session: authSession || null
        });
    } catch (error) {
        console.error("Admin registration error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 9. Admin Login
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }

        // Authenticate with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
                return res.status(401).json({
                    success: false,
                    error: "Please confirm your email before signing in (check your inbox for verification link)."
                });
            }
            return res.status(401).json({ success: false, error: error.message || "Invalid email or password" });
        }

        // Verify role in profiles table
        const { data: profile, error: profError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profError || !profile) {
            return res.status(403).json({
                success: false,
                error: "Admin profile not found. Please contact system administrator."
            });
        }

        if (profile.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: "Access denied. Only administrator accounts can access this portal."
            });
        }

        res.status(200).json({
            success: true,
            message: "Admin logged in successfully",
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: profile.full_name,
                role: profile.role
            },
            session: data.session
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


