
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE public.clinician_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinician_id UUID NOT NULL,
  client_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinician_id, client_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinician_clients TO authenticated;
GRANT ALL ON public.clinician_clients TO service_role;
ALTER TABLE public.clinician_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cc_clinician_all" ON public.clinician_clients FOR ALL TO authenticated
  USING (auth.uid() = clinician_id AND public.has_role(auth.uid(),'clinician'))
  WITH CHECK (auth.uid() = clinician_id AND public.has_role(auth.uid(),'clinician'));
CREATE POLICY "cc_client_read" ON public.clinician_clients FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "cc_admin_read" ON public.clinician_clients FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.session_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinician_id UUID NOT NULL,
  client_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subjective TEXT, objective TEXT, assessment TEXT, plan TEXT,
  risk_flags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_notes TO authenticated;
GRANT ALL ON public.session_notes TO service_role;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sn_clinician_all" ON public.session_notes FOR ALL TO authenticated
  USING (auth.uid() = clinician_id AND public.has_role(auth.uid(),'clinician'))
  WITH CHECK (auth.uid() = clinician_id AND public.has_role(auth.uid(),'clinician'));
CREATE POLICY "sn_client_read" ON public.session_notes FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "sn_admin_read" ON public.session_notes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.assessment_administrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinician_id UUID,
  client_id UUID NOT NULL,
  instrument TEXT NOT NULL,
  answers JSONB NOT NULL,
  total_score INT NOT NULL,
  severity TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_administrations TO authenticated;
GRANT ALL ON public.assessment_administrations TO service_role;
ALTER TABLE public.assessment_administrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aa_clinician_all" ON public.assessment_administrations FOR ALL TO authenticated
  USING (auth.uid() = clinician_id AND public.has_role(auth.uid(),'clinician'))
  WITH CHECK (auth.uid() = clinician_id AND public.has_role(auth.uid(),'clinician'));
CREATE POLICY "aa_client_rw" ON public.assessment_administrations FOR ALL TO authenticated
  USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "aa_admin_read" ON public.assessment_administrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.treatment_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinician_id UUID NOT NULL,
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  diagnosis TEXT,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  interventions JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.treatment_plans TO authenticated;
GRANT ALL ON public.treatment_plans TO service_role;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tp_clinician_all" ON public.treatment_plans FOR ALL TO authenticated
  USING (auth.uid() = clinician_id AND public.has_role(auth.uid(),'clinician'))
  WITH CHECK (auth.uid() = clinician_id AND public.has_role(auth.uid(),'clinician'));
CREATE POLICY "tp_client_read" ON public.treatment_plans FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "tp_admin_read" ON public.treatment_plans FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_cc_updated BEFORE UPDATE ON public.clinician_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sn_updated BEFORE UPDATE ON public.session_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tp_updated BEFORE UPDATE ON public.treatment_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
