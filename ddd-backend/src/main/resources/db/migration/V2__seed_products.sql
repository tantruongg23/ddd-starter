-- =====================================================
-- V2: Seed Product Catalog Data
-- Realistic test data simulating production environment
-- =====================================================

-- =====================================================
-- ELECTRONICS CATEGORY
-- =====================================================

-- Laptops & Computers
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'MacBook Pro 16" M3 Max', 'Apple MacBook Pro with M3 Max chip, 36GB unified memory, 1TB SSD storage, Liquid Retina XDR display', 3499.0000, 'USD', 'ELEC-LAPTOP-001', 'ACTIVE', '2025-01-01 09:00:00', '2025-01-01 09:00:00', 0),
('550e8400-e29b-41d4-a716-446655440002', 'Dell XPS 15 (2025)', '15.6" OLED 3.5K InfinityEdge Display, Intel Core Ultra 9, 32GB RAM, 1TB SSD, NVIDIA RTX 4070', 2299.0000, 'USD', 'ELEC-LAPTOP-002', 'ACTIVE', '2025-01-01 09:00:00', '2025-01-01 09:00:00', 0),
('550e8400-e29b-41d4-a716-446655440003', 'ThinkPad X1 Carbon Gen 12', 'Enterprise ultrabook with Intel Core Ultra 7, 32GB RAM, 512GB SSD, 14" 2.8K OLED display', 1899.0000, 'USD', 'ELEC-LAPTOP-003', 'ACTIVE', '2025-01-02 10:30:00', '2025-01-02 10:30:00', 0),
('550e8400-e29b-41d4-a716-446655440004', 'ASUS ROG Zephyrus G16', 'Gaming laptop with Intel Core i9-14900HX, NVIDIA RTX 4090, 32GB DDR5, 2TB SSD, 16" QHD+ 240Hz', 2999.0000, 'USD', 'ELEC-LAPTOP-004', 'ACTIVE', '2025-01-02 10:30:00', '2025-01-02 10:30:00', 0),
('550e8400-e29b-41d4-a716-446655440005', 'HP Spectre x360 14', 'Convertible laptop with Intel Core Ultra 7, 16GB RAM, 1TB SSD, 14" 2.8K OLED touch display', 1649.0000, 'USD', 'ELEC-LAPTOP-005', 'ACTIVE', '2025-01-03 14:15:00', '2025-01-03 14:15:00', 0);

-- Desktop Computers
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440006', 'Mac Studio M2 Ultra', 'Apple Mac Studio with M2 Ultra chip, 64GB unified memory, 1TB SSD, desktop powerhouse', 3999.0000, 'USD', 'ELEC-DESK-001', 'ACTIVE', '2025-01-03 14:15:00', '2025-01-03 14:15:00', 0),
('550e8400-e29b-41d4-a716-446655440007', 'Custom Gaming PC - Titan', 'Intel Core i9-14900KS, RTX 4090 24GB, 64GB DDR5-6400, 2TB NVMe Gen5 SSD, Custom loop cooling', 4599.0000, 'USD', 'ELEC-DESK-002', 'ACTIVE', '2025-01-04 08:45:00', '2025-01-04 08:45:00', 0),
('550e8400-e29b-41d4-a716-446655440008', 'Dell OptiPlex 7020', 'Business desktop with Intel Core i7-14700, 16GB DDR5, 512GB SSD, Windows 11 Pro', 1149.0000, 'USD', 'ELEC-DESK-003', 'ACTIVE', '2025-01-04 08:45:00', '2025-01-04 08:45:00', 0);

