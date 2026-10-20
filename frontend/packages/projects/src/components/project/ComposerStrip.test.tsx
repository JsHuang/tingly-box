import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Thread } from '../../client';
import { autoAnswerOf, ComposerStrip } from './ComposerStrip';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

afterEach(() => {
    cleanup();
    localStorage.clear();
});

const thread = (o: Partial<Thread>): Thread => ({
    id: 't', project_id: 'p', title: 'Fix login', task: '', status: 'working', origin: 'user', worktree: '/work/app',
    commits_ahead: 0, files_changed: 0, uncommitted: false, turns: 0, input_tokens: 0, output_tokens: 0, created_at: '', updated_at: '', ...o,
} as Thread);

describe('ComposerStrip', () => {
    it('defaults to waiting ten minutes in a project thread and to off in a folder session', () => {
        expect(autoAnswerOf(thread({}))).toBe('delay');
        expect(autoAnswerOf(thread({ project_id: '' }))).toBe('off');
        expect(autoAnswerOf(thread({ project_id: '', auto_answer: 'now' }))).toBe('now');
    });

    it('folds to one line and unfolds to one line per fact', () => {
        const onAutoAnswer = vi.fn();
        render(<ComposerStrip thread={thread({ branch: 'tb/fix-login', base_branch: 'main' })} onAutoAnswer={onAutoAnswer} />);
        // Folded: the summary names the folder, the branch and the setting.
        expect(screen.getByText('app')).toBeInTheDocument();
        expect(screen.getByText('tb/fix-login')).toBeInTheDocument();
        expect(screen.queryByText('/work/app')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'strip.expand' }));
        expect(screen.getByText('/work/app')).toBeInTheDocument();
        expect(screen.getByText('strip.autoAnswer.title')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'strip.autoAnswer.change' }));
        fireEvent.click(screen.getByText('strip.autoAnswer.now'));
        expect(onAutoAnswer).toHaveBeenCalledWith('now');
    });

    it('names a folder session’s branch, and drops auto-answer once resolved', () => {
        render(<ComposerStrip thread={thread({ project_id: '', head_branch: 'main', status: 'resolved' })} onAutoAnswer={vi.fn()} />);
        expect(screen.getByText('main')).toBeInTheDocument();
        expect(screen.queryByText('strip.autoAnswer.off')).toBeNull();
    });
});
