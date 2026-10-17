import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SharingKey } from '@/components/SharingKeysTable';
import TeamKeysOverview, { useTeamKeysOverviewExpanded } from './TeamKeysOverview';

// t() echoes the key, plus the count so the folded line's number is checkable.
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: { count?: number }) => (opts?.count !== undefined ? `${key}:${opts.count}` : key),
    }),
}));

const makeKey = (i: number, enabled = true): SharingKey => ({
    token_id: `tb-share-${String(i).padStart(4, '0')}abcdefghijklmnopqrstuvwxyz`,
    user_id: `user-${i}`,
    team_id: 'team-1',
    display_name: `Person ${i}`,
    enabled,
    created_at: '2026-10-01T00:00:00Z',
});

const renderOverview = (keys: SharingKey[], expanded: boolean, extra: Partial<React.ComponentProps<typeof TeamKeysOverview>> = {}) =>
    render(
        <TeamKeysOverview
            keys={keys}
            loading={false}
            expanded={expanded}
            onToggle={vi.fn()}
            visibleTokens={{}}
            onToggleVisibility={vi.fn()}
            onCopy={vi.fn()}
            {...extra}
        />,
    );

describe('TeamKeysOverview', () => {
    it('folded: one line with the key count, no keys listed', () => {
        const onToggle = vi.fn();
        renderOverview([makeKey(1), makeKey(2), makeKey(3, false), makeKey(4), makeKey(5)], false, { onToggle });
        expect(screen.getByTestId('team-keys-count')).toHaveTextContent('sharingKeys.overview.count:5');
        expect(screen.queryByText('Person 1')).toBeNull();
        const toggle = screen.getByRole('button', { expanded: false });
        fireEvent.click(toggle);
        expect(onToggle).toHaveBeenCalledOnce();
    });

    it('open: lists every key by person, masked', () => {
        const keys = Array.from({ length: 12 }, (_, i) => makeKey(i + 1));
        renderOverview(keys, true);
        expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
        const list = screen.getByRole('list', { name: 'sharingKeys.title' });
        const rows = within(list).getAllByRole('listitem');
        expect(rows).toHaveLength(12);
        keys.forEach((key) => expect(within(list).getByText(key.display_name)).toBeInTheDocument());
        // masked like the Team Keys table: prefix … last four, never the full key
        expect(within(rows[0]).getByText('tb-share-000...wxyz')).toBeInTheDocument();
        expect(screen.queryByText(keys[0].token_id)).toBeNull();
    });

    it('reveals a key the user asked to see', () => {
        const key = makeKey(1);
        renderOverview([key], true, { visibleTokens: { [key.token_id]: true } });
        expect(screen.getByText(key.token_id)).toBeInTheDocument();
    });

    it('shows a quiet empty state for a Team without keys', () => {
        renderOverview([], true);
        expect(screen.getByTestId('team-keys-count')).toHaveTextContent('sharingKeys.overview.count:0');
        expect(screen.getByText('sharingKeys.overview.empty')).toBeInTheDocument();
        expect(screen.queryByRole('list')).toBeNull();
    });
});

describe('useTeamKeysOverviewExpanded', () => {
    beforeEach(() => localStorage.clear());

    it('starts folded and remembers the user\'s choice across reloads', () => {
        const { result } = renderHook(() => useTeamKeysOverviewExpanded());
        expect(result.current.expanded).toBe(false);
        act(() => result.current.toggle());
        expect(result.current.expanded).toBe(true);
        expect(localStorage.getItem('team-keys-overview-expanded')).toBe('true');
        // a fresh mount (page reload) starts from the saved choice
        const again = renderHook(() => useTeamKeysOverviewExpanded());
        expect(again.result.current.expanded).toBe(true);
        act(() => again.result.current.toggle());
        expect(renderHook(() => useTeamKeysOverviewExpanded()).result.current.expanded).toBe(false);
    });

    it('stays folded without storage', () => {
        const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
        const { result } = renderHook(() => useTeamKeysOverviewExpanded());
        expect(result.current.expanded).toBe(false);
        spy.mockRestore();
    });
});
