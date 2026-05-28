
-- DSM bookmarks
CREATE TABLE public.dsm_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  disorder_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, disorder_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsm_bookmarks TO authenticated;
GRANT ALL ON public.dsm_bookmarks TO service_role;

ALTER TABLE public.dsm_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dsm_bookmarks_self_all" ON public.dsm_bookmarks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_dsm_bookmarks_user ON public.dsm_bookmarks(user_id);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_self_read" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notif_self_update" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notif_self_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'clinician'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read_at);

-- Auto-notify on booking events
CREATE OR REPLACE FUNCTION public.notify_booking_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (NEW.therapist_id, 'booking_request', 'New booking request',
            'A client has requested a session with you.',
            '/bookings/' || NEW.id::text);
  ELSIF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (NEW.client_id, 'booking_status', 'Booking ' || NEW.status,
            'Your booking has been ' || NEW.status || '.',
            '/bookings/' || NEW.id::text);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_notify_booking
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_booking_event();

-- Auto-notify on new booking message
CREATE OR REPLACE FUNCTION public.notify_booking_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  recipient uuid;
BEGIN
  SELECT CASE WHEN b.client_id = NEW.sender_id THEN b.therapist_id ELSE b.client_id END
    INTO recipient
  FROM public.bookings b WHERE b.id = NEW.booking_id;

  IF recipient IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (recipient, 'booking_message', 'New message',
            substring(NEW.body from 1 for 120),
            '/bookings/' || NEW.booking_id::text);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_notify_booking_message
AFTER INSERT ON public.booking_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_booking_message();

-- Auto-notify on clinician verification status change
CREATE OR REPLACE FUNCTION public.notify_verification_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (NEW.user_id, 'verification', 'Verification ' || NEW.status,
            'Your clinician verification is now ' || NEW.status || '.',
            '/dashboard');
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_notify_verification
AFTER UPDATE ON public.clinician_verifications
FOR EACH ROW EXECUTE FUNCTION public.notify_verification_event();
