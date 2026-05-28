
-- =====================================================================
-- QUIZ QUESTIONS TABLE
-- =====================================================================
CREATE TABLE public.dsm_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.dsm_chapters(id) ON DELETE CASCADE,
  disorder_id uuid REFERENCES public.dsm_disorders(id) ON DELETE SET NULL,
  question text NOT NULL,
  choices jsonb NOT NULL, -- [{"key":"A","text":"..."}, ...]
  correct_key text NOT NULL,
  explanation text,
  difficulty smallint NOT NULL DEFAULT 1, -- 1 easy, 2 medium, 3 hard
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dsm_quiz_questions TO anon, authenticated;
GRANT ALL ON public.dsm_quiz_questions TO service_role;
ALTER TABLE public.dsm_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dsm_quiz_public_read" ON public.dsm_quiz_questions FOR SELECT TO public USING (true);

CREATE INDEX idx_dsm_quiz_chapter ON public.dsm_quiz_questions(chapter_id);

-- =====================================================================
-- ADDITIONAL DISORDERS  (paraphrased, educational; no APA verbatim text)
-- =====================================================================
INSERT INTO public.dsm_disorders (chapter_id, slug, name, overview, icd10, icd11, duration_requirement, functional_impairment, differential_diagnoses, comorbidities, risk_factors)
SELECT c.id, v.slug, v.name, v.overview, v.icd10, v.icd11, v.duration, v.impair, v.diffs, v.comorb, v.risk
FROM (VALUES
  ('neurodevelopmental','autism-spectrum-disorder','Autism Spectrum Disorder',
   'Persistent differences in social communication and reciprocal interaction together with restricted, repetitive patterns of behavior, interests, or activities. Sensory atypicalities are common. Presentation varies by support needs (levels 1–3).',
   'F84.0','6A02','Onset in early developmental period; impact may emerge later when demands exceed capacity.',
   'Functional impact across home, school, or work; tailored supports markedly improve outcomes.',
   ARRAY['Social (Pragmatic) Communication Disorder','Intellectual Developmental Disorder','Selective Mutism','ADHD'],
   ARRAY['ADHD','Anxiety disorders','Epilepsy','Sleep disorders','Gastrointestinal issues'],
   ARRAY['Genetic factors','Advanced parental age','Prenatal complications']),
  ('neurodevelopmental','intellectual-developmental-disorder','Intellectual Developmental Disorder',
   'Deficits in intellectual functioning and in adaptive behavior across conceptual, social, and practical domains, with onset in the developmental period. Severity is specified by adaptive functioning.',
   'F70-F79','6A00','Onset during developmental period.',
   'Variable; community supports promote independence and quality of life.',
   ARRAY['Specific Learning Disorder','Communication Disorders','Major Neurocognitive Disorder'],
   ARRAY['Epilepsy','ADHD','Autism Spectrum Disorder'],
   ARRAY['Genetic syndromes','Perinatal injury','Toxic exposures']),

  ('schizophrenia-spectrum','brief-psychotic-disorder','Brief Psychotic Disorder',
   'Sudden onset of one or more positive psychotic symptoms (delusions, hallucinations, disorganized speech) lasting at least one day but less than one month, with eventual full return to premorbid level of functioning.',
   'F23','6A23','1 day to <1 month.',
   'Often triggered by acute stress; supportive care during the episode is central.',
   ARRAY['Schizophreniform Disorder','Substance/medication-induced psychosis','Mood disorder with psychotic features'],
   ARRAY['Mood disorders','Substance use'],
   ARRAY['Acute psychosocial stressors','Postpartum period']),
  ('schizophrenia-spectrum','schizoaffective-disorder','Schizoaffective Disorder',
   'An uninterrupted period of illness with a major mood episode concurrent with active-phase symptoms of schizophrenia, alongside ≥2 weeks of psychotic symptoms in the absence of a major mood episode during the lifetime illness.',
   'F25','6A21','Lifetime course pattern as specified.',
   'Functioning often impaired between episodes; coordinated care improves trajectory.',
   ARRAY['Schizophrenia','Bipolar I with psychotic features','MDD with psychotic features'],
   ARRAY['Substance use','Anxiety disorders','Suicidality'],
   ARRAY['Family history','Trauma','Substance use']),

  ('bipolar','bipolar-ii-disorder','Bipolar II Disorder',
   'At least one major depressive episode and at least one hypomanic episode; full manic episodes have never occurred. Hypomania is observable but does not cause marked impairment or psychosis.',
   'F31.81','6A61','Hypomania ≥4 consecutive days; depressive episode ≥2 weeks.',
   'Depressive phases drive most of the disability; misdiagnosis as unipolar depression is common.',
   ARRAY['Bipolar I','MDD','Cyclothymic Disorder','BPD'],
   ARRAY['Anxiety disorders','Substance use','ADHD'],
   ARRAY['Family history','Early-onset depression','Postpartum period']),
  ('bipolar','cyclothymic-disorder','Cyclothymic Disorder',
   'For ≥2 years (1 year in youth), numerous periods of hypomanic and depressive symptoms that do not meet thresholds for hypomanic or major depressive episodes, present at least half the time, with no symptom-free interval >2 months.',
   'F34.0','6A62','≥2 years (1 year in youth).',
   'Chronic mood instability with relationship and occupational consequences.',
   ARRAY['Bipolar I/II','BPD','Substance-induced mood disorder'],
   ARRAY['Substance use','Anxiety','Personality disorders'],
   ARRAY['Family history of bipolar disorder']),

  ('depressive','persistent-depressive-disorder','Persistent Depressive Disorder',
   'Depressed mood most of the day, more days than not, for ≥2 years (1 year in youth), with ≥2 additional symptoms (e.g., appetite, sleep, energy, self-esteem, concentration, hopelessness). Major depressive episodes may co-occur.',
   'F34.1','6A72','≥2 years (1 year in youth).',
   'Chronic functional erosion; often under-recognized.',
   ARRAY['MDD','Cyclothymic Disorder','Adjustment Disorder'],
   ARRAY['Anxiety disorders','Substance use','Personality disorders'],
   ARRAY['Early adversity','Family history','Chronic stress']),
  ('depressive','premenstrual-dysphoric-disorder','Premenstrual Dysphoric Disorder',
   'Marked affective and somatic symptoms in the final week before menses, improving within days of onset and minimal/absent in the week postmenses; must be confirmed prospectively over ≥2 cycles.',
   'N94.3','GA34.41','Cyclical, ≥2 prospective cycles.',
   'Cyclical impairment in work, relationships, and self-care.',
   ARRAY['Premenstrual syndrome','MDD','Bipolar disorders'],
   ARRAY['MDD','Anxiety disorders'],
   ARRAY['Stress','Trauma history','Family history']),

  ('anxiety','panic-disorder','Panic Disorder',
   'Recurrent unexpected panic attacks plus ≥1 month of worry about additional attacks or maladaptive behavioral change. Panic attacks are abrupt surges of intense fear peaking within minutes.',
   'F41.0','6B01','≥1 month of anticipatory concern after an attack.',
   'Avoidance behaviors can become extensive (often with agoraphobia).',
   ARRAY['Agoraphobia','Social Anxiety','Specific Phobia','Cardiac/medical causes'],
   ARRAY['Agoraphobia','MDD','Substance use'],
   ARRAY['Family history','Stress','Smoking','Childhood adversity']),
  ('anxiety','social-anxiety-disorder','Social Anxiety Disorder',
   'Marked fear or anxiety about social situations in which the person may be scrutinized, with avoidance or endurance with intense distress, lasting ≥6 months and out of proportion to actual threat.',
   'F40.10','6B04','≥6 months.',
   'Educational, occupational, and relational functioning is commonly constrained.',
   ARRAY['Panic Disorder','Specific Phobia','Avoidant PD','Autism Spectrum'],
   ARRAY['MDD','Substance use','Other anxiety disorders'],
   ARRAY['Behavioral inhibition','Childhood adversity','Family history']),
  ('anxiety','specific-phobia','Specific Phobia',
   'Marked fear or anxiety about a specific object or situation (e.g., flying, heights, animals, blood-injection-injury), with active avoidance and ≥6 months duration.',
   'F40.2','6B03','≥6 months.',
   'Impairment depends on how often the feared stimulus is encountered.',
   ARRAY['Panic Disorder','OCD','PTSD'],
   ARRAY['Other anxiety disorders','MDD'],
   ARRAY['Direct experience','Observational learning','Temperament']),

  ('ocd','body-dysmorphic-disorder','Body Dysmorphic Disorder',
   'Preoccupation with one or more perceived defects in physical appearance not observable or appearing slight to others, with repetitive behaviors or mental acts (mirror-checking, comparing) in response.',
   'F45.22','6B21','Time-consuming (≥1 hour/day) preoccupations.',
   'Significant distress; high rates of suicidality and avoidance.',
   ARRAY['OCD','Eating disorders','Social Anxiety','Delusional disorder, somatic type'],
   ARRAY['MDD','Social Anxiety','OCD','Substance use'],
   ARRAY['Childhood teasing/abuse','Perfectionism']),

  ('trauma','acute-stress-disorder','Acute Stress Disorder',
   'Development of characteristic symptoms (intrusion, negative mood, dissociation, avoidance, arousal) lasting 3 days to 1 month following exposure to actual or threatened death, serious injury, or sexual violence.',
   'F43.0','6B03','3 days to 1 month post-exposure.',
   'Early intervention can mitigate progression to PTSD.',
   ARRAY['PTSD','Adjustment Disorder','Brief Psychotic Disorder','TBI'],
   ARRAY['MDD','Substance use'],
   ARRAY['Prior trauma','Female sex','Peri-traumatic dissociation']),
  ('trauma','adjustment-disorder','Adjustment Disorder',
   'Emotional or behavioral symptoms in response to an identifiable stressor occurring within 3 months of onset, out of proportion to stressor severity, and resolving within 6 months of stressor cessation.',
   'F43.2','6B43','Within 3 months of stressor; ≤6 months after it ends.',
   'Impairment is functional but typically time-limited with support.',
   ARRAY['MDD','PTSD','Normative bereavement','Anxiety disorders'],
   ARRAY['Substance use','Anxiety disorders'],
   ARRAY['Recent life stressors','Limited social support']),

  ('dissociative','dissociative-identity-disorder','Dissociative Identity Disorder',
   'Disruption of identity characterized by ≥2 distinct personality states, with recurrent gaps in recall of everyday events, personal information, or traumatic events inconsistent with ordinary forgetting.',
   'F44.81','6B64','Chronic; onset typically in childhood after severe trauma.',
   'Severe; requires phase-oriented trauma-informed treatment.',
   ARRAY['PTSD','BPD','Psychotic disorders','Factitious disorder','Malingering'],
   ARRAY['PTSD','MDD','Substance use','Eating disorders'],
   ARRAY['Severe childhood trauma','Disorganized attachment']),

  ('eating','bulimia-nervosa','Bulimia Nervosa',
   'Recurrent binge eating coupled with compensatory behaviors (vomiting, laxatives, fasting, excessive exercise) at least once weekly for 3 months; self-evaluation unduly influenced by shape and weight.',
   'F50.2','6B81','≥1×/week for 3 months.',
   'Medical complications include electrolyte disturbance and dental erosion.',
   ARRAY['Anorexia Nervosa (binge-purge)','Binge-Eating Disorder','MDD'],
   ARRAY['MDD','Anxiety disorders','Substance use','BPD'],
   ARRAY['Dieting','Body dissatisfaction','Trauma history']),
  ('eating','binge-eating-disorder','Binge-Eating Disorder',
   'Recurrent episodes of binge eating without regular compensatory behaviors, with marked distress, ≥1×/week for 3 months, accompanied by features like eating rapidly or eating alone due to embarrassment.',
   'F50.81','6B82','≥1×/week for 3 months.',
   'Strongly associated with obesity and its medical sequelae.',
   ARRAY['Bulimia Nervosa','Obesity without binge eating','MDD'],
   ARRAY['MDD','Anxiety disorders','Obesity','Substance use'],
   ARRAY['Dieting','Trauma','Family history of obesity']),

  ('sleep-wake','insomnia-disorder','Insomnia Disorder',
   'Dissatisfaction with sleep quantity or quality with difficulty initiating, maintaining, or early-morning awakening, ≥3 nights/week for ≥3 months, despite adequate opportunity for sleep.',
   'F51.01','7A00','≥3 nights/week for ≥3 months.',
   'Daytime fatigue, mood, and cognitive impacts.',
   ARRAY['Other sleep disorders','MDD','Anxiety disorders','Substance use'],
   ARRAY['MDD','Anxiety disorders','Chronic pain'],
   ARRAY['Hyperarousal trait','Shift work','Stress']),

  ('impulse-control','conduct-disorder','Conduct Disorder',
   'A repetitive and persistent pattern of behavior in which the basic rights of others or major age-appropriate societal norms or rules are violated, with ≥3 criteria in the past 12 months.',
   'F91.x','6C91','12-month pattern; ≥1 criterion in past 6 months.',
   'Early intervention reduces progression to antisocial trajectories.',
   ARRAY['Oppositional Defiant Disorder','Antisocial PD (adults)','ADHD'],
   ARRAY['ADHD','Substance use','Learning disorders'],
   ARRAY['Harsh parenting','Peer rejection','Neighborhood adversity']),

  ('substance','opioid-use-disorder','Opioid Use Disorder',
   'A problematic pattern of opioid use leading to clinically significant impairment or distress, manifested by ≥2 of 11 criteria within a 12-month period (e.g., tolerance, withdrawal, craving, use despite consequences).',
   'F11.20','6C43.2','12-month pattern.',
   'High overdose risk; medications (buprenorphine, methadone) markedly reduce mortality.',
   ARRAY['Other substance use disorders','Pain disorders'],
   ARRAY['Other SUDs','MDD','PTSD','Infectious disease'],
   ARRAY['Family history','Trauma','Chronic pain','Early initiation']),

  ('neurocognitive','major-ncd-alzheimers','Major Neurocognitive Disorder due to Alzheimer''s Disease',
   'Evidence of significant cognitive decline in ≥1 cognitive domain that interferes with independence, with insidious onset and gradual progression, and a probable or possible Alzheimer''s etiology.',
   'G30.x / F02.8x','6D80','Gradual, progressive course.',
   'Loss of independence in IADLs and later ADLs.',
   ARRAY['Vascular NCD','Lewy body NCD','Frontotemporal NCD','Major Depressive Disorder'],
   ARRAY['Depression','Anxiety','Behavioral disturbance'],
   ARRAY['Age','APOE-ε4','Cardiovascular risk factors','Low education']),

  ('personality','antisocial-personality-disorder','Antisocial Personality Disorder',
   'A pervasive pattern of disregard for and violation of the rights of others since age 15, with ≥3 criteria (e.g., deceitfulness, impulsivity, aggressiveness); individual is ≥18 with evidence of conduct disorder before age 15.',
   'F60.2','6D11.2','Pervasive from age 15; diagnosed ≥18.',
   'High medico-legal and interpersonal burden; structured treatments have modest benefit.',
   ARRAY['Conduct Disorder','Narcissistic PD','Substance-induced behavior'],
   ARRAY['Substance use','Other PDs','ADHD'],
   ARRAY['Conduct disorder','Childhood maltreatment','Family history']),
  ('personality','narcissistic-personality-disorder','Narcissistic Personality Disorder',
   'A pervasive pattern of grandiosity, need for admiration, and lack of empathy, beginning by early adulthood with ≥5 criteria including entitlement, exploitativeness, and arrogance.',
   'F60.81','6D11.5','Pervasive across contexts.',
   'Interpersonal and occupational frictions; vulnerability to depressive episodes after blows to self-esteem.',
   ARRAY['Antisocial PD','Histrionic PD','Borderline PD','Bipolar (manic states)'],
   ARRAY['MDD','Substance use','Other PDs'],
   ARRAY['Excessive admiration in childhood','Trauma to self-esteem'])
) AS v(chapter_slug, slug, name, overview, icd10, icd11, duration, impair, diffs, comorb, risk)
JOIN public.dsm_chapters c ON c.slug = v.chapter_slug
ON CONFLICT DO NOTHING;

