import { describe, expect, it } from 'vitest';
import { landingPath } from './OnboardingGate';

const items = [
    { key: 'dashboard', defaultPath: '/dashboard/today' },
    { key: 'scenario', defaultPath: '/agent' },
    { key: 'projects', defaultPath: '/projects' },
];

describe('landing', () => {
    it('lands a new install (nothing saved) on the agent page', () => {
        expect(landingPath(null, items)).toBe('/agent');
    });

    it('reopens the activity the user was last in', () => {
        expect(landingPath('dashboard', items)).toBe('/dashboard/today');
        expect(landingPath('projects', items)).toBe('/projects');
    });

    it('opens /agent for the agent activity, so the last agent page wins', () => {
        expect(landingPath('scenario', items)).toBe('/agent');
    });

    it('falls back to the agent page when the saved activity is gone', () => {
        expect(landingPath('image', items)).toBe('/agent');
        expect(landingPath('help', items)).toBe('/agent');
    });
});
