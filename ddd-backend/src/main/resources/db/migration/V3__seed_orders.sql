-- =====================================================
-- V3: Seed Orders Data
-- Realistic test data simulating production orders
-- Various order statuses and customer scenarios
-- =====================================================

-- =====================================================
-- DELIVERED ORDERS (Historical - Completed)
-- =====================================================

-- Order 1: Large tech order - DELIVERED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status, 
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country, 
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'cust-001', 'ORD-2025-0001', 'John Mitchell', 'john.mitchell@techcorp.com', '+1-415-555-0101',
 'DELIVERED', '1 Market Street, Suite 500', 'San Francisco', 'CA', '94105', 'USA',
 5147.00, 'USD', '2025-01-02 09:15:00', '2025-01-08 16:30:00', 4);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '550e8400-e29b-41d4-a716-446655440001', 'MacBook Pro 16" M3 Max', 3499.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '550e8400-e29b-41d4-a716-446655440027', 'Herman Miller Aeron', 1695.00, 'USD', 1);

-- Order 2: Office setup - DELIVERED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'cust-002', 'ORD-2025-0002', 'Sarah Chen', 'sarah.chen@designstudio.io', '+1-212-555-0202',
 'DELIVERED', '350 Fifth Avenue, Floor 21', 'New York', 'NY', '10118', 'USA',
 2177.00, 'USD', '2025-01-03 14:22:00', '2025-01-09 11:45:00', 4);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '550e8400-e29b-41d4-a716-446655440011', 'Dell UltraSharp U2723QE', 749.00, 'USD', 2),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '550e8400-e29b-41d4-a716-446655440025', 'Fully Jarvis Bamboo', 699.00, 'USD', 1);

-- Order 3: Developer essentials - DELIVERED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'cust-003', 'ORD-2025-0003', 'Marcus Williams', 'marcus.w@codelab.dev', '+1-512-555-0303',
 'DELIVERED', '100 Congress Avenue, Unit 12B', 'Austin', 'TX', '78701', 'USA',
 897.00, 'USD', '2025-01-04 08:45:00', '2025-01-10 09:20:00', 4);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '550e8400-e29b-41d4-a716-446655440015', 'HHKB Professional Hybrid Type-S', 349.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '550e8400-e29b-41d4-a716-446655440017', 'Logitech MX Master 3S', 99.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '550e8400-e29b-41d4-a716-446655440030', 'Branch Ergonomic Chair', 449.00, 'USD', 1);

-- =====================================================
-- SHIPPED ORDERS (In Transit)
-- =====================================================

-- Order 4: Gaming setup - SHIPPED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'cust-004', 'ORD-2025-0004', 'Alex Rodriguez', 'alex.rod@gamerhq.gg', '+1-305-555-0404',
 'SHIPPED', '2000 Brickell Avenue, Apt 3401', 'Miami', 'FL', '33129', 'USA',
 4947.00, 'USD', '2025-01-06 19:30:00', '2025-01-11 08:15:00', 3);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '550e8400-e29b-41d4-a716-446655440004', 'ASUS ROG Zephyrus G16', 2999.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '550e8400-e29b-41d4-a716-446655440010', 'Samsung Odyssey G9 Neo', 1999.00, 'USD', 1);

-- Order 5: Audio equipment - SHIPPED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'cust-005', 'ORD-2025-0005', 'Emily Johnson', 'emily.j@podcastpro.fm', '+1-206-555-0505',
 'SHIPPED', '1551 Broadway, Studio 8C', 'Seattle', 'WA', '98101', 'USA',
 1037.00, 'USD', '2025-01-07 11:00:00', '2025-01-11 14:30:00', 3);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '550e8400-e29b-41d4-a716-446655440022', 'Shure SM7dB', 499.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '550e8400-e29b-41d4-a716-446655440023', 'Focusrite Scarlett 2i2 4th Gen', 189.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '550e8400-e29b-41d4-a716-446655440020', 'Sony WH-1000XM5', 349.00, 'USD', 1);

-- =====================================================
-- PROCESSING ORDERS (Being Prepared)
-- =====================================================

-- Order 6: Enterprise setup - PROCESSING
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'cust-006', 'ORD-2025-0006', 'David Kim', 'david.kim@enterprise-solutions.com', '+1-408-555-0606',
 'PROCESSING', '2855 Campus Drive, Building C', 'San Jose', 'CA', '95134', 'USA',
 3596.00, 'USD', '2025-01-08 15:45:00', '2025-01-11 09:00:00', 2);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '550e8400-e29b-41d4-a716-446655440003', 'ThinkPad X1 Carbon Gen 12', 1899.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '550e8400-e29b-41d4-a716-446655440031', 'CalDigit TS4 Thunderbolt Dock', 399.00, 'USD', 2),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '550e8400-e29b-41d4-a716-446655440039', 'JetBrains All Products Pack', 649.00, 'USD', 1);

