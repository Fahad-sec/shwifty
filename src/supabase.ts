import {createClient} from '@supabase/supabase-js'

const SUPABASEURL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASEKEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASEURL || !SUPABASEKEY) {
  throw new Error("Missing Supabase environment Variables. Check env file")
}
export const supaBase = createClient(SUPABASEURL, SUPABASEKEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
