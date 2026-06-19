-- ============================================================
-- Celengan Digital - Complete Database Setup
-- Supabase Auth Migration (2026-06-19)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Table: celengans
-- Stores user savings goals/piggy banks
CREATE TABLE IF NOT EXISTS celengans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount BIGINT NOT NULL CHECK (target_amount > 0),
  icon TEXT NOT NULL DEFAULT '💰',
  category TEXT NOT NULL DEFAULT 'Lainnya',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_celengans_user_id ON celengans(user_id);
CREATE INDEX IF NOT EXISTS idx_celengans_created_at ON celengans(created_at DESC);

-- Table: transactions
-- Stores deposits and withdrawals for each celengan
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  celengan_id UUID NOT NULL REFERENCES celengans(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount != 0),
  note TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster celengan queries
CREATE INDEX IF NOT EXISTS idx_transactions_celengan_id ON transactions(celengan_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on both tables
ALTER TABLE celengans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: celengans
-- Users can only see their own celengans
DROP POLICY IF EXISTS "Users can view own celengans" ON celengans;
CREATE POLICY "Users can view own celengans" ON celengans
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own celengans
DROP POLICY IF EXISTS "Users can insert own celengans" ON celengans;
CREATE POLICY "Users can insert own celengans" ON celengans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own celengans
DROP POLICY IF EXISTS "Users can update own celengans" ON celengans;
CREATE POLICY "Users can update own celengans" ON celengans
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own celengans
DROP POLICY IF EXISTS "Users can delete own celengans" ON celengans;
CREATE POLICY "Users can delete own celengans" ON celengans
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies: transactions
-- Users can view transactions for their own celengans
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM celengans
      WHERE celengans.id = transactions.celengan_id
      AND celengans.user_id = auth.uid()
    )
  );

-- Users can insert transactions for their own celengans
DROP POLICY IF EXISTS "Users can insert transactions" ON transactions;
CREATE POLICY "Users can insert transactions" ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM celengans
      WHERE celengans.id = transactions.celengan_id
      AND celengans.user_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function: get_collected
-- Returns the total collected amount for a celengan
CREATE OR REPLACE FUNCTION get_collected(celengan_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total
  FROM transactions
  WHERE transactions.celengan_id = get_collected.celengan_id;
  
  RETURN total;
END;
$$;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Create storage bucket for celengan images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'celengin-images',
  'celengin-images',
  true,
  false,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Authenticated users can upload images
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'celengin-images');

-- Storage RLS: Public can view images
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'celengin-images');

-- Storage RLS: Users can delete their own images
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'celengin-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp on celengans
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_celengans_updated_at ON celengans;
CREATE TRIGGER update_celengans_updated_at
  BEFORE UPDATE ON celengans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DONE
-- ============================================================
-- Run this migration in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
