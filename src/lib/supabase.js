import { createClient } from '@supabase/supabase-js'

// NOTE: The user provided a PostgreSQL connection string:
// postgresql://postgres.sxqfiokceqqbfhlrfmcz:5NUVM4YRbdJAQjor@aws-1-us-east-2.pooler.supabase.com:5432/postgres
//
// For a React SPA, we typically use the Supabase Project URL and Anon Key.
// Since we have the host from the connection string, we can infer the project URL.
// Project ID seems to be: sxqfiokceqqbfhlrfmcz
// Region: aws-1-us-east-2
//
// However, we DO NOT have the ANON KEY.
// I will set this up to use environment variables, and for now, the app will likely fail to connect
// until we get the valid SUPABASE_URL and SUPABASE_ANON_KEY.
//
// The connection string provided is for SERVER-SIDE access (Node.js/Python), not Client-Side.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sxqfiokceqqbfhlrfmcz.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.warn('⚠️ Supabase Anon Key is missing. The app will not be able to fetch data.');
}

// Create client only if we have a key, otherwise create a dummy object to prevent crash on init
export const supabase = supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: { message: 'Missing Supabase Key' } }),
        eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Missing Supabase Key' } }) }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Missing Supabase Key' } }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Missing Supabase Key' } }) }) }) }),
      })
    })
  };
