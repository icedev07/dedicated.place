-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create regions table
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name_de TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_de TEXT,
    description_en TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create objects table
CREATE TABLE IF NOT EXISTS public.objects (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
    title_de TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_de TEXT,
    description_en TEXT,
    type TEXT NOT NULL,
    custom_type_name TEXT,
    special_tag TEXT,
    image_urls TEXT[] DEFAULT '{}',
    location_text TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    price DECIMAL(10,2) NOT NULL,
    duration_years INTEGER NOT NULL,
    plaque_allowed BOOLEAN DEFAULT false,
    plaque_max_chars INTEGER,
    status TEXT NOT NULL CHECK (status IN ('available', 'reserved', 'booked', 'inactive')),
    booking_url TEXT,
    share_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create guardian_reports table
CREATE TABLE IF NOT EXISTS public.guardian_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardian_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    object_id BIGINT REFERENCES public.objects(id) ON DELETE CASCADE,
    status_note TEXT,
    status_type TEXT NOT NULL CHECK (status_type IN ('ok', 'damaged', 'needs_repair', 'other')),
    image_urls TEXT[] DEFAULT '{}',
    location_text TEXT,
    is_public BOOLEAN DEFAULT false,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view regions" ON public.regions;
DROP POLICY IF EXISTS "Only admins and providers can modify regions" ON public.regions;
DROP POLICY IF EXISTS "Anyone can view objects" ON public.objects;
DROP POLICY IF EXISTS "Only admins and providers can modify objects" ON public.objects;
DROP POLICY IF EXISTS "Anyone can view guardian reports" ON public.guardian_reports;
DROP POLICY IF EXISTS "Guardians can create reports" ON public.guardian_reports;
DROP POLICY IF EXISTS "Guardians can update their own reports" ON public.guardian_reports;

-- RLS Policies for regions
CREATE POLICY "Anyone can view regions"
    ON public.regions FOR SELECT
    USING (true);

CREATE POLICY "Only admins and providers can modify regions"
    ON public.regions FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        (auth.jwt() ->> 'role' = 'provider' AND provider_id = auth.uid())
    );

-- RLS Policies for objects
CREATE POLICY "Anyone can view objects"
    ON public.objects FOR SELECT
    USING (true);

CREATE POLICY "Only admins and providers can modify objects"
    ON public.objects FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        (auth.jwt() ->> 'role' = 'provider' AND provider_id = auth.uid())
    );

-- RLS Policies for guardian_reports
CREATE POLICY "Anyone can view guardian reports"
    ON public.guardian_reports FOR SELECT
    USING (true);

CREATE POLICY "Guardians can create reports"
    ON public.guardian_reports FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'guardian');

CREATE POLICY "Guardians can update their own reports"
    ON public.guardian_reports FOR UPDATE
    USING (auth.uid() = guardian_id); 