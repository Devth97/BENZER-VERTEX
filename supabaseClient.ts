
import { createClient } from '@supabase/supabase-js';

// process.env.REACT_APP_SUPABASE_URL for CRA or import.meta.env.VITE_SUPABASE_URL for Vite
// Using the provided credentials directly for the demo connection
const supabaseUrl = process.env.SUPABASE_URL || 'https://ytspqtismsdxerozlqab.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0c3BxdGlzbXNkeGVyb3pscWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzUzNzYsImV4cCI6MjA4MDE1MTM3Nn0.nnOmarybcHMENFSJvAIporGWUsaXo9udTuI0nK76W-k';

export const supabase = createClient(supabaseUrl, supabaseKey);
