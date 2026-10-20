import { describe, expect, it } from 'vitest';
import { CODEX_COMPACT, lowZoneStart, planCodexCompact } from './codexCompact';

const { window, window1M } = CODEX_COMPACT;

describe('planCodexCompact', () => {
    it('default 75% on 200K leaves 50K and is fine', () => {
        expect(planCodexCompact({ window, percent: 75 })).toEqual({
            applied: 75, line: 150_000, remain: 50_000, status: 'ok',
        });
    });

    it('warns when fewer than 40K tokens would remain', () => {
        const plan = planCodexCompact({ window, percent: 82, effectivePercent: 95 });
        expect(plan.remain).toBe(36_000);
        expect(plan.status).toBe('low');
    });

    it('the same percent is fine on a 1M window', () => {
        expect(planCodexCompact({ window: window1M, percent: 82 }).status).toBe('ok');
    });

    it('is cut down to the usable window and says so', () => {
        const plan = planCodexCompact({ window: window1M, percent: 90 });
        expect(plan.applied).toBe(82);
        expect(plan.status).toBe('limited');
    });

    it('flags values above the Codex ceiling and writes the ceiling', () => {
        const plan = planCodexCompact({ window, percent: 100, effectivePercent: 100 });
        expect(plan.applied).toBe(90);
        expect(plan.status).toBe('over');
    });
});

describe('lowZoneStart', () => {
    it('starts at 80% on 200K and does not exist on 1M', () => {
        expect(lowZoneStart(window)).toBeCloseTo(80);
        expect(lowZoneStart(window1M)).toBeNull();
    });
});
