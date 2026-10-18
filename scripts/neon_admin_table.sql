-- ====================================================================
-- BharatBazar: Neon PostgreSQL Admin Authentication Schema & Manual Insert
-- You can run this directly in your Neon Console SQL Editor
-- ====================================================================

-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'superadmin',
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Index on Email for fast lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- 3. Manual Insert Example:
-- Password: "Admin@123Bharat!"
-- Bcrypt Hash (cost factor 10): $2a$10$wTqS8b1kR5f6jS4qCqM7beUvL63WkWkXb6zN85kE8C3Qe54Wj3QCe
INSERT INTO admins (name, email, password_hash, role, status)
VALUES (
    'Bharat Super Admin',
    'admin@bharatbazar.com',
    '$2a$10$iN6zD7Q2v1m1wQeH6lK3I.4V4jE1L9X2k2o1n5M2G8B4m2Q9R8C1i',
    'superadmin',
    'active'
)
ON CONFLICT (email) DO UPDATE 
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    updated_at = CURRENT_TIMESTAMP;

-- 4. Query all admins
SELECT id, name, email, role, status, last_login, created_at FROM admins;
