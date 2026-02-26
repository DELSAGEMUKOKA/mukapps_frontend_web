/*
  # Add missing fields to customers table

  1. Changes
    - Add `city` field (text, optional)
    - Add `type` field (text, required with default) - Customer type: 'individual' or 'business'
    - Add `tax_id` field (text, optional) - Tax ID or business registration number
    - Add `updated_at` field (timestamptz, default now())
  
  2. Indexes
    - Add index on type for filtering by customer type
    - Add index on email for faster lookups
    - Add index on phone for faster lookups
    - Add index on is_vip for filtering VIP customers

  3. Trigger
    - Add trigger to automatically update updated_at timestamp
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'city'
  ) THEN
    ALTER TABLE customers ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'type'
  ) THEN
    ALTER TABLE customers ADD COLUMN type text NOT NULL DEFAULT 'individual';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'tax_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN tax_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE customers ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'type'
  ) THEN
    ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_type_check;
    ALTER TABLE customers ADD CONSTRAINT customers_type_check 
      CHECK (type IN ('individual', 'business'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_is_vip ON customers(is_vip);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_customers_updated_at'
  ) THEN
    CREATE TRIGGER trigger_update_customers_updated_at
      BEFORE UPDATE ON customers
      FOR EACH ROW
      EXECUTE FUNCTION update_customers_updated_at();
  END IF;
END $$;