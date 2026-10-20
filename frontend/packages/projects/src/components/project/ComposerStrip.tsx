import { useState } from 'react';
import { Box, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Thread } from '../../client';
import { fontMono, fontSizes } from '@tingly/ui/theme/fonts';
import { AutoFixHigh, Branch, Check, ExpandMore, FolderOpen } from '../icons';
import { useCopyFeedback } from '../../hooks/useCopyFeedback';
import { folderName } from '../../utils/format';

export type AutoAnswer = 'off' | 'delay' | 'now';
const AUTO_ANSWERS: AutoAnswer[] = ['off', 'delay', 'now'];

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

/** One floating piece of the strip: quiet, rounded, a button when it acts. */
function Pill({ title, onClick, label, children }: { title: React.ReactNode; onClick?: (e: React.MouseEvent<HTMLElement>) => void; label: string; children: React.ReactNode }) {
    return (
        <Tooltip title={title}>
            <Box
                component={onClick ? 'button' : 'span'}
                type={onClick ? 'button' : undefined}
                aria-label={label}
                onClick={onClick}
                sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5, minWidth: 0, maxWidth: '100%',
                    px: 1, py: 0.375, borderRadius: 1, border: 1, borderColor: 'divider',
                    bgcolor: 'background.paper', color: 'text.secondary', font: 'inherit', fontSize: fontSizes.sm, lineHeight: 1.4,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    cursor: onClick ? 'pointer' : 'default',
                    '&:hover': onClick ? { color: 'text.primary', bgcolor: 'action.hover' } : undefined,
                    '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 1 },
                    '& svg': { fontSize: 14, flexShrink: 0 },
                }}
            >
                {children}
            </Box>
        </Tooltip>
    );
}

const clip = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 } as const;

interface Props {
    thread: Thread;
    /** Saves the auto-answer setting; the strip hides the picker without it. */
    onAutoAnswer?: (mode: AutoAnswer) => void;
}

/**
 * What a thread runs in and how it treats its questions, floating right
 * above the message box: where to look while writing to it. Each fact is
 * its own piece, so more (a pull request, CI) can join the row later.
 */
export function ComposerStrip({ thread, onAutoAnswer }: Props) {
    const { t } = useTranslation('projects');
    const cd = useCopyFeedback();
    const name = useCopyFeedback();
    const [menu, setMenu] = useState<HTMLElement | null>(null);
    const branch = thread.branch || thread.head_branch;
    const mode = autoAnswerOf(thread);
    const own = (thread.auto_answer ?? '') !== '';

    return (
        <Box data-testid="composer-strip" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.75, minWidth: 0 }}>
            {thread.worktree && (
                <Pill label={t('strip.folder')} onClick={() => void cd.copy(`cd ${thread.worktree}`)}
                    title={<><Box sx={{ fontFamily: fontMono }}>{thread.worktree}</Box>{cd.copied ? t('common.copied') : t('strip.copyCd')}</>}>
                    {cd.copied ? <Check /> : <FolderOpen />}
                    <Box component="span" sx={{ ...clip, fontFamily: fontMono }}>{folderName(thread.worktree)}</Box>
                </Pill>
            )}
            {branch && (
                <Pill label={t('strip.branch')} onClick={() => void name.copy(branch)}
                    title={<>{thread.base_branch && thread.branch ? <Box>{t('thread.fromBase', { base: thread.base_branch })}</Box> : null}{name.copied ? t('common.copied') : t('strip.copyBranch')}</>}>
                    {name.copied ? <Check /> : <Branch />}
                    <Box component="span" sx={{ ...clip, fontFamily: fontMono }}>{branch}</Box>
                </Pill>
            )}
            {onAutoAnswer && thread.status !== 'resolved' && (
                <>
                    <Pill label={t('strip.autoAnswer.title')} onClick={(e) => setMenu(e.currentTarget)} title={t(`strip.autoAnswer.${mode}Help`)}>
                        <AutoFixHigh sx={{ color: mode === 'off' ? 'inherit' : 'primary.main' }} />
                        <Box component="span" sx={clip}>{t('strip.autoAnswer.chip', { value: t(`strip.autoAnswer.${mode}`) })}</Box>
                        <ExpandMore />
                    </Pill>
                    <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
                </>
            )}
        </Box>
    );
}
