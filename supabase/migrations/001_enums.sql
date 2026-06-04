-- ============================================================
-- 001_enums.sql
-- Genusswerte Bonn — Enum Types
-- Ausführungsreihenfolge: 1/7
-- ============================================================

-- Art der Bestellung
CREATE TYPE order_type AS ENUM (
  'tasting_voucher',   -- Tasting-Gutschein (erzeugt einen Voucher nach Zahlung)
  'gift_box'           -- Genussbox (keine Voucher-Erzeugung, nur Order + fulfillment)
);

-- Zahlungsstatus — wird ausschließlich durch Stripe Webhook gesetzt
CREATE TYPE payment_status AS ENUM (
  'pending',    -- Checkout gestartet, Zahlung noch nicht erfolgt
  'paid',       -- Zahlung erfolgreich bestätigt
  'cancelled',  -- Abgebrochen
  'refunded'    -- Erstattet
);

-- Lieferstatus — relevant für Genussboxen
CREATE TYPE fulfillment_status AS ENUM (
  'open',              -- Neue Bestellung, noch nicht bearbeitet
  'in_progress',       -- Wird zusammengestellt
  'ready_for_pickup',  -- Bereit zur Abholung / zum Versand
  'shipped',           -- Versandt
  'completed',         -- Abgeschlossen
  'cancelled'          -- Storniert
);

-- Gutschein-Lebenszyklus
CREATE TYPE voucher_status AS ENUM (
  'active',      -- Bezahlt, kein Termin gesetzt
  'scheduled',   -- Termin ausgewählt und bestätigt
  'checked_in',  -- Kunde war im Laden / Eintritt erfolgt
  'cancelled',   -- Storniert
  'expired'      -- Abgelaufen (valid_until überschritten)
);

-- Status eines Tasting-Termins
CREATE TYPE slot_status AS ENUM (
  'active',    -- Buchbar
  'full',      -- Ausgebucht
  'cancelled'  -- Abgesagt
);

-- Alle angebotenen Tasting-Typen
CREATE TYPE tasting_type AS ENUM (
  'wein_tasting',
  'afterwork_wein_tasting',
  'gin_tasting',
  'champagner_popcorn_tasting',
  'trueffel_champagner_tasting',
  'whisky_tasting',
  'craft_beer_tasting',
  'wagyu_wein_champagner_tasting',
  'apero_antipasti_tasting'
);

-- Rollen im Admin Panel
CREATE TYPE admin_role AS ENUM (
  'admin',        -- Standard-Admin
  'super_admin'   -- Kann weitere Admins anlegen
);
