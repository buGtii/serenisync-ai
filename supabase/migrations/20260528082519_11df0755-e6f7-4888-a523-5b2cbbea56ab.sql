ALTER TABLE public.dsm_disorders
  ADD COLUMN IF NOT EXISTS symptoms text[],
  ADD COLUMN IF NOT EXISTS prevalence text,
  ADD COLUMN IF NOT EXISTS course text,
  ADD COLUMN IF NOT EXISTS treatment_overview text;