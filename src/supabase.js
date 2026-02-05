const supaBaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supaBaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supaBase = window.supabase.createClient(supaBaseUrl, supaBaseKey)

// push to vercel