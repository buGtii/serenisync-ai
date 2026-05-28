
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz,
  ADD COLUMN IF NOT EXISTS intent_role text,
  ADD COLUMN IF NOT EXISTS clinician_details jsonb,
  ADD COLUMN IF NOT EXISTS student_details jsonb,
  ADD COLUMN IF NOT EXISTS researcher_details jsonb;

CREATE TABLE IF NOT EXISTS public.clinician_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  specialization text,
  license_number text,
  license_country text,
  years_experience int,
  organization text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.clinician_verifications TO authenticated;
GRANT ALL ON public.clinician_verifications TO service_role;

ALTER TABLE public.clinician_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY cv_self_insert ON public.clinician_verifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY cv_self_read ON public.clinician_verifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY cv_admin_update ON public.clinician_verifications
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
