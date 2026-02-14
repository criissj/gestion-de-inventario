-- Add is_active to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add payment_method to sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'Cash';

-- Create product_logs table
CREATE TABLE IF NOT EXISTS product_logs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
