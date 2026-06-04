-- ============================================================
-- 007_rls.sql
-- Genusswerte Bonn — Row Level Security
-- Ausführungsreihenfolge: 7/7
-- Voraussetzung: 001–006
--
-- Sicherheitsmodell:
--
--   anon (public website, direkte API-Calls):
--     → Kein Zugriff auf vouchers, orders, customers, reservations
--     → Website kommuniziert ausschließlich über Edge Functions
--
--   authenticated (Admin Panel):
--     → Zugriff NUR wenn is_admin() = true
--     → Nicht jeder eingeloggte User ist automatisch Admin
--
--   service_role (Edge Functions, Stripe Webhook):
--     → Hat BYPASSRLS → umgeht RLS bewusst
--     → Verwendet sensible Daten nur intern, gibt nur reduzierte Infos zurück
-- ============================================================


-- ============================================================
-- admin_users
-- ============================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users: admins lesen"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- INSERT nur über Supabase Dashboard / service_role (Ersteinrichtung)
-- Kein Policy für anon oder für nicht-admins


-- ============================================================
-- customers
-- ============================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers: admins lesen"
  ON customers
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "customers: admins anlegen"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "customers: admins aktualisieren"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- orders
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders: admins lesen"
  ON orders
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "orders: admins aktualisieren"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- INSERT auf orders: nur service_role (Stripe Webhook / Backend)
-- Kein authenticated-INSERT-Policy → Admin legt keine Orders manuell an


-- ============================================================
-- order_items
-- ============================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items: admins lesen"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (is_admin());


-- ============================================================
-- vouchers
-- KEIN direkter Zugriff von außen.
-- validate-voucher und schedule-voucher laufen über service_role.
-- ============================================================
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vouchers: admins lesen"
  ON vouchers
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "vouchers: admins aktualisieren"
  ON vouchers
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- checked_in-Status: Admin setzt ihn manuell beim Eintritt des Kunden
-- INSERT auf vouchers: nur service_role (Stripe Webhook)


-- ============================================================
-- tasting_slots
-- Kein direkter public-Zugriff.
-- Website liest Slots ausschließlich über Edge Function get-available-slots.
-- ============================================================
ALTER TABLE tasting_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasting_slots: admins lesen"
  ON tasting_slots
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "tasting_slots: admins anlegen"
  ON tasting_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "tasting_slots: admins aktualisieren"
  ON tasting_slots
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "tasting_slots: admins löschen"
  ON tasting_slots
  FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- voucher_reservations
-- ============================================================
ALTER TABLE voucher_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voucher_reservations: admins lesen"
  ON voucher_reservations
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "voucher_reservations: admins aktualisieren"
  ON voucher_reservations
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- INSERT: nur service_role über reserve_voucher_slot()
-- DELETE: kein Policy → Stornierung läuft über voucher.status = 'cancelled'
