import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"; // 👈 IMPORTANTE

const supabase = createClient(
  "https://sflfymzqhptzdmkevkwx.supabase.co",
  process.env.SUPABASE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("fichas")
      .select("*");

    if (error) {
      return new Response(JSON.stringify(error), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
