// Standardized validated screening instruments (paraphrased item stems where required).
// Scoring per published guidance (Kroenke et al; Spitzer et al; Weathers et al for PCL-5).

export type Choice = { label: string; value: number };
export type Item = { id: string; prompt: string; choices: Choice[] };
export type Instrument = {
  key: "PHQ-9" | "GAD-7" | "PCL-5";
  name: string;
  description: string;
  items: Item[];
  severity: (score: number) => string;
  maxScore: number;
};

const FREQ_4: Choice[] = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

const PCL_CHOICES: Choice[] = [
  { label: "Not at all", value: 0 },
  { label: "A little bit", value: 1 },
  { label: "Moderately", value: 2 },
  { label: "Quite a bit", value: 3 },
  { label: "Extremely", value: 4 },
];

const PHQ9_PROMPTS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking so slowly that others noticed — or being fidgety/restless",
  "Thoughts that you would be better off dead, or of hurting yourself",
];

const GAD7_PROMPTS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const PCL5_PROMPTS = [
  "Repeated, disturbing memories of the stressful experience",
  "Repeated, disturbing dreams of the stressful experience",
  "Suddenly feeling or acting as if the experience were happening again",
  "Feeling very upset when reminded of the experience",
  "Strong physical reactions when reminded of the experience",
  "Avoiding memories, thoughts, or feelings related to the experience",
  "Avoiding external reminders of the experience",
  "Trouble remembering important parts of the experience",
  "Strong negative beliefs about yourself, others, or the world",
  "Blaming yourself or others for the experience or what happened after",
  "Strong negative feelings such as fear, horror, anger, guilt, or shame",
  "Loss of interest in activities you used to enjoy",
  "Feeling distant or cut off from other people",
  "Trouble experiencing positive feelings",
  "Irritable behavior, angry outbursts, or acting aggressively",
  "Taking too many risks or doing things that could cause you harm",
  "Being 'super-alert' or watchful, or on guard",
  "Feeling jumpy or easily startled",
  "Having difficulty concentrating",
  "Trouble falling or staying asleep",
];

function build(key: Instrument["key"], prompts: string[], choices: Choice[]): Item[] {
  return prompts.map((p, i) => ({ id: `${key}-${i + 1}`, prompt: p, choices }));
}

export const INSTRUMENTS: Record<Instrument["key"], Instrument> = {
  "PHQ-9": {
    key: "PHQ-9",
    name: "PHQ-9 — Depression",
    description: "9-item depression screener. Over the last 2 weeks, how often have you been bothered by…",
    items: build("PHQ-9", PHQ9_PROMPTS, FREQ_4),
    maxScore: 27,
    severity: (s) =>
      s <= 4 ? "Minimal" : s <= 9 ? "Mild" : s <= 14 ? "Moderate" : s <= 19 ? "Moderately severe" : "Severe",
  },
  "GAD-7": {
    key: "GAD-7",
    name: "GAD-7 — Anxiety",
    description: "7-item generalized anxiety screener. Over the last 2 weeks, how often have you been bothered by…",
    items: build("GAD-7", GAD7_PROMPTS, FREQ_4),
    maxScore: 21,
    severity: (s) => (s <= 4 ? "Minimal" : s <= 9 ? "Mild" : s <= 14 ? "Moderate" : "Severe"),
  },
  "PCL-5": {
    key: "PCL-5",
    name: "PCL-5 — PTSD",
    description: "20-item PTSD checklist (DSM-5). In the past month, how much have you been bothered by…",
    items: build("PCL-5", PCL5_PROMPTS, PCL_CHOICES),
    maxScore: 80,
    severity: (s) => (s < 31 ? "Below provisional cutoff" : s < 45 ? "Probable PTSD (moderate)" : "Probable PTSD (severe)"),
  },
};

export function scoreInstrument(key: Instrument["key"], answers: Record<string, number>) {
  const inst = INSTRUMENTS[key];
  const total = inst.items.reduce((acc, it) => acc + (answers[it.id] ?? 0), 0);
  return { total, severity: inst.severity(total), maxScore: inst.maxScore };
}
