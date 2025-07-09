-- Antique Watches Store Database Schema
-- MySQL Database Structure

-- Create database
CREATE DATABASE IF NOT EXISTS antique_watches_store;
USE antique_watches_store;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL
);

-- User addresses table
CREATE TABLE user_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('billing', 'shipping') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Brands table
CREATE TABLE brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    website_url VARCHAR(255),
    founded_year INT,
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    brand_id INT NOT NULL,
    category_id INT NOT NULL,
    reference_number VARCHAR(100),
    year_manufactured INT,
    condition_grade ENUM('Mint', 'Excellent', 'Very Good', 'Good', 'Fair') NOT NULL,
    movement_type ENUM('Automatic', 'Manual', 'Quartz') NOT NULL,
    case_size VARCHAR(20),
    case_material VARCHAR(100),
    dial_color VARCHAR(50),
    bracelet_material VARCHAR(100),
    water_resistance VARCHAR(20),
    power_reserve VARCHAR(20),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 1,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    weight DECIMAL(8, 2),
    dimensions VARCHAR(100),
    provenance TEXT,
    condition_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Product images table
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    notes TEXT,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order addresses table
CREATE TABLE order_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    type ENUM('billing', 'shipping') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_brand VARCHAR(100) NOT NULL,
    product_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- Wishlist table
CREATE TABLE wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_wishlist (user_id, product_id)
);

-- Cart items table
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_cart (user_id, product_id)
);

-- Coupons table
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('percentage', 'fixed_amount') NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10, 2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL
);

-- Contact messages table
CREATE TABLE contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data

-- Insert brands
INSERT INTO brands (name, slug, description, founded_year, country) VALUES
('Rolex', 'rolex', 'Swiss luxury watch manufacturer known for precision and prestige.', 1905, 'Switzerland'),
('Omega', 'omega', 'Swiss luxury watchmaker with a rich heritage in precision timekeeping.', 1848, 'Switzerland'),
('Patek Philippe', 'patek-philippe', 'Swiss luxury watch manufacturer regarded as one of the finest in the world.', 1839, 'Switzerland'),
('Cartier', 'cartier', 'French luxury goods conglomerate known for jewelry and watches.', 1847, 'France'),
('Audemars Piguet', 'audemars-piguet', 'Swiss manufacturer of luxury mechanical watches and clocks.', 1875, 'Switzerland'),
('Vacheron Constantin', 'vacheron-constantin', 'Swiss luxury watch and clock manufacturer.', 1755, 'Switzerland'),
('Jaeger-LeCoultre', 'jaeger-lecoultre', 'Swiss luxury watch and clock manufacturer.', 1833, 'Switzerland'),
('Tudor', 'tudor', 'Swiss watch manufacturer based in Geneva.', 1926, 'Switzerland');

-- Insert categories
INSERT INTO categories (name, slug, description) VALUES
('Sport Watches', 'sport-watches', 'Watches designed for active lifestyles and sports activities.'),
('Dress Watches', 'dress-watches', 'Elegant timepieces perfect for formal occasions.'),
('Dive Watches', 'dive-watches', 'Water-resistant watches designed for underwater activities.'),
('Pilot Watches', 'pilot-watches', 'Aviation-inspired timepieces with clear readability.'),
('Chronographs', 'chronographs', 'Watches with stopwatch functionality.');

-- Insert sample products
INSERT INTO products (name, slug, description, brand_id, category_id, reference_number, year_manufactured, condition_grade, movement_type, case_size, case_material, dial_color, bracelet_material, water_resistance, price, original_price, stock_quantity, is_featured) VALUES
('Submariner Date', 'rolex-submariner-date-1965', 'Iconic dive watch from the golden age of Rolex sports watches.', 1, 3, '5513', 1965, 'Excellent', 'Automatic', '40mm', 'Stainless Steel', 'Black', 'Stainless Steel', '200m', 15000.00, 18000.00, 1, TRUE),
('Speedmaster Professional', 'omega-speedmaster-professional-1969', 'The legendary moon watch worn by NASA astronauts.', 2, 5, '105.012', 1969, 'Very Good', 'Manual', '42mm', 'Stainless Steel', 'Black', 'Stainless Steel', '50m', 8500.00, 9200.00, 1, TRUE),
('Calatrava', 'patek-philippe-calatrava-1970', 'Timeless dress watch representing pure horological elegance.', 3, 2, '3520', 1970, 'Mint', 'Manual', '37mm', 'Yellow Gold', 'Silver', 'Leather', '30m', 25000.00, 28000.00, 1, TRUE),
('Tank Louis Cartier', 'cartier-tank-louis-1975', 'Iconic rectangular watch inspired by military tanks.', 4, 2, 'W1529756', 1975, 'Excellent', 'Manual', '29mm', 'Yellow Gold', 'Silver', 'Leather', '30m', 12000.00, 14000.00, 1, TRUE),
('Royal Oak', 'audemars-piguet-royal-oak-1980', 'Revolutionary luxury sports watch with octagonal bezel.', 5, 1, '5402ST', 1980, 'Excellent', 'Automatic', '39mm', 'Stainless Steel', 'Blue', 'Stainless Steel', '50m', 35000.00, 38000.00, 1, TRUE),
('Patrimony', 'vacheron-constantin-patrimony-1978', 'Ultra-thin dress watch showcasing traditional craftsmanship.', 6, 2, '81180', 1978, 'Very Good', 'Manual', '36mm', 'Yellow Gold', 'Silver', 'Leather', '30m', 22000.00, 25000.00, 1, FALSE),
('Reverso', 'jaeger-lecoultre-reverso-1985', 'Art Deco inspired watch with reversible case.', 7, 2, '250.8.86', 1985, 'Excellent', 'Manual', '26mm x 42mm', 'Stainless Steel', 'Silver', 'Leather', '30m', 18000.00, 20000.00, 1, FALSE),
('Black Bay Heritage', 'tudor-black-bay-heritage-1990', 'Vintage-inspired dive watch with modern reliability.', 8, 3, '79220B', 1990, 'Good', 'Automatic', '41mm', 'Stainless Steel', 'Black', 'Stainless Steel', '200m', 3500.00, 4000.00, 1, FALSE);

-- Insert sample coupons
INSERT INTO coupons (code, type, value, minimum_order_amount, usage_limit, is_active, expires_at) VALUES
('VINTAGE10', 'percentage', 10.00, 1000.00, 100, TRUE, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('COLLECTOR20', 'percentage', 20.00, 5000.00, 50, TRUE, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('WELCOME500', 'fixed_amount', 500.00, 2000.00, 200, TRUE, DATE_ADD(NOW(), INTERVAL 60 DAY));

-- Create indexes for better performance
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
