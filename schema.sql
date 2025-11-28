-- Enable PostGIS for location features (optional but good for future)
-- create extension if not exists postgis;

-- Users Table
create table public.users (
  id uuid references auth.users not null primary key,
  linkedin_profile jsonb, -- { name, photo, headline, company }
  zipcode text,
  -- Approximate location (lat/long)
  latitude double precision,
  longitude double precision,
  bio text,
  amenities jsonb default '[]'::jsonb, -- ["wifi_5g", "coffee_machine", "standing_desk"]
  trust_score int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Availability Table
create table public.availability (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  day_of_week int not null, -- 0 = Sunday, 1 = Monday, etc.
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings Table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references public.users(id) not null,
  guest_id uuid references public.users(id) not null,
  status text check (status in ('pending', 'accepted', 'rejected', 'completed')) default 'pending',
  scheduled_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.users enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;

-- Everyone can read basic user info (discovery)
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using ( true );

-- Users can update their own profile
create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );

-- Availability is public
create policy "Availability is viewable by everyone"
  on public.availability for select
  using ( true );

-- Bookings are visible to host and guest
create policy "Bookings visible to participants"
  on public.bookings for select
  using ( auth.uid() = host_id or auth.uid() = guest_id );
