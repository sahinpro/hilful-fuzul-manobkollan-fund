-- Allow deleting a donation when a receipt exists: remove child receipts with the parent.
alter table public.receipts
drop constraint if exists receipts_donation_id_fkey;

alter table public.receipts
add constraint receipts_donation_id_fkey
  foreign key (donation_id)
  references public.donations (id)
  on delete cascade;
