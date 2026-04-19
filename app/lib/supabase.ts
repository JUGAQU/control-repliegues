import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sflfymzqhptzdmkevkxw.supabase.co";
const supabaseKey = "sb_publishable_oEuaqbpg1Ff_9RJ1SGDgfQ_lzAPlM0Q";

export const supabase = createClient(supabaseUrl, supabaseKey);
