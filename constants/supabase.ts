import 'react-native-url-polyfill/auto';  // ⭐ VERY IMPORTANT
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lamofoaiznmraetwgbfw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbW9mb2Fpem5tcmFldHdnYmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MjA5MTQsImV4cCI6MjA4MjM5NjkxNH0.cZSvm-PajM97AlmmmxQtkk5WntXHeIUoGiT5PU6awWk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);