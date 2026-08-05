-- Run after Prisma has created the tables. Supabase's auth.uid() is used only for
-- user-owned rows. Server-side Prisma uses the service connection for trusted writes.
alter table "User" enable row level security;
alter table "Address" enable row level security;
alter table "Order" enable row level security;
alter table "WishlistItem" enable row level security;
alter table "Review" enable row level security;
alter table "Product" enable row level security;
alter table "Category" enable row level security;
alter table "ProductImage" enable row level security;

create policy "public can read active products" on "Product" for select using (active = true);
create policy "public can read active categories" on "Category" for select using (active = true);
create policy "public can read product images" on "ProductImage" for select using (true);
create policy "users read their profile" on "User" for select using (id = auth.uid()::text);
create policy "users update their profile" on "User" for update using (id = auth.uid()::text) with check (id = auth.uid()::text);
create policy "users manage their addresses" on "Address" for all using ("userId" = auth.uid()::text) with check ("userId" = auth.uid()::text);
create policy "users read their orders" on "Order" for select using ("userId" = auth.uid()::text);
create policy "users read their wishlist" on "WishlistItem" for all using ("userId" = auth.uid()::text) with check ("userId" = auth.uid()::text);
create policy "customers read approved reviews" on "Review" for select using (status = 'APPROVED');
create policy "customers create own reviews" on "Review" for insert with check ("userId" = auth.uid()::text);
