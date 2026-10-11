import { beforeEach, describe, expect, it } from 'vitest';
import { getHiddenScenarios } from './scenarioRegistry';

const KEY = 'scenario.hiddenScenarios';
const VERSION_KEY = 'scenario.hiddenDefaultsVersion';

describe('hidden agent defaults', () => {
    beforeEach(() => localStorage.clear());

    it('shows custom and workbuddy by default, hides pi and cursor', () => {
        const hidden = getHiddenScenarios();
        expect(hidden.has('custom')).toBe(false);
        expect(hidden.has('workbuddy')).toBe(false);
        expect(hidden.has('pi')).toBe(true);
        expect(hidden.has('cursor')).toBe(true);
    });

    it('clears the old default-hidden custom once, keeping other hidden choices', () => {
        localStorage.setItem(KEY, JSON.stringify(['custom', 'pi', 'cursor', 'xcode']));
        localStorage.setItem(VERSION_KEY, '5');
        const hidden = getHiddenScenarios();
        expect(hidden.has('custom')).toBe(false);
        expect(hidden.has('xcode')).toBe(true);
        expect(hidden.has('pi')).toBe(true);
    });

    it('respects a user hiding custom/workbuddy after the migration', () => {
        localStorage.setItem(KEY, JSON.stringify(['custom', 'workbuddy']));
        localStorage.setItem(VERSION_KEY, '7');
        const hidden = getHiddenScenarios();
        expect(hidden.has('custom')).toBe(true);
        expect(hidden.has('workbuddy')).toBe(true);
    });
});
