-- =====================================================
-- market_research_requests table final cleanup
-- Date: 2025-01-13
-- Purpose: Remove 29 unnecessary fields not in documentation
-- =====================================================

-- 1. Remove product detail option fields (not mentioned in docs)
ALTER TABLE market_research_requests
DROP COLUMN IF EXISTS product_options,
DROP COLUMN IF EXISTS product_colors,
DROP COLUMN IF EXISTS product_dimensions,
DROP COLUMN IF EXISTS product_materials,
DROP COLUMN IF EXISTS product_functions,
DROP COLUMN IF EXISTS product_specifications,
DROP COLUMN IF EXISTS product_composition,
DROP COLUMN IF EXISTS additional_notes,
DROP COLUMN IF EXISTS product_width_cm,
DROP COLUMN IF EXISTS product_length_cm,
DROP COLUMN IF EXISTS product_height_cm;

-- 2. Remove duplicate/obsolete fields
ALTER TABLE market_research_requests
DROP COLUMN IF EXISTS moq_quantity,          -- moq_check is sufficient
DROP COLUMN IF EXISTS sample_quantity,       -- duplicate of sample_order_qty
DROP COLUMN IF EXISTS sample_china_price,    -- duplicate of china_unit_price
DROP COLUMN IF EXISTS shipping_cost_note,    -- unnecessary
DROP COLUMN IF EXISTS estimated_shipping_cost, -- replaced by fcl/lcl_shipping_fee
DROP COLUMN IF EXISTS shipping_cost,         -- replaced by fcl/lcl_shipping_fee
DROP COLUMN IF EXISTS second_payment_estimate, -- duplicate of expected_second_payment
DROP COLUMN IF EXISTS second_payment_note,   -- unnecessary
DROP COLUMN IF EXISTS estimated_tax,         -- import_vat is sufficient
DROP COLUMN IF EXISTS estimated_total_amount, -- duplicate of expected_total_supply_price
DROP COLUMN IF EXISTS quote_amount,          -- market research has no quote
DROP COLUMN IF EXISTS quote_sent_at,         -- market research has no quote
DROP COLUMN IF EXISTS research_completed_at; -- updated_at is sufficient

-- 3. Remove service type fields (unnecessary for market research only)
ALTER TABLE market_research_requests
DROP COLUMN IF EXISTS service_type,
DROP COLUMN IF EXISTS service_subtype;

-- 4. Remove fields specified in documentation
ALTER TABLE market_research_requests
DROP COLUMN IF EXISTS logo_print_details,    -- merged into logo_details
DROP COLUMN IF EXISTS payment_status;        -- market research has no payment

-- =====================================================
-- Completion message
-- =====================================================
-- Total deleted fields: 29
-- Remaining fields: 77 (106 to 77)