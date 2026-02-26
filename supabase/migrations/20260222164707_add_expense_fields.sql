/*
  # Add Additional Fields to Expenses Table

  1. Changes
    - Add `title` column to expenses table for a short descriptive title
    - Add `payment_method` column to track how the expense was paid
    - Add `notes` column for additional information
    - Add `updated_at` column to track modifications
    
  2. Security
    - No RLS changes needed as table already has RLS enabled
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'title'
  ) THEN
    ALTER TABLE expenses ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE expenses ADD COLUMN payment_method text DEFAULT 'Espèces';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'notes'
  ) THEN
    ALTER TABLE expenses ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE expenses ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_expenses_updated_at'
  ) THEN
    CREATE TRIGGER update_expenses_updated_at
      BEFORE UPDATE ON expenses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;