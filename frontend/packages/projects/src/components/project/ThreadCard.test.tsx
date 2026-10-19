import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Thread } from '../../client';
import { ThreadCard } from './ConversationPane';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../Markdown', () => ({ Markdown: ({ text }: { text: string }) => <div data-testid="report">{text}</div> }));
vi.mock('./DiffDialog', () => ({ DiffDialog: () => null }));

afterEach(cleanup);

describe('ThreadCard report', () => {
    it('keeps the last report folded until the arrow is clicked, without opening the thread', () => {
        const onOpen = vi.fn();
        const thread = { id: 't', title: 'Fix login', status: 'idle', last_report: 'Fixed it.\n\nAll tests pass.', commits_ahead: 0 } as unknown as Thread;
        render(<ThreadCard thread={thread} onOpen={onOpen} />);
        expect(screen.queryByTestId('report')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'thread.showReport' }));
        expect(screen.getByTestId('report').textContent).toContain('All tests pass.');
        expect(onOpen).not.toHaveBeenCalled();
    });
});
