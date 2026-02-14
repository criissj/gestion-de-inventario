CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    cost FLOAT NOT NULL,
    price FLOAT NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount FLOAT NOT NULL,
    total_profit FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_sale FLOAT NOT NULL,
    cost_at_sale FLOAT NOT NULL
);

-- Function to decrease stock on sale
CREATE OR REPLACE FUNCTION decrease_stock() RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER after_sale_item_insert
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION decrease_stock();
