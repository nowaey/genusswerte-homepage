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

    if (!voucher_code || typeof voucher_code !== "string") {
      return json({ valid: false, error: "INVALID_VOUCHER_CODE" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: voucher, error } = await supabase
      .from("vouchers")
      .select("id, code, status, persons, expires_at, tasting_slug, tastings(title)")
      .eq("code", voucher_code.toUpperCase().trim())
      .maybeSingle();

    if (error || !voucher) {
      return json({ valid: false, error: "VOUCHER_NOT_FOUND" });
    }

    if (voucher.status === "redeemed" || voucher.status === "used") {
      return json({ valid: false, error: "VOUCHER_ALREADY_RESERVED" });
    }
    if (voucher.status !== "active") {
      return json({ valid: false, error: "VOUCHER_NOT_ACTIVE" });
    }
    if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
      return json({ valid: false, error: "VOUCHER_EXPIRED" });
    }

    const tastingRow = voucher.tastings as { title: string } | null;
    const tastingName = tastingRow?.title || voucher.tasting_slug || "Tasting-Gutschein";

    return json({
      valid: true,
      tasting_name: tastingName,
      tasting_slug: voucher.tasting_slug,
      persons: voucher.persons ?? 1,
    });
  } catch (err) {
    console.error("validate-voucher:", err);
    return json({ valid: false, error: "UNKNOWN" }, 500);
  }
});