-- Monitors
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440009', 'LG UltraFine 32UN880-B', '32" 4K UHD IPS Monitor, Ergo Stand, USB-C, HDR10, 60Hz, perfect for content creators', 799.0000, 'USD', 'ELEC-MON-001', 'ACTIVE', '2025-01-05 11:20:00', '2025-01-05 11:20:00', 0),
('550e8400-e29b-41d4-a716-446655440010', 'Samsung Odyssey G9 Neo', '49" Dual QHD Curved Gaming Monitor, 240Hz, 1ms, Mini LED, Quantum HDR 2000', 1999.0000, 'USD', 'ELEC-MON-002', 'ACTIVE', '2025-01-05 11:20:00', '2025-01-05 11:20:00', 0),
('550e8400-e29b-41d4-a716-446655440011', 'Dell UltraSharp U2723QE', '27" 4K USB-C Hub Monitor, IPS Black, 100% sRGB, 98% DCI-P3, built-in KVM', 749.0000, 'USD', 'ELEC-MON-003', 'ACTIVE', '2025-01-06 09:00:00', '2025-01-06 09:00:00', 0),
('550e8400-e29b-41d4-a716-446655440012', 'ASUS ProArt PA32UCG-K', '32" 4K Mini LED Professional Monitor, 120Hz, Thunderbolt 4, Hardware Calibration', 3499.0000, 'USD', 'ELEC-MON-004', 'ACTIVE', '2025-01-06 09:00:00', '2025-01-06 09:00:00', 0);

-- Peripherals - Keyboards
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440013', 'Keychron Q1 Pro', '75% wireless mechanical keyboard, QMK/VIA support, hot-swappable Gateron G Pro switches, RGB', 199.0000, 'USD', 'ELEC-KEY-001', 'ACTIVE', '2025-01-07 15:30:00', '2025-01-07 15:30:00', 0),
('550e8400-e29b-41d4-a716-446655440014', 'Logitech MX Keys S', 'Advanced wireless illuminated keyboard, Smart Backlighting, USB-C, multi-device', 109.0000, 'USD', 'ELEC-KEY-002', 'ACTIVE', '2025-01-07 15:30:00', '2025-01-07 15:30:00', 0),
('550e8400-e29b-41d4-a716-446655440015', 'HHKB Professional Hybrid Type-S', 'Premium topre switch keyboard, silent, wireless, compact layout for programmers', 349.0000, 'USD', 'ELEC-KEY-003', 'ACTIVE', '2025-01-08 10:00:00', '2025-01-08 10:00:00', 0),
('550e8400-e29b-41d4-a716-446655440016', 'Das Keyboard 4 Professional', 'Cherry MX Blue switches, media controls, aluminum top panel, USB hub', 169.0000, 'USD', 'ELEC-KEY-004', 'INACTIVE', '2025-01-08 10:00:00', '2025-01-10 12:00:00', 1);

-- Peripherals - Mice
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440017', 'Logitech MX Master 3S', 'Advanced wireless mouse, 8K DPI, quiet clicks, USB-C, multi-device, MagSpeed scroll', 99.0000, 'USD', 'ELEC-MOUSE-001', 'ACTIVE', '2025-01-09 13:45:00', '2025-01-09 13:45:00', 0),
('550e8400-e29b-41d4-a716-446655440018', 'Razer DeathAdder V3 Pro', 'Wireless ergonomic esports mouse, Focus Pro 30K sensor, 90 hour battery, 63g', 149.0000, 'USD', 'ELEC-MOUSE-002', 'ACTIVE', '2025-01-09 13:45:00', '2025-01-09 13:45:00', 0),
('550e8400-e29b-41d4-a716-446655440019', 'Apple Magic Mouse', 'Wireless rechargeable mouse with multi-touch surface, Lightning to USB-C cable included', 99.0000, 'USD', 'ELEC-MOUSE-003', 'ACTIVE', '2025-01-10 08:30:00', '2025-01-10 08:30:00', 0);

-- Audio Equipment
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Sony WH-1000XM5', 'Premium noise cancelling wireless headphones, 30hr battery, multipoint connection', 349.0000, 'USD', 'ELEC-AUDIO-001', 'ACTIVE', '2025-01-10 08:30:00', '2025-01-10 08:30:00', 0),
('550e8400-e29b-41d4-a716-446655440021', 'Apple AirPods Pro (2nd Gen)', 'Active noise cancellation, Adaptive Audio, USB-C MagSafe charging case', 249.0000, 'USD', 'ELEC-AUDIO-002', 'ACTIVE', '2025-01-11 11:00:00', '2025-01-11 11:00:00', 0),
('550e8400-e29b-41d4-a716-446655440022', 'Shure SM7dB', 'Dynamic vocal microphone with built-in preamp, podcast and streaming quality', 499.0000, 'USD', 'ELEC-AUDIO-003', 'ACTIVE', '2025-01-11 11:00:00', '2025-01-11 11:00:00', 0),
('550e8400-e29b-41d4-a716-446655440023', 'Focusrite Scarlett 2i2 4th Gen', 'USB-C audio interface, 2 mic preamps, Air mode, studio quality recording', 189.0000, 'USD', 'ELEC-AUDIO-004', 'ACTIVE', '2025-01-11 14:00:00', '2025-01-11 14:00:00', 0);