-- =====================================================================
-- QUIZ QUESTIONS (≥3 per chapter; ~60 total)
-- =====================================================================
INSERT INTO public.dsm_quiz_questions (chapter_id, question, choices, correct_key, explanation, difficulty)
SELECT c.id, v.q,
       v.choices::jsonb,
       v.correct, v.explanation, v.diff
FROM (VALUES
  -- Neurodevelopmental
  ('neurodevelopmental','By what age must ADHD symptoms be present (per DSM-5-TR)?',
   '[{"key":"A","text":"Before age 7"},{"key":"B","text":"Before age 12"},{"key":"C","text":"Before age 18"},{"key":"D","text":"Any age"}]','B',
   'DSM-5-TR requires several inattentive or hyperactive-impulsive symptoms present prior to age 12.',1),
  ('neurodevelopmental','Which is a core feature of Autism Spectrum Disorder?',
   '[{"key":"A","text":"Hallucinations"},{"key":"B","text":"Restricted, repetitive patterns of behavior"},{"key":"C","text":"Manic episodes"},{"key":"D","text":"Compensatory purging"}]','B',
   'ASD requires persistent deficits in social communication plus restricted/repetitive behaviors.',1),
  ('neurodevelopmental','Intellectual Developmental Disorder severity is determined primarily by:',
   '[{"key":"A","text":"IQ score alone"},{"key":"B","text":"Adaptive functioning"},{"key":"C","text":"Head circumference"},{"key":"D","text":"School grades"}]','B',
   'Severity is specified based on adaptive functioning across conceptual, social, and practical domains.',2),

  -- Schizophrenia
  ('schizophrenia-spectrum','Minimum total duration of disturbance for Schizophrenia?',
   '[{"key":"A","text":"1 week"},{"key":"B","text":"1 month"},{"key":"C","text":"6 months"},{"key":"D","text":"2 years"}]','C',
   'Continuous signs persist for at least 6 months, including ≥1 month of active-phase symptoms.',1),
  ('schizophrenia-spectrum','Brief Psychotic Disorder lasts at most:',
   '[{"key":"A","text":"24 hours"},{"key":"B","text":"1 month"},{"key":"C","text":"6 months"},{"key":"D","text":"1 year"}]','B',
   'BPD: ≥1 day, <1 month, with full return to premorbid function.',2),
  ('schizophrenia-spectrum','Schizoaffective Disorder requires psychotic symptoms in the absence of a mood episode for at least:',
   '[{"key":"A","text":"24 hours"},{"key":"B","text":"2 weeks"},{"key":"C","text":"2 months"},{"key":"D","text":"6 months"}]','B',
   '≥2 weeks of psychotic symptoms without a major mood episode during the lifetime illness distinguishes it from mood disorder with psychotic features.',3),

  -- Bipolar
  ('bipolar','Minimum duration of a manic episode (without hospitalization)?',
   '[{"key":"A","text":"4 days"},{"key":"B","text":"7 days"},{"key":"C","text":"2 weeks"},{"key":"D","text":"1 month"}]','B',
   'Mania: ≥7 days (or any duration if hospitalization is necessary). Hypomania: ≥4 days.',1),
  ('bipolar','Bipolar II requires at least one episode of:',
   '[{"key":"A","text":"Mania"},{"key":"B","text":"Hypomania + a major depressive episode"},{"key":"C","text":"Mixed features only"},{"key":"D","text":"Cyclothymia"}]','B',
   'A full manic episode rules out Bipolar II.',2),
  ('bipolar','Cyclothymic Disorder requires symptom presence for at least:',
   '[{"key":"A","text":"6 months"},{"key":"B","text":"1 year"},{"key":"C","text":"2 years (1 year in youth)"},{"key":"D","text":"5 years"}]','C',
   'Chronic instability over ≥2 years (1 year in children/adolescents) without meeting full episode thresholds.',2),

  -- Depressive
  ('depressive','How many of 9 symptoms are required for a Major Depressive Episode?',
   '[{"key":"A","text":"3"},{"key":"B","text":"4"},{"key":"C","text":"5"},{"key":"D","text":"7"}]','C',
   '≥5 symptoms during the same 2-week period, including either depressed mood or anhedonia.',1),
  ('depressive','Persistent Depressive Disorder minimum duration (adults)?',
   '[{"key":"A","text":"6 months"},{"key":"B","text":"1 year"},{"key":"C","text":"2 years"},{"key":"D","text":"5 years"}]','C',
   'Depressed mood most of the day, more days than not, for ≥2 years in adults.',1),
  ('depressive','PMDD diagnosis requires:',
   '[{"key":"A","text":"Retrospective recall"},{"key":"B","text":"Prospective ratings over ≥2 cycles"},{"key":"C","text":"Hormonal blood test"},{"key":"D","text":"Family history"}]','B',
   'Confirmation via prospective daily ratings over at least two symptomatic cycles is required.',3),

  -- Anxiety
  ('anxiety','Generalized Anxiety Disorder duration requirement?',
   '[{"key":"A","text":"1 month"},{"key":"B","text":"3 months"},{"key":"C","text":"6 months"},{"key":"D","text":"1 year"}]','C',
   'Excessive worry more days than not for ≥6 months.',1),
  ('anxiety','A panic attack peaks within:',
   '[{"key":"A","text":"Minutes"},{"key":"B","text":"1 hour"},{"key":"C","text":"Several hours"},{"key":"D","text":"A day"}]','A',
   'Abrupt surge of intense fear/discomfort reaching peak within minutes.',1),
  ('anxiety','Social Anxiety Disorder duration?',
   '[{"key":"A","text":"1 month"},{"key":"B","text":"3 months"},{"key":"C","text":"6 months"},{"key":"D","text":"1 year"}]','C',
   '≥6 months of fear/avoidance of social-evaluative situations.',1),

  -- OCD
  ('ocd','OCD is defined by:',
   '[{"key":"A","text":"Obsessions and/or compulsions that are time-consuming"},{"key":"B","text":"Delusions of contamination only"},{"key":"C","text":"Mood episodes with compulsions"},{"key":"D","text":"Tics only"}]','A',
   'Time-consuming (>1 hour/day) or causing marked distress/impairment.',1),
  ('ocd','Body Dysmorphic Disorder centers on:',
   '[{"key":"A","text":"Generalized appearance concerns"},{"key":"B","text":"Perceived defects in appearance not observable to others"},{"key":"C","text":"Weight only"},{"key":"D","text":"Cultural beauty standards"}]','B',
   'Preoccupation with perceived flaws not observable or appearing slight to others; repetitive behaviors are required.',2),
  ('ocd','OCD insight is specified as good/fair, poor, or:',
   '[{"key":"A","text":"Anosognosic"},{"key":"B","text":"Absent insight/delusional"},{"key":"C","text":"Confabulatory"},{"key":"D","text":"Reactive"}]','B',
   'DSM-5-TR includes an "absent insight / delusional beliefs" specifier for OCD.',2),

  -- Trauma
  ('trauma','PTSD diagnostic threshold of symptom duration?',
   '[{"key":"A","text":"3 days"},{"key":"B","text":"2 weeks"},{"key":"C","text":"1 month"},{"key":"D","text":"6 months"}]','C',
   'Disturbance must persist >1 month; <1 month with similar features → Acute Stress Disorder.',1),
  ('trauma','Acute Stress Disorder timeframe is:',
   '[{"key":"A","text":"<3 days"},{"key":"B","text":"3 days to 1 month"},{"key":"C","text":"1 to 6 months"},{"key":"D","text":">6 months"}]','B',
   'ASD: 3 days to 1 month after exposure.',1),
  ('trauma','Adjustment Disorder must begin within how long of the stressor?',
   '[{"key":"A","text":"24 hours"},{"key":"B","text":"3 months"},{"key":"C","text":"6 months"},{"key":"D","text":"1 year"}]','B',
   'Onset within 3 months of the stressor; resolution within 6 months of its cessation.',2),

  -- Dissociative
  ('dissociative','DID identity disruption involves:',
   '[{"key":"A","text":"One stable personality"},{"key":"B","text":"≥2 distinct personality states"},{"key":"C","text":"Hallucinations only"},{"key":"D","text":"Sleep paralysis"}]','B',
   'Two or more distinct personality states with recurrent gaps in recall.',1),
  ('dissociative','Dissociative Amnesia primarily involves:',
   '[{"key":"A","text":"Inability to recall important autobiographical info"},{"key":"B","text":"Hallucinations"},{"key":"C","text":"Mood instability"},{"key":"D","text":"Compulsions"}]','A',
   'Inability to recall important autobiographical information, usually of a traumatic/stressful nature.',2),
  ('dissociative','Depersonalization/Derealization Disorder reality testing is:',
   '[{"key":"A","text":"Impaired"},{"key":"B","text":"Intact"},{"key":"C","text":"Fluctuating"},{"key":"D","text":"Absent"}]','B',
   'Reality testing remains intact during depersonalization/derealization episodes.',2),

  -- Somatic
  ('somatic','Somatic Symptom Disorder centers on:',
   '[{"key":"A","text":"Disproportionate thoughts/feelings/behaviors about somatic symptoms"},{"key":"B","text":"Medically unexplained symptoms only"},{"key":"C","text":"Factitious behavior"},{"key":"D","text":"Conversion symptoms only"}]','A',
   'DSM-5-TR shifted focus to the psychological response to symptoms rather than their medical explanation.',2),
  ('somatic','Illness Anxiety Disorder requires:',
   '[{"key":"A","text":"Multiple unexplained symptoms"},{"key":"B","text":"Preoccupation with having/acquiring serious illness with minimal somatic symptoms"},{"key":"C","text":"Conversion features"},{"key":"D","text":"Active malingering"}]','B',
   'Preoccupation with illness despite absent or mild somatic symptoms.',2),
  ('somatic','Conversion Disorder involves:',
   '[{"key":"A","text":"Volitional symptom production"},{"key":"B","text":"Altered voluntary motor/sensory function incompatible with recognized conditions"},{"key":"C","text":"Pain disorder"},{"key":"D","text":"Hallucinations"}]','B',
   'Functional neurological symptoms with clinical findings showing incompatibility with neurological/medical conditions.',3),

  -- Eating
  ('eating','Anorexia Nervosa is characterized by:',
   '[{"key":"A","text":"Restriction leading to significantly low body weight"},{"key":"B","text":"Binges followed by purging only"},{"key":"C","text":"Binges without compensation"},{"key":"D","text":"Pica"}]','A',
   'Restriction relative to requirements with significantly low weight, intense fear of weight gain, body image disturbance.',1),
  ('eating','Bulimia Nervosa minimum frequency/duration?',
   '[{"key":"A","text":"Daily for 1 month"},{"key":"B","text":"≥1×/week for 3 months"},{"key":"C","text":"≥1×/month for 1 year"},{"key":"D","text":"≥3×/week for 6 months"}]','B',
   'Binges and compensatory behaviors ≥1×/week for 3 months.',2),
  ('eating','Binge-Eating Disorder differs from Bulimia by:',
   '[{"key":"A","text":"Absence of regular compensatory behaviors"},{"key":"B","text":"Lower weight"},{"key":"C","text":"Required purging"},{"key":"D","text":"Required restriction"}]','A',
   'BED lacks the recurrent inappropriate compensatory behaviors seen in bulimia.',1),

  -- Elimination
  ('elimination','Enuresis age criterion:',
   '[{"key":"A","text":"≥3"},{"key":"B","text":"≥5"},{"key":"C","text":"≥7"},{"key":"D","text":"≥10"}]','B',
   'Chronological age of at least 5 years (or equivalent developmental level).',1),
  ('elimination','Encopresis frequency criterion:',
   '[{"key":"A","text":"Once"},{"key":"B","text":"≥1×/month for 3 months"},{"key":"C","text":"Weekly for 6 months"},{"key":"D","text":"Daily"}]','B',
   'At least one event per month for at least 3 months.',2),
  ('elimination','Encopresis minimum chronological age:',
   '[{"key":"A","text":"3"},{"key":"B","text":"4"},{"key":"C","text":"5"},{"key":"D","text":"6"}]','B',
   'Chronological age of at least 4 years (or equivalent developmental level).',2),

  -- Sleep
  ('sleep-wake','Insomnia Disorder duration criterion:',
   '[{"key":"A","text":"≥2 weeks"},{"key":"B","text":"≥1 month"},{"key":"C","text":"≥3 months"},{"key":"D","text":"≥6 months"}]','C',
   '≥3 nights/week for ≥3 months.',1),
  ('sleep-wake','Narcolepsy core feature includes:',
   '[{"key":"A","text":"Cataplexy or hypocretin deficiency or REM sleep abnormalities"},{"key":"B","text":"Sleep paralysis only"},{"key":"C","text":"Loud snoring"},{"key":"D","text":"Restless legs"}]','A',
   'Recurrent irrepressible need to sleep with one of: cataplexy, hypocretin deficiency, or characteristic polysomnographic findings.',3),
  ('sleep-wake','Obstructive Sleep Apnea Hypopnea is typically confirmed by:',
   '[{"key":"A","text":"Self-report alone"},{"key":"B","text":"Polysomnography showing apnea/hypopnea events"},{"key":"C","text":"Blood test"},{"key":"D","text":"MRI"}]','B',
   'Polysomnographic evidence of ≥5 obstructive events/hour with symptoms, or ≥15 regardless of symptoms.',2),

  -- Sexual
  ('sexual','Sexual dysfunctions in DSM-5-TR generally require duration of:',
   '[{"key":"A","text":"1 week"},{"key":"B","text":"1 month"},{"key":"C","text":"6 months"},{"key":"D","text":"1 year"}]','C',
   'Most sexual dysfunctions require symptoms for approximately 6 months.',2),
  ('sexual','Female Sexual Interest/Arousal Disorder requires reduction in:',
   '[{"key":"A","text":"Three of six indicators"},{"key":"B","text":"Any one indicator"},{"key":"C","text":"All indicators"},{"key":"D","text":"Two of four"}]','A',
   '≥3 of six indicators of sexual interest/arousal must be reduced or absent.',3),
  ('sexual','Premature (Early) Ejaculation typically defined by latency of:',
   '[{"key":"A","text":"<1 minute"},{"key":"B","text":"<5 minutes"},{"key":"C","text":"<10 minutes"},{"key":"D","text":"Variable"}]','A',
   'Persistent pattern of ejaculation within ~1 minute of vaginal penetration and before the person wishes.',2),

  -- Gender Dysphoria
  ('gender-dysphoria','Gender Dysphoria duration criterion:',
   '[{"key":"A","text":"≥1 month"},{"key":"B","text":"≥3 months"},{"key":"C","text":"≥6 months"},{"key":"D","text":"≥1 year"}]','C',
   'Marked incongruence between experienced and assigned gender for ≥6 months with clinically significant distress.',2),
  ('gender-dysphoria','Gender Dysphoria diagnosis requires:',
   '[{"key":"A","text":"Cross-gender identification alone"},{"key":"B","text":"Distress or impairment associated with incongruence"},{"key":"C","text":"Hormonal treatment"},{"key":"D","text":"Surgical history"}]','B',
   'The diagnosis hinges on associated distress/impairment, not identity per se.',2),
  ('gender-dysphoria','In children, ≥6 of 8 indicators are required including:',
   '[{"key":"A","text":"A strong desire to be the other gender or insistence one is"},{"key":"B","text":"Hormonal change"},{"key":"C","text":"Family history"},{"key":"D","text":"Gender-affirming surgery"}]','A',
   'The first indicator (strong desire to be / insistence one is the other gender) is required among the six.',3),

  -- Impulse-control
  ('impulse-control','Conduct Disorder requires:',
   '[{"key":"A","text":"≥3 criteria in past 12 months, ≥1 in past 6"},{"key":"B","text":"Any 1 criterion"},{"key":"C","text":"≥5 criteria in past month"},{"key":"D","text":"Hospitalization"}]','A',
   '≥3 of 15 criteria in the past 12 months, with at least one in the past 6 months.',2),
  ('impulse-control','Oppositional Defiant Disorder duration:',
   '[{"key":"A","text":"≥1 month"},{"key":"B","text":"≥3 months"},{"key":"C","text":"≥6 months"},{"key":"D","text":"≥1 year"}]','C',
   '≥6 months of angry/irritable mood, argumentative behavior, or vindictiveness.',1),
  ('impulse-control','Intermittent Explosive Disorder minimum age:',
   '[{"key":"A","text":"5"},{"key":"B","text":"6"},{"key":"C","text":"12"},{"key":"D","text":"18"}]','B',
   'Diagnosis requires chronological age of at least 6 years (or equivalent developmental level).',3),

  -- Substance
  ('substance','SUD severity is rated by number of criteria met:',
   '[{"key":"A","text":"2–3 mild, 4–5 moderate, ≥6 severe"},{"key":"B","text":"1 mild, 2 moderate, 3 severe"},{"key":"C","text":"Any → severe"},{"key":"D","text":"Based on dose"}]','A',
   'Severity specifier uses count of the 11 criteria.',1),
  ('substance','Alcohol Use Disorder criteria are assessed within:',
   '[{"key":"A","text":"1 month"},{"key":"B","text":"3 months"},{"key":"C","text":"12 months"},{"key":"D","text":"Lifetime"}]','C',
   'Within a 12-month period.',1),
  ('substance','Opioid Use Disorder evidence-based pharmacotherapies include:',
   '[{"key":"A","text":"Buprenorphine or methadone"},{"key":"B","text":"Benzodiazepines"},{"key":"C","text":"Antipsychotics"},{"key":"D","text":"SSRIs only"}]','A',
   'Medications for OUD (MOUD) substantially reduce overdose mortality.',2),

  -- Neurocognitive
  ('neurocognitive','Major vs Mild NCD difference centers on:',
   '[{"key":"A","text":"Whether decline interferes with independence in everyday activities"},{"key":"B","text":"Patient age"},{"key":"C","text":"Family history"},{"key":"D","text":"Imaging only"}]','A',
   'Major NCD: independence is compromised; Mild NCD: preserved with greater effort.',2),
  ('neurocognitive','Lewy body NCD core features include:',
   '[{"key":"A","text":"Fluctuating cognition, visual hallucinations, parkinsonism, REM sleep behavior disorder"},{"key":"B","text":"Stepwise decline"},{"key":"C","text":"Personality change first"},{"key":"D","text":"Language-first decline"}]','A',
   'Core/suggestive features differentiate it from Alzheimer''s and vascular NCD.',3),
  ('neurocognitive','Alzheimer''s-related Major NCD typically shows:',
   '[{"key":"A","text":"Stepwise decline"},{"key":"B","text":"Insidious onset with gradual progression"},{"key":"C","text":"Acute fluctuations"},{"key":"D","text":"Reversibility"}]','B',
   'Insidious onset and gradual progression are characteristic.',1),

  -- Personality
  ('personality','BPD core features include:',
   '[{"key":"A","text":"Instability of affect, relationships, identity, and impulsivity"},{"key":"B","text":"Sustained euthymia"},{"key":"C","text":"Lack of empathy primarily"},{"key":"D","text":"Restricted affect"}]','A',
   'A pervasive pattern of instability across multiple domains.',1),
  ('personality','Antisocial PD requires evidence of conduct disorder before age:',
   '[{"key":"A","text":"10"},{"key":"B","text":"15"},{"key":"C","text":"18"},{"key":"D","text":"21"}]','B',
   'Evidence of conduct disorder with onset before age 15 is required, with diagnosis at ≥18.',2),
  ('personality','Narcissistic PD requires at least:',
   '[{"key":"A","text":"3 of 9 criteria"},{"key":"B","text":"5 of 9 criteria"},{"key":"C","text":"7 of 9 criteria"},{"key":"D","text":"All 9 criteria"}]','B',
   '≥5 of 9 criteria including grandiosity, need for admiration, and lack of empathy.',2),

  -- Paraphilic
  ('paraphilic','A paraphilia becomes a paraphilic DISORDER when:',
   '[{"key":"A","text":"It causes distress/impairment or harm to others"},{"key":"B","text":"It is unusual"},{"key":"C","text":"It involves fantasy only"},{"key":"D","text":"It is sustained over time"}]','A',
   'The disorder threshold requires associated distress/impairment or non-consensual harm, not the paraphilia itself.',1),
  ('paraphilic','Most paraphilic disorders require duration of:',
   '[{"key":"A","text":"1 month"},{"key":"B","text":"3 months"},{"key":"C","text":"6 months"},{"key":"D","text":"1 year"}]','C',
   'Approximately 6 months of recurrent, intense sexually arousing fantasies/urges/behaviors.',2),
  ('paraphilic','Pedophilic Disorder requires the individual is at least:',
   '[{"key":"A","text":"14"},{"key":"B","text":"16"},{"key":"C","text":"18"},{"key":"D","text":"21"}]','B',
   'Individual is at least age 16 and at least 5 years older than the prepubescent child(ren).',3),

  -- Other
  ('other','"Other Specified" vs "Unspecified" differs by:',
   '[{"key":"A","text":"Severity"},{"key":"B","text":"Whether clinician communicates the specific reason criteria are not met"},{"key":"C","text":"Patient age"},{"key":"D","text":"Provider type"}]','B',
   'Other Specified: clinician records the specific reason. Unspecified: reason not recorded (e.g., insufficient info).',2),
  ('other','Conditions for Further Study (e.g., Internet Gaming Disorder) appear in:',
   '[{"key":"A","text":"Section I"},{"key":"B","text":"Section II"},{"key":"C","text":"Section III"},{"key":"D","text":"Appendix B"}]','C',
   'Section III houses conditions requiring further research before formal inclusion.',3),
  ('other','"V" and "Z" codes are used to indicate:',
   '[{"key":"A","text":"Mental disorders"},{"key":"B","text":"Other conditions that may be a focus of clinical attention"},{"key":"C","text":"Substances only"},{"key":"D","text":"Lab values"}]','B',
   'They capture psychosocial/contextual factors that affect care without being mental disorders themselves.',2)
) AS v(chapter_slug, q, choices, correct, explanation, diff)
JOIN public.dsm_chapters c ON c.slug = v.chapter_slug;
