import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
let supabaseAdmin = null;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase environment variables not found. Some features may not work.');
} else {
  supabase = createClient(supabaseUrl, supabaseKey);

  // Service account client for admin operations
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;
}

export { supabase, supabaseAdmin };