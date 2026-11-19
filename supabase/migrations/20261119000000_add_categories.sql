create table if not exists public.categories (
  id text primary key,
  label text not null,
  group_key text not null check (group_key in ('water-bodies', 'terrain', 'lighting-astronomy')),
  sort_order integer not null default 0
);

create table if not exists public.viewpoint_categories (
  viewpoint_id uuid not null references public.viewpoints(id) on delete cascade,
  category_id text not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (viewpoint_id, category_id)
);

create index if not exists viewpoint_categories_category_id_idx
  on public.viewpoint_categories(category_id);

insert into public.categories (id, label, group_key, sort_order) values
  ('river', 'River', 'water-bodies', 1),
  ('lake', 'Lake', 'water-bodies', 2),
  ('waterfall', 'Waterfall', 'water-bodies', 3),
  ('ocean', 'Ocean', 'water-bodies', 4),
  ('wetland', 'Wetland', 'water-bodies', 5),
  ('mountain', 'Mountain', 'terrain', 1),
  ('hill', 'Hill', 'terrain', 2),
  ('forest', 'Forest', 'terrain', 3),
  ('prairie', 'Prairie', 'terrain', 4),
  ('canyon', 'Canyon', 'terrain', 5),
  ('coast', 'Coast', 'terrain', 6),
  ('sunrise', 'Sunrise', 'lighting-astronomy', 1),
  ('sunset', 'Sunset', 'lighting-astronomy', 2),
  ('golden-hour', 'Golden hour', 'lighting-astronomy', 3),
  ('night-sky', 'Night sky', 'lighting-astronomy', 4),
  ('stargazing', 'Stargazing', 'lighting-astronomy', 5),
  ('city-lights', 'City lights', 'lighting-astronomy', 6)
on conflict (id) do update set
  label = excluded.label,
  group_key = excluded.group_key,
  sort_order = excluded.sort_order;

alter table public.categories enable row level security;
alter table public.viewpoint_categories enable row level security;

create policy "Categories are readable by everyone"
  on public.categories for select using (true);

create policy "Viewpoint categories are readable by everyone"
  on public.viewpoint_categories for select using (true);

create policy "Authenticated users can assign categories to viewpoints"
  on public.viewpoint_categories for insert to authenticated
  with check (exists (
    select 1 from public.viewpoints
    where viewpoints.id = viewpoint_categories.viewpoint_id
      and viewpoints.user_id = auth.uid()
  ));

create policy "Viewpoint owners can remove assigned categories"
  on public.viewpoint_categories for delete to authenticated
  using (exists (
    select 1 from public.viewpoints
    where viewpoints.id = viewpoint_categories.viewpoint_id
      and viewpoints.user_id = auth.uid()
  ));
