
CREATE TABLE public.therapist_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  modalities TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{en}',
  country TEXT,
  timezone TEXT,
  hourly_rate_cents INT,
  currency TEXT NOT NULL DEFAULT 'USD',
  years_experience INT,
  credentials TEXT,
  accepting_new_clients BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.therapist_profiles TO authenticated;
GRANT ALL ON public.therapist_profiles TO service_role;
ALTER TABLE public.therapist_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tp_browse" ON public.therapist_profiles FOR SELECT TO authenticated USING (accepting_new_clients = true OR auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "tp_self_write" ON public.therapist_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(),'clinician'))
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(),'clinician'));

CREATE TABLE public.therapist_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.therapist_availability TO authenticated;
GRANT ALL ON public.therapist_availability TO service_role;
ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ta_public_read" ON public.therapist_availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "ta_self_write" ON public.therapist_availability FOR ALL TO authenticated
  USING (auth.uid() = therapist_id AND public.has_role(auth.uid(),'clinician'))
  WITH CHECK (auth.uid() = therapist_id AND public.has_role(auth.uid(),'clinician'));

CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  client_id UUID NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes SMALLINT NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bk_client_rw" ON public.bookings FOR ALL TO authenticated
  USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "bk_therapist_rw" ON public.bookings FOR ALL TO authenticated
  USING (auth.uid() = therapist_id AND public.has_role(auth.uid(),'clinician'))
  WITH CHECK (auth.uid() = therapist_id AND public.has_role(auth.uid(),'clinician'));
CREATE POLICY "bk_admin_read" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.booking_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.booking_messages TO authenticated;
GRANT ALL ON public.booking_messages TO service_role;
ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bm_participants_read" ON public.booking_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.client_id = auth.uid() OR b.therapist_id = auth.uid()))
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "bm_participants_send" ON public.booking_messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.client_id = auth.uid() OR b.therapist_id = auth.uid())
  )
);

CREATE TRIGGER trg_tprof_updated BEFORE UPDATE ON public.therapist_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bk_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
