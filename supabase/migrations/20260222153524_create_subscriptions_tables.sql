/*
  # Subscription Management System

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text) - Plan name (e.g., "Basic", "Pro", "Enterprise")
      - `description` (text) - Plan description
      - `price` (numeric) - Monthly price
      - `billing_period` (text) - Billing period (monthly, yearly)
      - `features` (jsonb) - List of features included
      - `max_users` (integer) - Maximum number of users
      - `max_products` (integer) - Maximum number of products
      - `max_invoices_per_month` (integer) - Invoice limit per month
      - `is_active` (boolean) - Whether plan is available
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - References profiles table
      - `plan_id` (uuid, foreign key) - References subscription_plans
      - `status` (text) - active, cancelled, expired, trial
      - `start_date` (timestamptz) - Subscription start date
      - `end_date` (timestamptz) - Subscription end date
      - `trial_end_date` (timestamptz) - Trial period end date
      - `auto_renew` (boolean) - Auto-renewal setting
      - `cancelled_at` (timestamptz) - Cancellation date
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `subscription_history`
      - `id` (uuid, primary key)
      - `subscription_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `plan_id` (uuid, foreign key)
      - `action` (text) - created, upgraded, downgraded, renewed, cancelled
      - `previous_plan_id` (uuid) - Previous plan if applicable
      - `price_paid` (numeric) - Amount paid
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Public read access to active plans
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  billing_period text NOT NULL DEFAULT 'monthly',
  features jsonb DEFAULT '[]'::jsonb,
  max_users integer DEFAULT 5,
  max_products integer DEFAULT 100,
  max_invoices_per_month integer DEFAULT 50,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id),
  status text NOT NULL DEFAULT 'trial',
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  trial_end_date timestamptz,
  auto_renew boolean DEFAULT true,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_history table
CREATE TABLE IF NOT EXISTS subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id),
  action text NOT NULL,
  previous_plan_id uuid REFERENCES subscription_plans(id),
  price_paid numeric(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans (public read for active plans)
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for subscription_history
CREATE POLICY "Users can view own subscription history"
  ON subscription_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert subscription history"
  ON subscription_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, billing_period, features, max_users, max_products, max_invoices_per_month) VALUES
  ('Free Trial', '14-day free trial with full features', 0, 'trial', 
   '["Full POS system", "Basic reporting", "Up to 5 users", "100 products", "50 invoices/month"]'::jsonb, 
   5, 100, 50),
  ('Basic', 'Perfect for small businesses', 29.99, 'monthly',
   '["Full POS system", "Advanced reporting", "Up to 10 users", "500 products", "Unlimited invoices", "Email support"]'::jsonb,
   10, 500, -1),
  ('Professional', 'For growing businesses', 79.99, 'monthly',
   '["Full POS system", "Advanced reporting", "Up to 25 users", "Unlimited products", "Unlimited invoices", "Priority support", "Custom categories", "Export/Import"]'::jsonb,
   25, -1, -1),
  ('Enterprise', 'For large organizations', 199.99, 'monthly',
   '["Full POS system", "Advanced reporting", "Unlimited users", "Unlimited products", "Unlimited invoices", "24/7 support", "API access", "Custom integrations", "Dedicated account manager"]'::jsonb,
   -1, -1, -1)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();