import { pct, scoreTone, type Tone } from '@/lib/report';

interface MeasureRowProps {
    name: string;
    /** 0–1. Draws the meter. */
    value: number;
    /** Defaults to the verdict ramp; pass 'neutral' for a measurement that isn't a call. */
    tone?: 'neutral' | Tone;
    /** Defaults to a percentage. */
    label?: string;
    lead?: boolean;
}

export default function MeasureRow({ name, value, tone, label, lead }: MeasureRowProps) {
    return (
        <div className={`ro-row${lead ? ' lead' : ''}`}>
            <span className="ro-name">{name}</span>
            <span className="ro-meter" aria-hidden="true">
                <i
                    className={tone ?? scoreTone(value)}
                    style={{ width: `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%` }}
                />
            </span>
            <span className="ro-val">{label ?? pct(value, 1)}</span>
        </div>
    );
}
