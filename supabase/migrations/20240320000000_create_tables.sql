-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Common fields for all users
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'provider', 'guardian')),
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Provider specific fields
    company_name TEXT,
    company_address TEXT,
    company_website TEXT,
    company_logo TEXT,
    company_description TEXT,
    company_contact_email TEXT,
    company_contact_phone TEXT,
    
    -- Guardian specific fields
    guardian_region TEXT,
    guardian_status TEXT CHECK (guardian_status IN ('active', 'inactive', 'pending')),
    guardian_notes TEXT,
    guardian_rating DECIMAL(3,2),
    guardian_reports_count INTEGER DEFAULT 0,
    
    -- Admin specific fields
    admin_level TEXT CHECK (admin_level IN ('super', 'regular')),
    admin_permissions TEXT[] DEFAULT '{}',
    last_login TIMESTAMPTZ
);


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

-- Enable Row Level Security for other tables
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for regions
CREATE POLICY "Anyone can view regions"
    ON public.regions FOR SELECT
    USING (true);

CREATE POLICY "Only admins and providers can modify regions"
    ON public.regions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'provider')
        )
    );

-- RLS Policies for objects
CREATE POLICY "Anyone can view objects"
    ON public.objects FOR SELECT
    USING (true);

CREATE POLICY "Only admins and providers can modify objects"
    ON public.objects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'provider')
        )
    );

-- RLS Policies for guardian_reports
CREATE POLICY "Anyone can view guardian reports"
    ON public.guardian_reports FOR SELECT
    USING (true);

CREATE POLICY "Guardians can create reports"
    ON public.guardian_reports FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'guardian'
        )
    );

CREATE POLICY "Guardians can update their own reports"
    ON public.guardian_reports FOR UPDATE
    USING (auth.uid() = guardian_id); 