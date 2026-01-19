import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';

export const supabase: SupabaseClient | null =
  config.supabaseUrl && config.supabaseServiceRoleKey
    ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey)
    : null;
