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
    const {
      voucher_code,
      slot_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
    } = await req.json();

    if (!voucher_code || !slot_id || !customer_name || !customer_email) {
      return json({ success: false, error: "INVALID_VOUCHER_CODE" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Gutschein nochmals prüfen (Zeitfenster zwischen Step 2 und 3)
    const { data: voucher } = await supabase
      .from("vouchers")
      .select("id, status, persons, tasting_slug")
      .eq("code", voucher_code.toUpperCase().trim())
      .maybeSingle();

    if (!voucher || voucher.status !== "active") {
      return json({ success: false, error: "VOUCHER_NOT_ACTIVE" });
    }

    // Slot atomar buchen (verhindert Überbuchung via Row Lock)
    const { data: bookResult } = await supabase.rpc("book_slot", {
      p_slot_id: slot_id,
    });

    if (!bookResult?.success) {
      return json({ success: false, error: bookResult?.error || "SLOT_NOT_FOUND" });
    }

    // Voucher als eingelöst markieren
    await supabase
      .from("vouchers")
      .update({ status: "redeemed", updated_at: new Date().toISOString() })
      .eq("id", voucher.id);

    // Redemption Request anlegen
    // Spaltenbezeichnungen ggf. an das bestehende redemption_requests-Schema anpassen
    await supabase.from("redemption_requests").insert({
      voucher_code:     voucher_code.toUpperCase().trim(),
      slot_id:          slot_id,
      customer_name:    customer_name,
      customer_email:   customer_email,
      customer_phone:   customer_phone    || null,
      customer_address: customer_address  || null,
      status:           "confirmed",
    });

    return json({ success: true });
  } catch (err) {
    console.error("schedule-voucher:", err);
    return json({ success: false, error: "UNKNOWN" }, 500);
  }
});
