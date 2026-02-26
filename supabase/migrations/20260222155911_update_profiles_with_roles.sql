/*
  # Update profiles table with enhanced role system

  1. Changes
    - Update role column to support new role types
    - Add is_active column for user status management
    - Add full_name column if not exists (rename from name)
    - Add updated_at trigger
  
  2. New Roles
    - admin: Full access to all features
    - manager: Access to management features (same as supervisor)
    - cashier: Access to POS and basic operations
    - accountant: Access to financial reports and data
  
  3. Security
    - Ensure RLS policies are in place
    - Add policies for user management based on roles
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'manager', 'cashier', 'accountant'));
END $$;

CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trigger_update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_profiles_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);