-- =====================================================
-- HOME & OFFICE CATEGORY
-- =====================================================

-- Standing Desks
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440024', 'Uplift V2 Standing Desk', '72" x 30" bamboo top, electric height adjustable, programmable memory, 355lb capacity', 899.0000, 'USD', 'HOME-DESK-001', 'ACTIVE', '2025-01-11 14:00:00', '2025-01-11 14:00:00', 0),
('550e8400-e29b-41d4-a716-446655440025', 'Fully Jarvis Bamboo', '60" x 30" contoured bamboo desk, programmable controller, wire management', 699.0000, 'USD', 'HOME-DESK-002', 'ACTIVE', '2025-01-12 09:15:00', '2025-01-12 09:15:00', 0),
('550e8400-e29b-41d4-a716-446655440026', 'Secretlab Magnus Pro', 'Sit-stand metal gaming desk, integrated cable management, RGB underglow', 799.0000, 'USD', 'HOME-DESK-003', 'ACTIVE', '2025-01-12 09:15:00', '2025-01-12 09:15:00', 0);

-- Ergonomic Chairs
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440027', 'Herman Miller Aeron', 'Size C, Graphite, fully loaded with PostureFit SL, 12-year warranty', 1695.0000, 'USD', 'HOME-CHAIR-001', 'ACTIVE', '2025-01-12 14:30:00', '2025-01-12 14:30:00', 0),
('550e8400-e29b-41d4-a716-446655440028', 'Steelcase Leap V2', 'Ergonomic task chair, LiveBack technology, 4D adjustable arms, lumbar support', 1299.0000, 'USD', 'HOME-CHAIR-002', 'ACTIVE', '2025-01-12 14:30:00', '2025-01-12 14:30:00', 0),
('550e8400-e29b-41d4-a716-446655440029', 'Secretlab Titan Evo 2022', 'XL size, SoftWeave Plus fabric, 4D armrests, magnetic memory foam pillow', 549.0000, 'USD', 'HOME-CHAIR-003', 'ACTIVE', '2025-01-13 10:00:00', '2025-01-13 10:00:00', 0),
('550e8400-e29b-41d4-a716-446655440030', 'Branch Ergonomic Chair', 'High-back mesh, adjustable lumbar, synchro-tilt, 7-year warranty', 449.0000, 'USD', 'HOME-CHAIR-004', 'ACTIVE', '2025-01-13 10:00:00', '2025-01-13 10:00:00', 0);

-- Desk Accessories
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'CalDigit TS4 Thunderbolt Dock', '18 ports, 98W charging, 2.5GbE, 3x Thunderbolt 4, SD/microSD slots', 399.0000, 'USD', 'HOME-ACC-001', 'ACTIVE', '2025-01-13 15:45:00', '2025-01-13 15:45:00', 0),
('550e8400-e29b-41d4-a716-446655440032', 'Twelve South Curve Flex', 'Adjustable laptop stand, aluminum, folds flat for travel, ergonomic height', 79.0000, 'USD', 'HOME-ACC-002', 'ACTIVE', '2025-01-13 15:45:00', '2025-01-13 15:45:00', 0),
('550e8400-e29b-41d4-a716-446655440033', 'Grovemade Desk Shelf', 'Walnut wood monitor stand with storage, premium craftsmanship, cable routing', 180.0000, 'USD', 'HOME-ACC-003', 'ACTIVE', '2025-01-14 08:00:00', '2025-01-14 08:00:00', 0),
('550e8400-e29b-41d4-a716-446655440034', 'Anker 737 Power Bank', '24,000mAh portable charger, 140W output, smart digital display, USB-C', 149.0000, 'USD', 'HOME-ACC-004', 'ACTIVE', '2025-01-14 08:00:00', '2025-01-14 08:00:00', 0);

