import { Box, ButtonBase, Card, Chip, CircularProgress, Collapse, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
    ContentCopy as IconCopy,
    ExpandMore as ExpandMoreIcon,
    Key as IconKey,
    Visibility as IconEye,
    VisibilityOff as IconEyeOff,
} from '@/components/icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SharingKey } from '@/components/SharingKeysTable';
import { fontMono, fontSizes } from '@/theme/fonts';
import { maskToken } from '@/utils/sharingKey';

const PREF_KEY = 'team-keys-overview-expanded';

/**
 * Whether the Team page's key overview is open. Folded by default; once the
 * user opens or closes it, that choice is remembered on this machine for
 * every Team (it is a way of using the Team page, not a per-Team setting).
 */
export function useTeamKeysOverviewExpanded() {
    const [expanded, setExpanded] = useState<boolean>(() => {
        try {
            return localStorage.getItem(PREF_KEY) === 'true';
        } catch {
            return false; // storage unavailable: just follow the default
        }
    });
    const toggle = useCallback(() => {
        setExpanded((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(PREF_KEY, String(next));
            } catch { /* best-effort */ }
            return next;
        });
    }, []);
    return { expanded, toggle };
}

export interface TeamKeysOverviewProps {
    keys: SharingKey[];
    loading: boolean;
    expanded: boolean;
    onToggle: () => void;
    /** Shared with the Team Keys dialog, so a key revealed in one shows in both. */
    visibleTokens: Record<string, boolean>;
    onToggleVisibility: (tokenId: string) => void;
    onCopy: (tokenId: string) => void;
}

const formatDate = (dateStr?: string) => (dateStr ? new Date(dateStr).toLocaleString() : '-');

/**
 * Every key of the Team, always at hand under the page header — for handing
 * keys out to people. Each key is one person's credential (its own user id),
 * so a row is a person: name, key (masked, with reveal / copy), last use.
 * Folded it is one line with the count; editing stays in the Team Keys dialog.
 */
export const TeamKeysOverview: React.FC<TeamKeysOverviewProps> = ({
    keys, loading, expanded, onToggle, visibleTokens, onToggleVisibility, onCopy,
}) => {
    const { t } = useTranslation();
    const label = t(expanded ? 'sharingKeys.overview.collapse' : 'sharingKeys.overview.expand');
    const iconButtonSx = { p: 0.25, color: 'text.disabled', '&:hover': { color: 'text.primary' } };

    return (
        <Card
            sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                backgroundColor: 'background.paper',
            }}
        >
            {/* The whole line is the fold button; its name is what it shows
                ("Team Keys · 5 keys"), the hover title says what clicking does. */}
            <ButtonBase
                onClick={onToggle}
                aria-expanded={expanded}
                title={label}
                sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: 1,
                    px: 2,
                    py: 1,
                    textAlign: 'left',
                    '&:hover': { backgroundColor: 'action.hover' },
                    '&:hover .team-keys-chevron': { color: 'text.primary' },
                }}
            >
                <IconKey sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2">{t('sharingKeys.title')}</Typography>
                {loading ? (
                    <CircularProgress size={14} />
                ) : (
                    <Chip
                        data-testid="team-keys-count"
                        label={t('sharingKeys.overview.count', { count: keys.length })}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: fontSizes.xs, pointerEvents: 'none' }}
                    />
                )}
                <Box sx={{ flex: 1 }} />
                <ExpandMoreIcon
                    className="team-keys-chevron"
                    sx={{
                        transition: 'transform 0.2s',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        fontSize: '1.1rem',
                        color: 'text.secondary',
                    }}
                />
            </ButtonBase>
            <Collapse in={expanded} timeout={0} unmountOnExit>
                {!loading && keys.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', px: 2, pb: 1.5 }}>
                        {t('sharingKeys.overview.empty')}
                    </Typography>
                ) : (
                    // Capped so a Team with many keys scrolls inside the card
                    // instead of pushing the rules below off the page.
                    <Box
                        component="ul"
                        aria-label={t('sharingKeys.title')}
                        sx={{ listStyle: 'none', m: 0, px: 1, pb: 1, maxHeight: 320, overflowY: 'auto' }}
                    >
                        {keys.map((key) => {
                            const visible = !!visibleTokens[key.token_id];
                            return (
                                <Box
                                    component="li"
                                    key={key.token_id}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', md: 'minmax(140px, 1fr) minmax(260px, 2fr) minmax(150px, auto)' },
                                        alignItems: 'center',
                                        columnGap: 2,
                                        rowGap: 0.5,
                                        px: 1,
                                        py: 0.75,
                                        borderRadius: 1,
                                        opacity: key.enabled ? 1 : 0.55,
                                        '&:hover': { backgroundColor: 'action.hover' },
                                    }}
                                >
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                                        <Typography variant="body2" noWrap title={key.display_name} sx={{ fontWeight: 600, minWidth: 0 }}>
                                            {key.display_name}
                                        </Typography>
                                        {!key.enabled && (
                                            <Chip label={t('sharingKeys.table.inactive')} size="small" variant="outlined" sx={{ height: 18, fontSize: fontSizes.xs }} />
                                        )}
                                    </Stack>
                                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{ fontFamily: fontMono, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                        >
                                            {visible ? key.token_id : maskToken(key.token_id)}
                                        </Typography>
                                        <Tooltip title={visible ? t('sharingKeys.table.hide') : t('sharingKeys.table.show')}>
                                            <IconButton size="small" sx={iconButtonSx} onClick={() => onToggleVisibility(key.token_id)}>
                                                {visible ? <IconEyeOff sx={{ fontSize: 13 }} /> : <IconEye sx={{ fontSize: 13 }} />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('sharingKeys.table.copy')}>
                                            <IconButton size="small" sx={iconButtonSx} onClick={() => onCopy(key.token_id)}>
                                                <IconCopy sx={{ fontSize: 13 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                                        {t('sharingKeys.table.lastUsed')}: {formatDate(key.last_used_at)}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Collapse>
        </Card>
    );
};

export default TeamKeysOverview;
