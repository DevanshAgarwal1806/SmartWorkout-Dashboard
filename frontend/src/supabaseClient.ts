// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon key
const supabaseUrl = "https://ildpygevxhmbyobaqsbl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZHB5Z2V2eGhtYnlvYmFxc2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDYwNzUsImV4cCI6MjA2NjMyMjA3NX0.lPFB5NyGRdlAWOXzjXWr3V8hXX5Rt9zNaaWyi_R6yVo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
