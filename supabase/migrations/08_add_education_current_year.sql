-- ==============================================================================
-- 08_add_education_current_year.sql
-- સભ્યના એજ્યુકેશન રેકોર્ડમાં અભ્યાસ વર્ષ (Current Year) સુનિશ્ચિત કરવા માટેની સ્ક્રિપ્ટ
-- Supabase Dashboard -> SQL Editor માં રન કરવી.
-- ==============================================================================

-- 1. education_records ટેબલમાં current_year કોલમ ઉમેરો (જો પહેલેથી ન હોય તો)
ALTER TABLE IF EXISTS public.education_records 
ADD COLUMN IF NOT EXISTS current_year TEXT;

-- 2. ઝડપી ક્વેરી અને ઇન્ડેક્સિંગ માટે ઇન્ડેક્સ
CREATE INDEX IF NOT EXISTS idx_education_records_current_year 
ON public.education_records(current_year);

COMMENT ON COLUMN public.education_records.current_year IS 'College/Degree current studying year e.g. 1st Year, 2nd Year, 3rd Year, 4th Year, 5th Year';
