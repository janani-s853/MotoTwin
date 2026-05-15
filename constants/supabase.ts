import 'react-native-url-polyfill/auto';  // ⭐ VERY IMPORTANT
import { createClient } from '@supabase/supabase-js';

SUPABASE_URL = "your_supabase_url"
SUPABASE_KEY = "your_supabase_key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
