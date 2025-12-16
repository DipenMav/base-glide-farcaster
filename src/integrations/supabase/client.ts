import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jhyatzmcmtoovravmkfp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWF0em1jbXRvb3ZyYXZta2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NjU4NjcsImV4cCI6MjA4MTQ0MTg2N30.3cKH18IxIOEVob_bxTkPK02OG0eyK_e7Ae7Ai3awKKQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