-- Order 7: Network infrastructure - PROCESSING
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'cust-007', 'ORD-2025-0007', 'Jennifer Martinez', 'j.martinez@networkops.net', '+1-720-555-0707',
 'PROCESSING', '1600 Champa Street, Suite 400', 'Denver', 'CO', '80202', 'USA',
 1497.00, 'USD', '2025-01-09 10:20:00', '2025-01-11 16:45:00', 2);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '550e8400-e29b-41d4-a716-446655440035', 'Ubiquiti Dream Machine Pro', 499.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '550e8400-e29b-41d4-a716-446655440037', 'TP-Link Deco XE75 Pro (3-Pack)', 399.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '550e8400-e29b-41d4-a716-446655440038', 'Synology DS923+', 599.00, 'USD', 1);

-- =====================================================
-- CONFIRMED ORDERS (Awaiting Processing)
-- =====================================================

-- Order 8: Creative professional - CONFIRMED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'cust-008', 'ORD-2025-0008', 'Michael Brown', 'michael.b@creativestudio.art', '+1-323-555-0808',
 'CONFIRMED', '6922 Hollywood Blvd, Suite 1100', 'Los Angeles', 'CA', '90028', 'USA',
 4557.00, 'USD', '2025-01-10 09:30:00', '2025-01-11 10:00:00', 1);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', '550e8400-e29b-41d4-a716-446655440012', 'ASUS ProArt PA32UCG-K', 3499.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', '550e8400-e29b-41d4-a716-446655440040', 'Adobe Creative Cloud', 659.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', '550e8400-e29b-41d4-a716-446655440031', 'CalDigit TS4 Thunderbolt Dock', 399.00, 'USD', 1);

-- Order 9: Home office essentials - CONFIRMED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'cust-009', 'ORD-2025-0009', 'Lisa Thompson', 'lisa.t@remotework.io', '+1-312-555-0909',
 'CONFIRMED', '233 N Michigan Ave, Apt 2505', 'Chicago', 'IL', '60601', 'USA',
 1547.00, 'USD', '2025-01-10 14:15:00', '2025-01-11 11:30:00', 1);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', '550e8400-e29b-41d4-a716-446655440024', 'Uplift V2 Standing Desk', 899.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', '550e8400-e29b-41d4-a716-446655440029', 'Secretlab Titan Evo 2022', 549.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', '550e8400-e29b-41d4-a716-446655440017', 'Logitech MX Master 3S', 99.00, 'USD', 1);

-- =====================================================
-- PENDING ORDERS (Awaiting Confirmation)
-- =====================================================

-- Order 10: Bulk peripheral order - PENDING
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'cust-010', 'ORD-2025-0010', 'Robert Garcia', 'robert.g@techstartup.co', '+1-617-555-1010',
 'PENDING', '1 Federal Street, Floor 15', 'Boston', 'MA', '02110', 'USA',
 854.00, 'USD', '2025-01-11 08:00:00', '2025-01-11 08:05:00', 0);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', '550e8400-e29b-41d4-a716-446655440013', 'Keychron Q1 Pro', 199.00, 'USD', 3),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', '550e8400-e29b-41d4-a716-446655440017', 'Logitech MX Master 3S', 99.00, 'USD', 3);

-- Order 11: Workstation upgrade - PENDING
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'cust-011', 'ORD-2025-0011', 'Amanda White', 'amanda.w@dataanalytics.com', '+1-404-555-1111',
 'PENDING', '3500 Lenox Road NE, Suite 1500', 'Atlanta', 'GA', '30326', 'USA',
 7348.00, 'USD', '2025-01-11 09:45:00', '2025-01-11 09:50:00', 0);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '550e8400-e29b-41d4-a716-446655440006', 'Mac Studio M2 Ultra', 3999.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '550e8400-e29b-41d4-a716-446655440012', 'ASUS ProArt PA32UCG-K', 3499.00, 'USD', 1);

-- Order 12: Small accessories - PENDING
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'cust-012', 'ORD-2025-0012', 'Kevin Lee', 'kevin.lee@mobilepro.tech', '+1-503-555-1212',
 'PENDING', '1001 SW Fifth Avenue, Suite 200', 'Portland', 'OR', '97204', 'USA',
 527.00, 'USD', '2025-01-11 11:30:00', '2025-01-11 11:35:00', 0);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '550e8400-e29b-41d4-a716-446655440021', 'Apple AirPods Pro (2nd Gen)', 249.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '550e8400-e29b-41d4-a716-446655440034', 'Anker 737 Power Bank', 149.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '550e8400-e29b-41d4-a716-446655440032', 'Twelve South Curve Flex', 79.00, 'USD', 1);

-- =====================================================
-- DRAFT ORDERS (Work in Progress)
-- =====================================================

-- Order 13: Incomplete cart - DRAFT (no customer info yet)
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'cust-013', NULL, NULL, NULL, NULL,
 'DRAFT', '1234 Placeholder St', 'Phoenix', 'AZ', '85001', 'USA',
 2648.00, 'USD', '2025-01-11 16:00:00', '2025-01-11 16:20:00', 0);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '550e8400-e29b-41d4-a716-446655440005', 'HP Spectre x360 14', 1649.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '550e8400-e29b-41d4-a716-446655440009', 'LG UltraFine 32UN880-B', 799.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '550e8400-e29b-41d4-a716-446655440013', 'Keychron Q1 Pro', 199.00, 'USD', 1);

