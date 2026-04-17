import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://sflymzqhptzdmkevkwxw.supabase.co",
  process.env.SUPABASE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("fichas")
    .select("*");

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json(data);
}
