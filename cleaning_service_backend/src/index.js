// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// අපි කලින් හදපු Supabase client එක මෙතනට ගේනවා
const supabase = require('./services/supabaseService');
const jobRoutes = require('./routes/jobRoutes'); // අලුත් Route එක Import කිරීම
const adminRoutes = require('./routes/adminRoutes'); // Admin Route එක Import කිරීම

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

// සරල Test Route එකක් - Server එක වැඩද කියලා බලන්න
app.get('/', (req, res) => {
    res.json({ message: "Cleaning Service API is running!" });
});

// තව Test Route එකක් - Database එකට හරියට Connect වෙලාද කියලා බලන්න
app.get('/api/test-db', async (req, res) => {
    try {
        // අපි කලින් හදපු questions table එකෙන් දත්තයක් ගන්න උත්සාහ කරමු
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .limit(1);

        if (error) throw error;

        res.json({ 
            success: true, 
            message: "Database connection successful!", 
            data: data 
        });
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});