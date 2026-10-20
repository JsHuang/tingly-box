import { useState } from 'react';
import { Box, ButtonBase, Collapse, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Thread } from '../../client';
import { CopyIconButton } from '@tingly/ui';
import { fontMono, fontSizes } from '@tingly/ui/theme/fonts';
import { AutoFixHigh, Branch, Check, ExpandLess, ExpandMore, FolderOpen } from '../icons';
import { folderName } from '../../utils/format';
import { readLocal, writeLocal } from '../../utils/storage';

export type AutoAnswer = 'off' | 'delay' | 'now';
const AUTO_ANSWERS: AutoAnswer[] = ['off', 'delay', 'now'];
const OPEN_KEY = 'thread.strip.open';

/**
 * The setting a thread's questions follow: its own, else delay for a
 * project thread (its owner is usually away) and off for a folder session
 * (its owner is usually watching). Mirrors the server's autoAnswerMode.
 */
export function autoAnswerOf(thread: Thread): AutoAnswer {
    const own = thread.auto_answer as AutoAnswer | undefined;
    if (own && AUTO_ANSWERS.includes(own)) return own;
    return thread.project_id ? 'delay' : 'off';
}

const clip = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 } as const;
const ROW_H = 30;

/** One fact on its own line: icon, name, value, and its action at the end. */
function Row({ icon, name, children, action }: { icon: React.ReactNode; name: string; children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: ROW_H, px: 1.25, minWidth: 0, '& > svg': { fontSize: 15, flexShrink: 0, color: 'text.secondary' } }}>
            {icon}
            <Box component="span" sx={{ width: 84, flexShrink: 0, color: 'text.secondary', whiteSpace: 'nowrap' }}>{name}</Box>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.primary' }}>{children}</Box>
            {action}
        </Box>
    );
}

interface Props {
    thread: Thread;
    /** Saves the auto-answer setting; the row is left out without it. */
    onAutoAnswer?: (mode: AutoAnswer) => void;
}

/**
 * What a thread runs in and how it treats its questions, in a panel right
 * above the message box: one fact per line, so a new one (a pull request,
 * CI) is one more line. Folded, it is a single line naming them all; the
 * choice is remembered per browser.
 */
