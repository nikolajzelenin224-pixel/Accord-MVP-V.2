-- Accord MVP — схема БД
-- Выполнить целиком в Supabase Dashboard → SQL Editor

-- ============ PROFILES ============
-- Доп. данные к auth.users (Supabase Auth уже хранит phone, id)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  surname text,
  email text,
  avatar_url text,
  profile_completed_at timestamptz,
  payment_day smallint check (payment_day between 1 and 31),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Авто-создание профиля при регистрации
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============ CARDS ============
-- Статичные виртуальные карты-костыль (МИР/МС), привязанные к пользователю
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('mir', 'mc')),
  card_number text not null,
  expiry text not null,
  cvc text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, type)
);

alter table public.cards enable row level security;

create policy "Users can view own cards"
  on public.cards for select using (auth.uid() = user_id);

create policy "Users can insert own cards"
  on public.cards for insert with check (auth.uid() = user_id);


-- ============ REGISTRY SERVICES ============
-- Реестр популярных подписок (общий для всех пользователей, read-only с клиента)
create table public.registry_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  default_price numeric(10,2) not null default 0,
  category text,
  created_at timestamptz not null default now()
);

alter table public.registry_services enable row level security;

create policy "Anyone can read registry"
  on public.registry_services for select using (true);


-- ============ SUBSCRIPTIONS ============
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  registry_service_id uuid references public.registry_services(id),
  name text not null,
  price numeric(10,2) not null,
  logo_url text,
  period text not null default 'monthly',
  active boolean not null default true,
  card_id uuid references public.cards(id),
  binding_status text not null default 'pending_user_confirm'
    check (binding_status in ('pending_user_confirm', 'user_confirmed', 'system_confirmed')),
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can manage own subscriptions"
  on public.subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============ CHARGES ============
create table public.charges (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  due_date date not null,
  amount numeric(10,2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'due', 'success', 'failed')),
  confirmed_by text check (confirmed_by in ('admin', 'system')),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.charges enable row level security;

create policy "Users can view own charges"
  on public.charges for select
  using (
    exists (
      select 1 from public.subscriptions s
      where s.id = charges.subscription_id and s.user_id = auth.uid()
    )
  );


-- ============ BALANCE TOPUPS ============
create table public.balance_topups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null,
  method text not null default 'card_transfer',
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected')),
  confirmed_by text check (confirmed_by in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.balance_topups enable row level security;

create policy "Users can manage own topups"
  on public.balance_topups for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============ USER SETTINGS ============
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payment_day smallint check (payment_day between 1 and 31),
  computed_monthly_total numeric(10,2) not null default 0,
  balance numeric(10,2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "Users can manage own settings"
  on public.user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============ STORAGE: avatars bucket ============
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
