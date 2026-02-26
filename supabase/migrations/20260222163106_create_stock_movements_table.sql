/*
  # Create Stock Movements Table

  1. New Tables
    - `stock_movements`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `movement_type` (text) - 'in', 'out', or 'adjustment'
      - `quantity` (decimal) - quantity moved
      - `previous_stock` (decimal) - stock before movement
      - `new_stock` (decimal) - stock after movement
      - `reason` (text) - reason for movement
      - `reference` (text, optional) - reference number (PO, invoice, etc.)
      - `notes` (text, optional) - additional notes
      - `created_by` (uuid, foreign key to profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `stock_movements` table
    - Add policies for authenticated users to read movements
    - Add policies for staff to create movements
    - Add policies for managers/admins to manage movements

  3. Indexes
    - Add index on product_id for faster queries
    - Add index on created_at for date filtering
    - Add index on movement_type for filtering by movement type
*/

CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity decimal(10,2) NOT NULL CHECK (quantity >= 0),
  previous_stock decimal(10,2) NOT NULL DEFAULT 0,
  new_stock decimal(10,2) NOT NULL DEFAULT 0,
  reason text NOT NULL,
  reference text,
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_by ON stock_movements(created_by);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stock movements"
  ON stock_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create stock movements"
  ON stock_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'staff')
    )
  );

CREATE POLICY "Managers can update stock movements"
  ON stock_movements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete stock movements"
  ON stock_movements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION update_stock_movements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'stock_movements_updated_at'
  ) THEN
    CREATE TRIGGER stock_movements_updated_at
      BEFORE UPDATE ON stock_movements
      FOR EACH ROW
      EXECUTE FUNCTION update_stock_movements_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION auto_update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    stock_quantity = NEW.new_stock::integer,
    updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_stock_after_movement'
  ) THEN
    CREATE TRIGGER update_product_stock_after_movement
      AFTER INSERT ON stock_movements
      FOR EACH ROW
      EXECUTE FUNCTION auto_update_product_stock();
  END IF;
END $$;
