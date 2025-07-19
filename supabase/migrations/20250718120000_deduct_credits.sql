-- Migration: Add deduct_credits function and credits tables

-- Create credits_balance table
CREATE TABLE IF NOT EXISTS credits_balance (
  company_id uuid PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  credits integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Create credits_usage_log table
CREATE TABLE IF NOT EXISTS credits_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  amount integer NOT NULL,
  feature text NOT NULL,
  description text,
  used_at timestamptz DEFAULT now()
);

-- Function: deduct_credits
CREATE OR REPLACE FUNCTION deduct_credits(
  company_id uuid,
  amount integer,
  feature text,
  description text,
  user_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance integer;
BEGIN
  -- Get current balance
  SELECT credits INTO current_balance FROM credits_balance WHERE company_id = company_id FOR UPDATE;
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'No credits balance found for company %', company_id;
  END IF;
  IF current_balance < amount THEN
    RAISE EXCEPTION 'Insufficient credits: % available, % required', current_balance, amount;
  END IF;
  -- Deduct credits
  UPDATE credits_balance SET credits = credits - amount, updated_at = now() WHERE company_id = company_id;
  -- Log usage
  INSERT INTO credits_usage_log(company_id, user_id, amount, feature, description) VALUES (company_id, user_id, amount, feature, description);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION deduct_credits(uuid, integer, text, text, uuid) TO authenticated;
