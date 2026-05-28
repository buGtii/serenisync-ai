
-- =============================================================================
-- ENUMS
-- =============================================================================
CREATE TYPE public.app_role AS ENUM ('guest','client','student','researcher','clinician','supervisor','admin');
CREATE TYPE public.consent_kind AS ENUM ('terms','privacy','clinical_disclaimer','ai_use','research');
CREATE TYPE public.crisis_kind AS ENUM ('suicide','self_harm','psychosis','violence','substance_withdrawal','other');

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  locale text NOT NULL DEFAULT 'en',
  country text,
  timezone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- =============================================================================
-- USER ROLES (separate table per security best practice)
-- =============================================================================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Admin policy for user_roles
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + default 'client' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'client'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- CONSENTS
-- =============================================================================
CREATE TABLE public.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.consent_kind NOT NULL,
  version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, version)
);
GRANT SELECT, INSERT ON public.consents TO authenticated;
GRANT ALL ON public.consents TO service_role;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consents_self_rw" ON public.consents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "consents_self_insert" ON public.consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text,
  resource_id text,
  metadata jsonb,
  ip text,
  user_agent text,
  at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "audit_logs_self_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id IS NULL OR actor_id = auth.uid());

-- =============================================================================
-- CRISIS EVENTS
-- =============================================================================
CREATE TABLE public.crisis_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind public.crisis_kind NOT NULL,
  source text NOT NULL DEFAULT 'ai_chat',
  excerpt text,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.crisis_events TO authenticated;
