export type Tone = 'verified' | 'caution' | 'flagged';

/** Which verdict colour a 0-1 measurement earns. Every meter in the report uses this one ramp. */
export const scoreTone = (score: number): Tone =>
  score >= 0.65 ? 'flagged' : score >= 0.35 ? 'caution' : 'verified';

/** Same ramp, read backwards — for a number where high is good. */
export const trustTone = (score: number): Tone =>
  score >= 0.65 ? 'verified' : score >= 0.35 ? 'caution' : 'flagged';

export const VERDICT_TONE: Record<string, Tone> = {
  AI_GENERATED: 'flagged',
  LIKELY_AI: 'caution',
  UNCERTAIN: 'caution',
  LIKELY_REAL: 'verified',
  REAL: 'verified',
};

export const SEVERITY_TONE: Record<string, Tone> = {
  high: 'flagged',
  medium: 'caution',
  low: 'verified',
};

/** snake_case field values are what the detectors emit; the report prints words. */
export function readable(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const pct = (value: number, digits = 0): string => `${(value * 100).toFixed(digits)}%`;

/** How far apart the three reads were, and what that means for the verdict. */
export const DISAGREEMENT: Record<string, { label: string; tone: Tone }> = {
  agreement: { label: 'the reads line up', tone: 'verified' },
  mild: { label: 'minor variation', tone: 'verified' },
  moderate: { label: 'moderate disagreement', tone: 'caution' },
  severe: { label: 'significant disagreement', tone: 'flagged' },
  conflict: { label: 'the reads contradict each other', tone: 'flagged' },
};

/** What the calibration step concluded about using this verdict. */
export const RECOMMENDATION: Record<string, { label: string; tone: Tone }> = {
  high_confidence: { label: 'safe to report as it stands', tone: 'verified' },
  moderate_confidence: { label: 'report it, with the spread shown', tone: 'caution' },
  low_confidence: { label: 'read it as a hint, not a finding', tone: 'flagged' },
  human_review_recommended: { label: 'a person should look at this one', tone: 'flagged' },
};
