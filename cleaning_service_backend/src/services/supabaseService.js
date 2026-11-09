// src/services/supabaseService.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase URL හෝ Key එක .env ෆයිල් එකේ නැහැ!");
    process.exit(1); // Server එක start වෙන එක නවත්වනවා
}

// Supabase client එක නිර්මාණය කිරීම
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ The Supabase Client was successfully created.");

// මේ client එක වෙනත් ෆයිල් වල පාවිච්චි කරන්න Export කරනවා
module.exports = supabase;