export function ComposerStrip({ thread, onAutoAnswer }: Props) {
    const { t } = useTranslation('projects');
    const [open, setOpenState] = useState(() => readLocal(OPEN_KEY) === '1');
    const setOpen = (v: boolean) => {
        setOpenState(v);
        writeLocal(OPEN_KEY, v ? '1' : '0');
    };
    const [menu, setMenu] = useState<HTMLElement | null>(null);
    const branch = thread.branch || thread.head_branch;
    const mode = autoAnswerOf(thread);
    const own = (thread.auto_answer ?? '') !== '';
    const showAuto = !!onAutoAnswer && thread.status !== 'resolved';
    if (!thread.worktree && !branch && !showAuto) return null;

    const summary = [
        thread.worktree && <Box key="f" component="span" sx={{ ...clip, display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 1 }}><FolderOpen sx={{ fontSize: 14 }} /><Box component="span" sx={{ ...clip, fontFamily: fontMono }}>{folderName(thread.worktree)}</Box></Box>,
        branch && <Box key="b" component="span" sx={{ ...clip, display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 2 }}><Branch sx={{ fontSize: 14 }} /><Box component="span" sx={{ ...clip, fontFamily: fontMono }}>{branch}</Box></Box>,
        showAuto && <Box key="a" component="span" sx={{ ...clip, display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}><AutoFixHigh sx={{ fontSize: 14, color: mode === 'off' ? 'inherit' : 'primary.main' }} />{t(`strip.autoAnswer.${mode}`)}</Box>,
    ].filter(Boolean);

    return (
        <Box data-testid="composer-strip" sx={{ mb: 0.75, borderRadius: 1.5, bgcolor: 'action.hover', fontSize: fontSizes.sm, lineHeight: 1.4, color: 'text.secondary', overflow: 'hidden' }}>
            {/* Folded: one line naming every fact; the whole line unfolds it. */}
            <ButtonBase
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-label={t(open ? 'strip.collapse' : 'strip.expand')}
                sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.25, minHeight: ROW_H, px: 1.25, justifyContent: 'flex-start', font: 'inherit', color: 'inherit', textAlign: 'left', '&:hover': { color: 'text.primary' } }}
            >
                {open
                    ? <Box component="span" sx={{ flex: 1, fontWeight: 600 }}>{t(thread.project_id ? 'strip.title' : 'strip.sessionTitle')}</Box>
                    : <Box component="span" sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1.25, overflow: 'hidden' }}>{summary}</Box>}
                {open ? <ExpandMore sx={{ fontSize: 16 }} /> : <ExpandLess sx={{ fontSize: 16 }} />}
            </ButtonBase>
            <Collapse in={open} unmountOnExit>
                <Box sx={{ pb: 0.5 }}>
                    {thread.worktree && (
                        <Row icon={<FolderOpen />} name={t('strip.folder')}
                            action={<CopyIconButton value={`cd ${thread.worktree}`} label={t('strip.copyCd')} copiedLabel={t('common.copied')} iconSize={14} sx={{ p: 0.25 }} />}>
                            {/* A long path keeps its end, the part that tells folders apart. */}
                            <Box component="span" title={thread.worktree} sx={{ ...clip, fontFamily: fontMono, direction: 'rtl', textAlign: 'left' }}><bdi>{thread.worktree}</bdi></Box>
                        </Row>
                    )}
                    {branch && (
                        <Row icon={<Branch />} name={t('strip.branch')}
                            action={<CopyIconButton value={branch} label={t('strip.copyBranch')} copiedLabel={t('common.copied')} iconSize={14} sx={{ p: 0.25 }} />}>
                            <Box component="span" sx={{ ...clip, fontFamily: fontMono }}>{branch}</Box>
                            {thread.branch && thread.base_branch && <Box component="span" sx={{ ...clip, flexShrink: 0, color: 'text.secondary' }}>{t('thread.fromBase', { base: thread.base_branch })}</Box>}
                        </Row>
                    )}
                    {showAuto && (
                        <Row icon={<AutoFixHigh sx={{ color: mode === 'off' ? undefined : 'primary.main' }} />} name={t('strip.autoAnswer.title')}>
                            <Tooltip title={t(`strip.autoAnswer.${mode}Help`)}>
                                <ButtonBase onClick={(e) => setMenu(e.currentTarget)} aria-label={t('strip.autoAnswer.change')}
                                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, px: 0.75, ml: -0.75, py: 0.25, borderRadius: 1, font: 'inherit', color: 'text.primary', '&:hover': { bgcolor: 'action.selected' } }}>
                                    {t(`strip.autoAnswer.${mode}`)}
                                    <ExpandMore sx={{ fontSize: 15, color: 'text.secondary' }} />
                                </ButtonBase>
                            </Tooltip>
                        </Row>
                    )}
                </Box>
            </Collapse>
            {onAutoAnswer && (
                <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    slotProps={{ paper: { sx: { maxWidth: 340 } } }}>
                    <Box sx={{ px: 2, pt: 0.5, pb: 0.75, fontSize: fontSizes.sm, color: 'text.secondary' }}>{t('strip.autoAnswer.menuTitle')}</Box>
                    {AUTO_ANSWERS.map((m) => (
                        <MenuItem key={m} selected={m === mode} onClick={() => { setMenu(null); if (m !== mode || !own) onAutoAnswer(m); }} sx={{ alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{ width: 16, pt: 0.25, flexShrink: 0 }}>{m === mode && <Check sx={{ fontSize: 16 }} />}</Box>
                            <ListItemText primary={t(`strip.autoAnswer.${m}`)} secondary={t(`strip.autoAnswer.${m}Help`)}
                                slotProps={{ primary: { sx: { fontSize: '0.875rem' } }, secondary: { sx: { whiteSpace: 'normal', fontSize: fontSizes.sm } } }} />
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </Box>
    );
}
