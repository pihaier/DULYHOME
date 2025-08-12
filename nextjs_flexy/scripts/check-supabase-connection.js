const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('Missing env vars. Check nextjs_flexy/.env.local');
  process.exit(1);
}

const anon = createClient(supabaseUrl, supabaseAnonKey);
const service = createClient(supabaseUrl, supabaseServiceRoleKey);

(async () => {
  try {
    const { data: buckets, error: bErr } = await service.storage.listBuckets();
    if (bErr) throw bErr;
    console.log('Buckets:', (buckets || []).map(b => b.name));
  } catch (e) {
    console.error('Storage error:', e.message);
  }

  try {
    const { count, error } = await anon.from('hs_codes').select('*', { count: 'exact', head: true });
    if (error) throw error;
    console.log('hs_codes count (anon):', count);
  } catch (e1) {
    console.warn('Anon count failed:', e1.message);
    try {
      const { count, error } = await service.from('hs_codes').select('*', { count: 'exact', head: true });
      if (error) throw error;
      console.log('hs_codes count (service):', count);
    } catch (e2) {
      console.error('Service count failed:', e2.message);
    }
  }
})();