GRANT ALL ON public.crisis_events TO service_role;
ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crisis_self_read" ON public.crisis_events FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'clinician'));
CREATE POLICY "crisis_self_insert" ON public.crisis_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- WELLNESS: mood logs + journal
-- =============================================================================
CREATE TABLE public.mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood smallint NOT NULL CHECK (mood BETWEEN 1 AND 10),
  energy smallint CHECK (energy BETWEEN 1 AND 10),
  anxiety smallint CHECK (anxiety BETWEEN 1 AND 10),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.mood_logs (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_logs TO authenticated;
GRANT ALL ON public.mood_logs TO service_role;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mood_self_all" ON public.mood_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.journal_entries (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journal_self_all" ON public.journal_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- AI CHAT
-- =============================================================================
CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  context text NOT NULL DEFAULT 'wellness',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.ai_conversations (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_conv_self_all" ON public.ai_conversations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.ai_messages (conversation_id, created_at);
GRANT SELECT, INSERT, DELETE ON public.ai_messages TO authenticated;
GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_msg_self_all" ON public.ai_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- DSM-5-TR LEARNING ENGINE (paraphrased framework — verbatim APA text NOT stored)
-- =============================================================================
CREATE TABLE public.dsm_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  number smallint NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  color_hint text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dsm_chapters TO authenticated, anon;
GRANT ALL ON public.dsm_chapters TO service_role;
ALTER TABLE public.dsm_chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dsm_chapters_public_read" ON public.dsm_chapters FOR SELECT USING (true);

CREATE TABLE public.dsm_disorders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.dsm_chapters(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  icd10 text,
  icd11 text,
  overview text NOT NULL,
  duration_requirement text,
  exclusion_criteria text,
  functional_impairment text,
  differential_diagnoses text[],
  comorbidities text[],
  risk_factors text[],
  developmental_considerations text,
  gender_considerations text,
  cultural_considerations text,
  is_seeded boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.dsm_disorders (chapter_id);
GRANT SELECT ON public.dsm_disorders TO authenticated, anon;
GRANT ALL ON public.dsm_disorders TO service_role;
ALTER TABLE public.dsm_disorders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dsm_disorders_public_read" ON public.dsm_disorders FOR SELECT USING (true);

CREATE TABLE public.dsm_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disorder_id uuid NOT NULL REFERENCES public.dsm_disorders(id) ON DELETE CASCADE,
  code text NOT NULL,
  description text NOT NULL,
  ordinal smallint NOT NULL DEFAULT 0
);
CREATE INDEX ON public.dsm_criteria (disorder_id, ordinal);
GRANT SELECT ON public.dsm_criteria TO authenticated, anon;
GRANT ALL ON public.dsm_criteria TO service_role;
ALTER TABLE public.dsm_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dsm_criteria_public_read" ON public.dsm_criteria FOR SELECT USING (true);

CREATE TABLE public.dsm_specifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disorder_id uuid NOT NULL REFERENCES public.dsm_disorders(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text
);
GRANT SELECT ON public.dsm_specifiers TO authenticated, anon;
GRANT ALL ON public.dsm_specifiers TO service_role;
ALTER TABLE public.dsm_specifiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dsm_specifiers_public_read" ON public.dsm_specifiers FOR SELECT USING (true);

CREATE TABLE public.dsm_assessment_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disorder_id uuid REFERENCES public.dsm_disorders(id) ON DELETE CASCADE,
  name text NOT NULL,
  acronym text,
  description text
);
GRANT SELECT ON public.dsm_assessment_tools TO authenticated, anon;
GRANT ALL ON public.dsm_assessment_tools TO service_role;
ALTER TABLE public.dsm_assessment_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dsm_tools_public_read" ON public.dsm_assessment_tools FOR SELECT USING (true);

-- =============================================================================
-- STUDENT QUIZ ATTEMPTS
-- =============================================================================
CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.dsm_chapters(id) ON DELETE SET NULL,
  score smallint NOT NULL,
  total smallint NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.quiz_attempts (user_id, created_at DESC);
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_self_all" ON public.quiz_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- SEED DATA: all 20 DSM-5-TR chapters (paraphrased summaries)
-- =============================================================================
INSERT INTO public.dsm_chapters (slug, number, title, summary, color_hint) VALUES
('neurodevelopmental', 1, 'Neurodevelopmental Disorders', 'A group of conditions with onset in the developmental period that produce impairments of personal, social, academic, or occupational functioning. Includes intellectual developmental disorder, communication disorders, autism spectrum disorder, ADHD, specific learning disorder, and motor disorders.', 'sage'),
('schizophrenia-spectrum', 2, 'Schizophrenia Spectrum & Other Psychotic Disorders', 'Conditions characterized by abnormalities in one or more of: delusions, hallucinations, disorganized thinking, grossly disorganized or abnormal motor behavior, and negative symptoms.', 'lavender'),
('bipolar', 3, 'Bipolar & Related Disorders', 'Disorders involving episodes of mania, hypomania, and depression, characterized by significant disturbances in mood, energy, and activity levels.', 'amber'),
('depressive', 4, 'Depressive Disorders', 'Conditions sharing the presence of sad, empty, or irritable mood accompanied by somatic and cognitive changes that significantly affect capacity to function.', 'navy'),
('anxiety', 5, 'Anxiety Disorders', 'Conditions sharing features of excessive fear and anxiety and related behavioral disturbances. Includes separation anxiety, selective mutism, specific phobias, social anxiety, panic disorder, agoraphobia, and GAD.', 'mist'),
('ocd', 6, 'Obsessive-Compulsive & Related Disorders', 'Conditions characterized by recurrent intrusive thoughts and/or repetitive behaviors. Includes OCD, body dysmorphic disorder, hoarding, trichotillomania, and excoriation.', 'sage'),
('trauma', 7, 'Trauma- & Stressor-Related Disorders', 'Conditions in which exposure to a traumatic or stressful event is listed explicitly as a diagnostic criterion. Includes PTSD, acute stress disorder, adjustment disorders, and reactive attachment.', 'navy'),
('dissociative', 8, 'Dissociative Disorders', 'Disorders characterized by disruption of and/or discontinuity in the normal integration of consciousness, memory, identity, emotion, perception, body representation, and behavior.', 'lavender'),
('somatic', 9, 'Somatic Symptom & Related Disorders', 'Conditions in which somatic symptoms are associated with significant distress and impairment. Includes somatic symptom disorder, illness anxiety, conversion, and factitious disorder.', 'mist'),
('eating', 10, 'Feeding & Eating Disorders', 'Persistent disturbance of eating or eating-related behavior that results in altered consumption or absorption of food and significantly impairs health or functioning.', 'amber'),
('elimination', 11, 'Elimination Disorders', 'Inappropriate elimination of urine (enuresis) or feces (encopresis), usually first diagnosed in childhood or adolescence.', 'sage'),
('sleep-wake', 12, 'Sleep-Wake Disorders', 'Conditions involving complaints about the quality, timing, and amount of sleep. Includes insomnia, hypersomnolence, narcolepsy, breathing-related, circadian rhythm, and parasomnias.', 'navy'),
('sexual', 13, 'Sexual Dysfunctions', 'A heterogeneous group of disorders typically characterized by a clinically significant disturbance in a person''s ability to respond sexually or to experience sexual pleasure.', 'mist'),
('gender-dysphoria', 14, 'Gender Dysphoria', 'A marked incongruence between one''s experienced/expressed gender and assigned gender, associated with clinically significant distress or impairment.', 'lavender'),
('impulse-control', 15, 'Disruptive, Impulse-Control & Conduct Disorders', 'Conditions involving problems in the self-control of emotions and behaviors that violate the rights of others or bring the individual into conflict with societal norms.', 'amber'),
('substance', 16, 'Substance-Related & Addictive Disorders', 'Disorders related to the taking of a drug of abuse, side effects of medication, and exposure to toxins. Includes substance use disorders and gambling disorder.', 'navy'),
('neurocognitive', 17, 'Neurocognitive Disorders', 'Disorders in which the primary clinical deficit is in cognitive function, and that are acquired rather than developmental. Includes delirium, major and mild NCD.', 'mist'),
('personality', 18, 'Personality Disorders', 'Enduring patterns of inner experience and behavior that deviate markedly from cultural expectations, are pervasive and inflexible, and lead to distress or impairment.', 'lavender'),
('paraphilic', 19, 'Paraphilic Disorders', 'Conditions involving atypical sexual interests that cause distress or impairment to the individual or whose satisfaction entails personal harm or risk of harm to others.', 'amber'),
('other', 20, 'Other Mental Disorders & Additional Conditions', 'Includes other specified and unspecified mental disorders, medication-induced movement disorders, and additional conditions that may be a focus of clinical attention.', 'sage');

-- Seed a sample of well-known disorders (paraphrased; full criteria for first batch)
WITH ch AS (SELECT id, slug FROM public.dsm_chapters)
INSERT INTO public.dsm_disorders (chapter_id, slug, name, icd10, icd11, overview, duration_requirement, functional_impairment, differential_diagnoses, comorbidities, risk_factors, developmental_considerations, cultural_considerations) VALUES
((SELECT id FROM ch WHERE slug='depressive'), 'major-depressive-disorder', 'Major Depressive Disorder', 'F32 / F33', '6A70', 'A mood disorder marked by persistent low mood and/or loss of interest, accompanied by cognitive, somatic, and behavioral changes that disrupt daily life.', 'Symptoms present nearly every day for at least 2 weeks.', 'Causes significant distress or impairment in social, occupational, or other areas of functioning.', ARRAY['Bipolar disorder','Persistent depressive disorder','Adjustment disorder','Bereavement','Substance-induced mood disorder'], ARRAY['Anxiety disorders','Substance use','Personality disorders'], ARRAY['Family history','Adverse childhood experiences','Chronic medical illness','Female sex (after puberty)'], 'Presentation in children may include irritable rather than sad mood. Older adults may emphasize somatic complaints.', 'Cultural idioms of distress vary; somatic presentations are common in some cultures.'),
((SELECT id FROM ch WHERE slug='anxiety'), 'generalized-anxiety-disorder', 'Generalized Anxiety Disorder', 'F41.1', '6B00', 'Excessive, difficult-to-control worry across multiple life domains, with physical tension symptoms.', 'More days than not for at least 6 months.', 'Causes significant distress or impairment in functioning.', ARRAY['Panic disorder','Social anxiety','OCD','PTSD','Medical condition (hyperthyroidism)','Substance-induced anxiety'], ARRAY['Major depression','Other anxiety disorders'], ARRAY['Temperamental inhibition','Female sex','Childhood adversity','Family history'], 'Children may worry about competence/quality of performance.', 'Cultural expectations shape acceptable expression of worry.'),
((SELECT id FROM ch WHERE slug='trauma'), 'ptsd', 'Posttraumatic Stress Disorder', 'F43.1', '6B40', 'Development of characteristic symptoms following exposure to actual or threatened death, serious injury, or sexual violence, including intrusion, avoidance, negative alterations in cognition/mood, and arousal changes.', 'Symptoms present for more than 1 month.', 'Causes significant distress or impairment in functioning.', ARRAY['Adjustment disorder','Acute stress disorder','Other trauma- and stressor-related','Anxiety disorders','OCD','TBI'], ARRAY['Major depression','Substance use','Other anxiety disorders'], ARRAY['Trauma severity','Lack of social support','Prior trauma','Female sex'], 'Children may show traumatic play and frightening dreams without recognizable content.', 'Cultural factors shape interpretation, expression, and help-seeking.'),
((SELECT id FROM ch WHERE slug='bipolar'), 'bipolar-i-disorder', 'Bipolar I Disorder', 'F31', '6A60', 'Defined by at least one manic episode, which may be preceded or followed by hypomanic or depressive episodes.', 'Manic episode lasting at least 1 week (or any duration if hospitalization required).', 'Mania causes marked impairment or psychotic features may be present.', ARRAY['Major depressive disorder','Bipolar II','Cyclothymic','Substance-induced','ADHD','Personality disorders'], ARRAY['Anxiety disorders','Substance use','ADHD'], ARRAY['Family history','High genetic loading','Sleep disruption'], 'Onset often late adolescence to early adulthood.', 'Cultural framing of elevated mood and irritability differs across communities.'),
((SELECT id FROM ch WHERE slug='neurodevelopmental'), 'adhd', 'Attention-Deficit/Hyperactivity Disorder', 'F90', '6A05', 'A persistent pattern of inattention and/or hyperactivity-impulsivity that interferes with functioning or development.', 'Symptoms present for at least 6 months and onset before age 12.', 'Symptoms are present in two or more settings and clearly interfere with functioning.', ARRAY['Oppositional defiant','Specific learning disorder','Anxiety','Mood disorders','Substance use','Autism spectrum'], ARRAY['Learning disorders','Anxiety','Mood disorders','Conduct disorder'], ARRAY['Genetic loading','Low birth weight','Prenatal exposures'], 'Hyperactivity may decrease with age while inattention persists.', 'Diagnostic thresholds may vary by cultural expectations of child behavior.'),
((SELECT id FROM ch WHERE slug='ocd'), 'ocd', 'Obsessive-Compulsive Disorder', 'F42', '6B20', 'Presence of obsessions, compulsions, or both that are time-consuming or cause significant distress or impairment.', 'Time-consuming (more than 1 hour per day) or distressing.', 'Causes significant distress or impairment in functioning.', ARRAY['Anxiety disorders','Major depression','Tourette''s','Body dysmorphic','Hoarding','Psychotic disorders'], ARRAY['Anxiety','Depression','Tic disorders'], ARRAY['Family history','Childhood trauma','Streptococcal infection (PANDAS in some children)'], 'Onset typically in late adolescence or early adulthood; earlier in males.', 'Cultural and religious context shapes content of obsessions.'),
((SELECT id FROM ch WHERE slug='schizophrenia-spectrum'), 'schizophrenia', 'Schizophrenia', 'F20', '6A20', 'A serious mental disorder involving distortions in thinking, perception, emotion, language, sense of self, and behavior.', 'Continuous signs persist for at least 6 months with at least 1 month of active-phase symptoms.', 'Marked impairment in major areas of functioning.', ARRAY['Schizoaffective','Brief psychotic disorder','Mood disorders with psychotic features','Substance-induced psychosis','Autism'], ARRAY['Substance use','Depression','Anxiety','Metabolic conditions'], ARRAY['Genetic loading','Obstetric complications','Cannabis use in vulnerable individuals','Urban upbringing'], 'Typical onset late teens to mid-30s; earlier in males.', 'Cultural context informs interpretation of unusual experiences and beliefs.'),
((SELECT id FROM ch WHERE slug='personality'), 'borderline-personality-disorder', 'Borderline Personality Disorder', 'F60.3', '6D11.5', 'A pervasive pattern of instability of interpersonal relationships, self-image, affect, and marked impulsivity.', 'Onset by early adulthood; pattern is enduring.', 'Causes significant distress or impairment.', ARRAY['Mood disorders','PTSD','Other personality disorders','Substance use'], ARRAY['Depression','Anxiety','Substance use','Eating disorders','PTSD'], ARRAY['Childhood adversity','Genetic loading','Family history of mood/personality disorders'], 'Diagnostic features may overlap with developmental upheaval in adolescence; caution warranted.', 'Cultural norms around emotional expression and relational style matter.'),
((SELECT id FROM ch WHERE slug='substance'), 'alcohol-use-disorder', 'Alcohol Use Disorder', 'F10', '6C40', 'A problematic pattern of alcohol use leading to clinically significant impairment or distress.', 'At least 2 criteria within a 12-month period.', 'Impairment in role obligations, social, or recreational activities.', ARRAY['Other substance use disorders','Mood/anxiety disorders','Conduct disorder'], ARRAY['Depression','Anxiety','PTSD','Sleep disorders'], ARRAY['Family history','Early initiation','Trauma','Co-occurring mental illness'], 'Adolescents may show rapid progression.', 'Religious and cultural norms strongly shape consumption patterns and recognition.'),
((SELECT id FROM ch WHERE slug='eating'), 'anorexia-nervosa', 'Anorexia Nervosa', 'F50.0', '6B80', 'Restriction of energy intake leading to significantly low body weight, intense fear of gaining weight, and disturbance in self-perceived weight or shape.', 'Persistent restriction with significantly low weight.', 'Causes significant medical and psychosocial impairment.', ARRAY['Bulimia','Avoidant/restrictive food intake','Medical conditions causing weight loss','Major depression','OCD'], ARRAY['Depression','Anxiety','OCD'], ARRAY['Genetic loading','Perfectionism','Sociocultural emphasis on thinness'], 'Typical onset in adolescence; medical complications can be severe.', 'Sociocultural standards of body shape strongly influence presentation.');

-- Insert sample criteria for MDD
WITH d AS (SELECT id FROM public.dsm_disorders WHERE slug='major-depressive-disorder')
INSERT INTO public.dsm_criteria (disorder_id, code, description, ordinal) VALUES
((SELECT id FROM d), 'A1', 'Depressed mood most of the day, nearly every day (self-report or observation).', 1),
((SELECT id FROM d), 'A2', 'Markedly diminished interest or pleasure in nearly all activities.', 2),
((SELECT id FROM d), 'A3', 'Significant weight change or appetite disturbance.', 3),
((SELECT id FROM d), 'A4', 'Insomnia or hypersomnia nearly every day.', 4),
((SELECT id FROM d), 'A5', 'Psychomotor agitation or retardation observable by others.', 5),
((SELECT id FROM d), 'A6', 'Fatigue or loss of energy nearly every day.', 6),
((SELECT id FROM d), 'A7', 'Feelings of worthlessness or excessive/inappropriate guilt.', 7),
((SELECT id FROM d), 'A8', 'Diminished ability to think or concentrate; indecisiveness.', 8),
((SELECT id FROM d), 'A9', 'Recurrent thoughts of death, suicidal ideation, plan, or attempt.', 9),
((SELECT id FROM d), 'B', 'Symptoms cause clinically significant distress or impairment.', 10),
((SELECT id FROM d), 'C', 'Episode is not attributable to substance use or another medical condition.', 11);

-- Sample criteria for GAD
WITH d AS (SELECT id FROM public.dsm_disorders WHERE slug='generalized-anxiety-disorder')
INSERT INTO public.dsm_criteria (disorder_id, code, description, ordinal) VALUES
((SELECT id FROM d), 'A', 'Excessive anxiety and worry occurring more days than not for at least 6 months, about a number of events or activities.', 1),
((SELECT id FROM d), 'B', 'The individual finds it difficult to control the worry.', 2),
((SELECT id FROM d), 'C1', 'Restlessness or feeling keyed up or on edge.', 3),
((SELECT id FROM d), 'C2', 'Being easily fatigued.', 4),
((SELECT id FROM d), 'C3', 'Difficulty concentrating or mind going blank.', 5),
((SELECT id FROM d), 'C4', 'Irritability.', 6),
((SELECT id FROM d), 'C5', 'Muscle tension.', 7),
((SELECT id FROM d), 'C6', 'Sleep disturbance.', 8);

-- Sample assessment tools
INSERT INTO public.dsm_assessment_tools (disorder_id, name, acronym, description) VALUES
((SELECT id FROM public.dsm_disorders WHERE slug='major-depressive-disorder'), 'Patient Health Questionnaire-9', 'PHQ-9', 'A 9-item self-report screening tool for depression severity.'),
((SELECT id FROM public.dsm_disorders WHERE slug='generalized-anxiety-disorder'), 'Generalized Anxiety Disorder 7-item', 'GAD-7', 'A 7-item self-report screening tool for anxiety severity.'),
((SELECT id FROM public.dsm_disorders WHERE slug='ptsd'), 'PTSD Checklist for DSM-5', 'PCL-5', 'A 20-item self-report measure that assesses PTSD symptoms.'),
((NULL), 'WHO Disability Assessment Schedule 2.0', 'WHODAS 2.0', 'A generic assessment instrument for health and disability across cultures.');