-- Order 14: Another draft order - DRAFT
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'cust-014', NULL, NULL, NULL, NULL,
 'DRAFT', '5678 Draft Lane', 'Minneapolis', 'MN', '55401', 'USA',
 599.00, 'USD', '2025-01-12 08:00:00', '2025-01-12 08:10:00', 0);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '550e8400-e29b-41d4-a716-446655440038', 'Synology DS923+', 599.00, 'USD', 1);

-- =====================================================
-- CANCELLED ORDERS (Historical)
-- =====================================================

-- Order 15: Customer changed mind - CANCELLED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, cancellation_reason, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'cust-015', 'ORD-2025-0013', 'Daniel Taylor', 'd.taylor@corporate.biz', '+1-713-555-1515',
 'CANCELLED', '1200 Smith Street, Suite 800', 'Houston', 'TX', '77002', 'USA',
 4598.00, 'USD', '2025-01-05 13:00:00', '2025-01-06 09:30:00', 'Customer requested cancellation - found better deal elsewhere', 2);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a36', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '550e8400-e29b-41d4-a716-446655440007', 'Custom Gaming PC - Titan', 4599.00, 'USD', 1);

-- Order 16: Payment issue - CANCELLED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, cancellation_reason, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'cust-016', 'ORD-2025-0014', 'Patricia Moore', 'p.moore@financeteam.org', '+1-602-555-1616',
 'CANCELLED', '2901 N Central Ave, Floor 12', 'Phoenix', 'AZ', '85012', 'USA',
 1998.00, 'USD', '2025-01-04 16:45:00', '2025-01-05 10:00:00', 'Payment verification failed - unable to process transaction', 2);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a37', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', '550e8400-e29b-41d4-a716-446655440010', 'Samsung Odyssey G9 Neo', 1999.00, 'USD', 1);

-- Order 17: Out of stock - CANCELLED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, cancellation_reason, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'cust-017', 'ORD-2025-0015', 'Christopher Davis', 'c.davis@homeoffice.net', '+1-619-555-1717',
 'CANCELLED', '525 B Street, Suite 1800', 'San Diego', 'CA', '92101', 'USA',
 1695.00, 'USD', '2025-01-03 11:20:00', '2025-01-04 14:00:00', 'Product discontinued and no longer available - full refund issued', 2);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a38', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', '550e8400-e29b-41d4-a716-446655440027', 'Herman Miller Aeron', 1695.00, 'USD', 1);

-- =====================================================
-- ADDITIONAL DIVERSE ORDERS FOR REALISTIC DATA
-- =====================================================

-- Order 18: International-style address (still USA) - DELIVERED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'cust-018', 'ORD-2025-0016', 'Sophia Anderson', 'sophia.a@globaltech.us', '+1-415-555-1818',
 'DELIVERED', '101 California Street, Suite 2500', 'San Francisco', 'CA', '94111', 'USA',
 1007.00, 'USD', '2025-01-01 07:30:00', '2025-01-07 15:00:00', 4);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a39', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', '550e8400-e29b-41d4-a716-446655440020', 'Sony WH-1000XM5', 349.00, 'USD', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a40', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', '550e8400-e29b-41d4-a716-446655440040', 'Adobe Creative Cloud', 659.00, 'USD', 1);

-- Order 19: Repeat customer - SHIPPED  
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'cust-001', 'ORD-2025-0017', 'John Mitchell', 'john.mitchell@techcorp.com', '+1-415-555-0101',
 'SHIPPED', '1 Market Street, Suite 500', 'San Francisco', 'CA', '94105', 'USA',
 498.00, 'USD', '2025-01-09 16:00:00', '2025-01-11 12:00:00', 3);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', '550e8400-e29b-41d4-a716-446655440021', 'Apple AirPods Pro (2nd Gen)', 249.00, 'USD', 2);

-- Order 20: High-value enterprise order - CONFIRMED
INSERT INTO orders (id, customer_id, order_number, customer_name, customer_email, customer_phone, status,
    shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country,
    subtotal, currency, created_at, updated_at, version) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'cust-020', 'ORD-2025-0018', 'Enterprise Solutions Inc.', 'procurement@enterprise-solutions.com', '+1-212-555-2020',
 'CONFIRMED', '1 World Trade Center, Floor 85', 'New York', 'NY', '10007', 'USA',
 15745.00, 'USD', '2025-01-10 08:00:00', '2025-01-11 09:30:00', 1);

INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, currency, quantity) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', '550e8400-e29b-41d4-a716-446655440002', 'Dell XPS 15 (2025)', 2299.00, 'USD', 5),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', '550e8400-e29b-41d4-a716-446655440011', 'Dell UltraSharp U2723QE', 749.00, 'USD', 5),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', '550e8400-e29b-41d4-a716-446655440014', 'Logitech MX Keys S', 109.00, 'USD', 5),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', '550e8400-e29b-41d4-a716-446655440017', 'Logitech MX Master 3S', 99.00, 'USD', 5);
