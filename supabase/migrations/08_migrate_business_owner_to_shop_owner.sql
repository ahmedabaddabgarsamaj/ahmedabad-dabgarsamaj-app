-- Migration 08: Migrate legacy BUSINESS_OWNER to SHOP_OWNER
-- Date: 2026-09-17

-- 1. Update family_members table
UPDATE public.family_members
SET 
    occupation_type = 'SHOP_OWNER',
    occupation_details = jsonb_set(
        jsonb_set(
            jsonb_set(
                COALESCE(occupation_details, '{}'::jsonb),
                '{shop_name}',
                COALESCE(occupation_details->'shop_name', occupation_details->'business_name', 'null'::jsonb)
            ),
            '{shop_type}',
            COALESCE(occupation_details->'shop_type', occupation_details->'business_type', 'null'::jsonb)
        ),
        '{shop_location}',
        COALESCE(occupation_details->'shop_location', occupation_details->'business_location', 'null'::jsonb)
    ),
    updated_at = NOW()
WHERE occupation_type ILIKE '%business%';

-- 2. Update occupation_records table
UPDATE public.occupation_records
SET 
    occupation_type = 'SHOP_OWNER',
    details = jsonb_set(
        jsonb_set(
            jsonb_set(
                COALESCE(details, '{}'::jsonb),
                '{shop_name}',
                COALESCE(details->'shop_name', details->'business_name', to_jsonb(business_name), 'null'::jsonb)
            ),
            '{shop_type}',
            COALESCE(details->'shop_type', details->'business_type', to_jsonb(business_type), 'null'::jsonb)
        ),
        '{shop_location}',
        COALESCE(details->'shop_location', details->'business_location', to_jsonb(work_location), 'null'::jsonb)
    ),
    updated_at = NOW()
WHERE occupation_type ILIKE '%business%';
