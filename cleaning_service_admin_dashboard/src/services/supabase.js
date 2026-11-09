import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iactnhptqkctvqrerhpk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MA0-SjihXQN3X8dKascTFA_B6lPO_vi';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

