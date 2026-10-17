import { Box, ButtonBase, Card, Chip, CircularProgress, Collapse, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
    ContentCopy as IconCopy,
    ExpandMore as ExpandMoreIcon,
    Visibility as IconEye,
    VisibilityOff as IconEyeOff,
} from '@/components/icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfigRow from '@/components/ConfigRow';
import type { SharingKey } from '@/components/SharingKeysTable';
import { fontMono, fontSizes } from '@/theme/fonts';
import { maskToken } from '@/utils/sharingKey';
import { SCENARIO_HEADER_CONTENT_MAX_WIDTH } from './ScenarioCardHeader';

const PREF_KEY = 'team-keys-overview-expanded';

// Same right-edge room for the fold chevron as the connection card below
// (AgentAccessSection), so the two cards' rows and chevrons line up.
const CHEVRON_GUTTER = 6;

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
 *
 * Built like the connection card below it: folded, one ConfigRow line
 * ("Team Keys   5 keys") that is itself the fold button; open, the keys
 * follow on the same label / value / trailing grid. Editing stays in the
 * Team Keys dialog.
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
                position: 'relative',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                backgroundColor: 'background.paper',
            }}
        >
            {/* The summary line is the fold button in both states; its name is
                what it shows, the hover title says what clicking does. */}
            <ButtonBase
                component="div"
                onClick={onToggle}
                aria-expanded={expanded}
                title={label}
                sx={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    '&:hover': { backgroundColor: 'action.hover' },
                    '&:hover .team-keys-chevron': { color: 'text.primary' },
                }}
            >
                <Box sx={{ pt: 1, pb: 1, pr: CHEVRON_GUTTER }}>
                    <Box sx={{ maxWidth: SCENARIO_HEADER_CONTENT_MAX_WIDTH }}>
                        <Box sx={{ px: 2, py: 0.5 }}>
                            <ConfigRow
                                tabs={[{
                                    key: 'keys',
                                    label: t('sharingKeys.title'),
                                    content: loading ? (
                                        <Box sx={{ py: 1, display: 'flex' }}><CircularProgress size={16} /></Box>
                                    ) : (
                                        <Typography data-testid="team-keys-count" variant="subtitle2" sx={{ py: 1 }}>
                                            {t('sharingKeys.overview.count', { count: keys.length })}
                                        </Typography>
                                    ),
                                }]}
                                activeTab="keys"
                                onTabChange={() => {}}
                            />
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ position: 'absolute', top: 12, right: 22, p: 0.25, display: 'flex' }}>
                    <ExpandMoreIcon
                        className="team-keys-chevron"
                        sx={{
                            transition: 'transform 0.2s',
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            fontSize: '1.1rem',
                            color: 'text.secondary',
                        }}
                    />
                </Box>
            </ButtonBase>
            <Collapse in={expanded} timeout={0} unmountOnExit>
                <Box sx={{ pb: 1, pr: CHEVRON_GUTTER }}>
                    <Box sx={{ maxWidth: SCENARIO_HEADER_CONTENT_MAX_WIDTH, px: 2 }}>
                        {!loading && keys.length === 0 ? (
                            <Typography variant="body2" sx={{ color: 'text.secondary', px: 1.5, pb: 0.5 }}>
                                {t('sharingKeys.overview.empty')}
                            </Typography>
                        ) : (
                            // Capped so a Team with many keys scrolls inside the card
                            // instead of pushing the rules below off the page.
                            <Box
                                component="ul"
                                aria-label={t('sharingKeys.title')}
                                sx={{ listStyle: 'none', m: 0, p: 0, maxHeight: 320, overflowY: 'auto' }}
                            >
                                {keys.map((key) => {
                                    const visible = !!visibleTokens[key.token_id];
                                    return (
                                        <Box
                                            component="li"
                                            key={key.token_id}
                                            sx={{
                                                // ConfigRow's grid, so names sit under "Team Keys"
                                                // and keys under the count, as in the card below.
                                                display: 'grid',
                                                alignItems: 'center',
                                                columnGap: { xs: 1, sm: 3 },
                                                gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: '168px minmax(0, 1fr) auto' },
                                                py: 0.5,
                                                opacity: key.enabled ? 1 : 0.55,
                                            }}
                                        >
                                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, px: 1.5, gridColumn: { xs: '1 / -1', sm: '1' } }}>
                                                <Typography noWrap title={key.display_name} sx={{ fontSize: fontSizes.md, fontWeight: 500, minWidth: 0 }}>
                                                    {key.display_name}
                                                </Typography>
                                                {!key.enabled && (
                                                    <Chip label={t('sharingKeys.table.inactive')} size="small" variant="outlined" sx={{ height: 18, fontSize: fontSizes.xs }} />
                                                )}
                                            </Stack>
                                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{ fontFamily: fontMono, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                >
                                                    {visible ? key.token_id : maskToken(key.token_id)}
                                                </Typography>
                                                <Tooltip title={visible ? t('sharingKeys.table.hide') : t('sharingKeys.table.show')}>
                                                    <IconButton size="small" sx={iconButtonSx} onClick={() => onToggleVisibility(key.token_id)}>
                                                        {visible ? <IconEyeOff sx={{ fontSize: 14 }} /> : <IconEye sx={{ fontSize: 14 }} />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('sharingKeys.table.copy')}>
                                                    <IconButton size="small" sx={iconButtonSx} onClick={() => onCopy(key.token_id)}>
                                                        <IconCopy sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', justifySelf: 'end' }}>
                                                {t('sharingKeys.table.lastUsed')}: {formatDate(key.last_used_at)}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Collapse>
        </Card>
    );
};

export default TeamKeysOverview;
