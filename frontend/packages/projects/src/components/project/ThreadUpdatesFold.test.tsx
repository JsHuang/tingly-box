import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProjectMessage } from '../../client';
import { ThreadUpdatesFold } from './ConversationPane';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, opts?: { count?: number }) => (opts?.count != null ? `${key}:${opts.count}` : key) }),
}));
vi.mock('../Markdown', () => ({ Markdown: ({ text }: { text: string }) => <div>{text}</div> }));

afterEach(cleanup);

const update = (id: string, title: string, text: string): ProjectMessage => ({
    id, kind: 'thread_update', role: 'system', content: text, project_id: 'p', created_at: '',
    payload: JSON.stringify({ thread_id: id, title, kind: 'finished', status: 'ready' }),
});

describe('ThreadUpdatesFold', () => {
    it('stays closed until clicked, then shows each thread report and opens its thread', () => {
        const onOpen = vi.fn();
        render(<ThreadUpdatesFold onOpen={onOpen} updates={[update('a', 'Fix login', 'fixed it'), update('b', 'Add README', 'added')]} />);
        expect(screen.getByText('conversation.updates:2')).toBeInTheDocument();
        expect(screen.queryByText('fixed it')).toBeNull();
        fireEvent.click(screen.getByRole('button', { expanded: false }));
        expect(screen.getByText('fixed it')).toBeInTheDocument();
        expect(screen.getByText('added')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Fix login' }));
        expect(onOpen).toHaveBeenCalledWith('a');
    });
});
