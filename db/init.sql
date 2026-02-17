CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    cost NUMERIC(10, 2) NOT NULL,   -- Cambiado a NUMERIC
    price NUMERIC(10, 2) NOT NULL,  -- Cambiado a NUMERIC
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE  -- Integrado directamente aquí
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(10, 2) NOT NULL, -- Cambiado a NUMERIC
    total_profit NUMERIC(10, 2) NOT NULL, -- Cambiado a NUMERIC
    payment_method VARCHAR(50) DEFAULT 'Cash' -- Integrado directamente aquí
);

CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_sale NUMERIC(10, 2) NOT NULL, -- Cambiado a NUMERIC
    cost_at_sale NUMERIC(10, 2) NOT NULL   -- Cambiado a NUMERIC
);

CREATE TABLE IF NOT EXISTS product_logs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);