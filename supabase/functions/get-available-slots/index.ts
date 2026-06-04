import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { voucher_code } = await req.json();

    if (!voucher_code) return json({ error: "INVALID_VOUCHER_CODE" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Gutschein laden, um tasting_slug zu ermitteln
    const { data: voucher } = await supabase
      .from("vouchers")
      .select("tasting_slug, status")
      .eq("code", voucher_code.toUpperCase().trim())
      .maybeSingle();

    if (!voucher || voucher.status !== "active") {
      return json({ error: "VOUCHER_NOT_FOUND" }, 400);
    }

    if (!voucher.tasting_slug) {
      return json({ error: "TASTING_SLUG_MISSING" }, 400);
    }

    // Verfügbare Termine aus dem View laden
    const { data: slots, error } = await supabase
      .from("available_tasting_slots")
      .select("id, slot_date, slot_time, remaining_capacity")
      .eq("tasting_slug", voucher.tasting_slug)
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true });

    if (error) {
      console.error("get-available-slots query:", error);
      return json({ error: "UNKNOWN" }, 500);
    }

    const result = (slots || []).map((s) => ({
      slot_id:         s.id,
      slot_date:       s.slot_date,
      slot_time:       String(s.slot_time).substring(0, 5), // HH:MM
      available_seats: s.remaining_capacity,
    }));

    return json(result);
  } catch (err) {
    console.error("get-available-slots:", err);
    return json({ error: "UNKNOWN" }, 500);
  }
});
