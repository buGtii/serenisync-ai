# Mindscape Companion

AI-assisted mental wellness, psychology learning (DSM-5-TR), and clinical support platform.

## What's shipped in v1

- **Backend foundation** — 7-role RBAC, profiles, consents, audit logs, crisis events, RLS on every table
- **Auth** — email/password + Google sign-in via Lovable Cloud
- **Landing page** — premium calm-clinical design (sage / navy / lavender, Instrument Serif + Inter)
- **DSM-5-TR Learning Engine** — all 20 chapters seeded with paraphrased summaries; 10 high-impact disorders seeded with criteria, differentials, comorbidities, risk factors, ICD codes, assessment tools
- **Wellness toolkit** — mood/energy/anxiety check-ins + private journal
- **AI Companion** — streaming chat via Lovable AI Gateway, server-side crisis screening (suicide, self-harm, psychosis, violence, withdrawal) with hotline routing, guarded system prompt (never diagnoses)
- **Crisis resources page** — international hotlines (IASP, 988, Samaritans, Umang, iCall, Lifeline, Talk Suicide Canada)
- **Capacitor Android config** ready to build (`bunx cap add android && bunx cap sync && bunx cap open android`)
- **SEO** — sitemap-friendly llms.txt, robots.txt, semantic head metadata per route

## What's NOT in v1 (planned next)

These were in the original brief but are intentionally deferred for a focused, fully-functional v1:

- Stripe checkout & subscriptions (Capacitor is in; Stripe enable flow requires a user-side form)
- Therapist marketplace (profiles, search, booking calendar)
- Clinician toolkit (verification flow, SOAP notes, assessment batteries)
- Researcher analytics (anonymized cohort queries, exports)
- Admin panel (approvals, moderation, audit viewer)
- Full DSM disorder detail for every category (structurally seeded; criteria added per disorder)
- Quiz/flashcard student modes (tables exist, UI to come)
- i18n / Urdu RTL
- 2FA / HIBP password check (one switch in Cloud Auth settings)

## Build for Android

```bash
bun run build
bunx cap add android
bunx cap sync android
bunx cap open android
```

## Disclaimers

Not a substitute for diagnosis or treatment by a licensed mental health professional. Clinical framework inspired by DSM-5-TR (APA, 2022); verbatim copyrighted text is never stored.