-- =====================================================
-- NETWORKING CATEGORY
-- =====================================================
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440035', 'Ubiquiti Dream Machine Pro', 'Enterprise network appliance, UniFi OS, 10G SFP+, IDS/IPS, built-in NVR', 499.0000, 'USD', 'NET-ROUTER-001', 'ACTIVE', '2025-01-14 11:30:00', '2025-01-14 11:30:00', 0),
('550e8400-e29b-41d4-a716-446655440036', 'ASUS RT-AX89X', 'AX6000 dual-band WiFi 6 router, 2x 10G ports, AiMesh support, gaming optimization', 449.0000, 'USD', 'NET-ROUTER-002', 'ACTIVE', '2025-01-14 11:30:00', '2025-01-14 11:30:00', 0),
('550e8400-e29b-41d4-a716-446655440037', 'TP-Link Deco XE75 Pro (3-Pack)', 'AXE5400 tri-band WiFi 6E mesh system, covers 7200 sq ft, 200+ devices', 399.0000, 'USD', 'NET-MESH-001', 'ACTIVE', '2025-01-15 09:00:00', '2025-01-15 09:00:00', 0),
('550e8400-e29b-41d4-a716-446655440038', 'Synology DS923+', '4-bay NAS, AMD Ryzen R1600, 4GB DDR4 ECC, dual M.2 slots, 2x 1GbE', 599.0000, 'USD', 'NET-NAS-001', 'ACTIVE', '2025-01-15 09:00:00', '2025-01-15 09:00:00', 0);

-- =====================================================
-- SOFTWARE & SERVICES (Digital Products)
-- =====================================================
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440039', 'JetBrains All Products Pack', 'Annual subscription: IntelliJ, PyCharm, WebStorm, all IDEs and .NET tools', 649.0000, 'USD', 'SOFT-IDE-001', 'ACTIVE', '2025-01-15 14:00:00', '2025-01-15 14:00:00', 0),
('550e8400-e29b-41d4-a716-446655440040', 'Adobe Creative Cloud', 'Annual plan: Photoshop, Illustrator, Premiere Pro, After Effects, all apps', 659.0000, 'USD', 'SOFT-DESIGN-001', 'ACTIVE', '2025-01-15 14:00:00', '2025-01-15 14:00:00', 0),
('550e8400-e29b-41d4-a716-446655440041', '1Password Teams', 'Annual team plan for 10 users, advanced security, admin console, 5GB storage', 199.0000, 'USD', 'SOFT-SEC-001', 'ACTIVE', '2025-01-16 10:00:00', '2025-01-16 10:00:00', 0);

-- =====================================================
-- DRAFT PRODUCTS (Not yet available)
-- =====================================================
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440042', 'Next-Gen VR Headset Pro', 'Upcoming virtual reality headset with 8K per eye, wireless, full body tracking', 1499.0000, 'USD', 'ELEC-VR-001', 'DRAFT', '2025-01-16 10:00:00', '2025-01-16 10:00:00', 0),
('550e8400-e29b-41d4-a716-446655440043', 'AI-Powered Smart Speaker X', 'Premium smart speaker with custom AI, spatial audio, matter hub integration', 599.0000, 'USD', 'ELEC-SMART-001', 'DRAFT', '2025-01-16 15:30:00', '2025-01-16 15:30:00', 0),
('550e8400-e29b-41d4-a716-446655440044', 'Modular Mechanical Keyboard', 'Hot-swappable magnetic switches, programmable OLED, gasket mount, CNC aluminum', 299.0000, 'USD', 'ELEC-KEY-005', 'DRAFT', '2025-01-16 15:30:00', '2025-01-16 15:30:00', 0);

-- =====================================================
-- INACTIVE PRODUCTS (Discontinued)
-- =====================================================
INSERT INTO products (id, name, description, price, currency, sku, status, created_at, updated_at, version) VALUES
('550e8400-e29b-41d4-a716-446655440045', 'Legacy Webcam HD 1080p', 'Basic USB webcam, auto-focus, built-in microphone - DISCONTINUED', 49.0000, 'USD', 'ELEC-CAM-001', 'INACTIVE', '2024-06-01 09:00:00', '2025-01-01 10:00:00', 2),
('550e8400-e29b-41d4-a716-446655440046', 'USB-A Hub 4-Port', '4-port USB 3.0 hub, bus powered - replaced by USB-C models', 29.0000, 'USD', 'HOME-ACC-005', 'INACTIVE', '2024-03-15 11:00:00', '2025-01-05 09:00:00', 1);
