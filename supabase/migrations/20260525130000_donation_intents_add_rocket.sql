-- Allow Rocket on semi-auto donation intents (run after 20260525120000).

ALTER TABLE public.donation_intents
  DROP CONSTRAINT IF EXISTS donation_intents_payment_method_check;

ALTER TABLE public.donation_intents
  ADD CONSTRAINT donation_intents_payment_method_check
  CHECK (payment_method IN ('bkash', 'nagad', 'rocket'));
