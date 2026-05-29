-- PsyDx clinician DSM-5 assessment workflow

CREATE TABLE public.clinical_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id uuid NOT NULL,
  client_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New assessment',
  status text NOT NULL DEFAULT 'in_progress', -- in_progress | complete | archived
  complaints jsonb NOT NULL DEFAULT '[]'::jsonb,
  characteristics jsonb NOT NULL DEFAULT '{}'::jsonb,
  impairment jsonb NOT NULL DEFAULT '{}'::jsonb,
  criteria_marks jsonb NOT NULL DEFAULT '{}'::jsonb,
  working_disorder_id uuid,
  severity text, -- mild | moderate | severe
  specifiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_flags text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_assessments TO authenticated;
GRANT ALL ON public.clinical_assessments TO service_role;

ALTER TABLE public.clinical_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY ca_clinician_all ON public.clinical_assessments
  FOR ALL TO authenticated
  USING (auth.uid() = clinician_id AND public.has_role(auth.uid(), 'clinician'))
  WITH CHECK (auth.uid() = clinician_id AND public.has_role(auth.uid(), 'clinician'));

CREATE POLICY ca_client_read ON public.clinical_assessments
  FOR SELECT TO authenticated USING (auth.uid() = client_id);

CREATE POLICY ca_admin_read ON public.clinical_assessments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ca_clinician ON public.clinical_assessments(clinician_id, updated_at DESC);
CREATE INDEX idx_ca_client ON public.clinical_assessments(client_id);

CREATE TRIGGER trg_ca_updated_at
  BEFORE UPDATE ON public.clinical_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();