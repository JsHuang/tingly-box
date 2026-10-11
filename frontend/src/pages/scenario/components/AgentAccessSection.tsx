import { Box, Button, ButtonBase, Card, Collapse, Typography } from '@mui/material';
import { ChevronRight as ChevronRightIcon, ExpandMore as ExpandMoreIcon } from '@/components/icons';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fontMono } from '@/theme/fonts';

const PREF_KEY = (scenario: string) => `agent-access-expanded-${scenario}`;

const readPref = (scenario: string): boolean | null => {
    try {
        const v = localStorage.getItem(PREF_KEY(scenario));
        return v === 'true' ? true : v === 'false' ? false : null;
    } catch {
        return null; // storage unavailable: just follow the default
    }
};

/**
 * Whether the connection section is open. It always sits in the same place on
 * the page; what changes is how much of it shows. `defaultExpanded` (not
 * connected yet, or the client's config is out of date) decides until the user
 * opens or closes it themselves — that choice is remembered on this machine.
 */
export function useAccessExpanded(scenario: string, defaultExpanded: boolean) {
    const [pref, setPref] = useState<boolean | null>(() => readPref(scenario));
    const expanded = pref ?? defaultExpanded;
    const toggle = useCallback(() => {
        const next = !expanded;
        setPref(next);
        try {
            localStorage.setItem(PREF_KEY(scenario), String(next));
        } catch { /* best-effort */ }
    }, [expanded, scenario]);
    return { expanded, toggle };
}

export interface AgentAccessSectionProps {
    expanded: boolean;
    onToggle: () => void;
    /** The full Base URL as the client should use it (Local / Docker applied). */
    url: string;
    onCopyUrl: () => void;
    /** The open section: Base URL, API Key, mode switches, config button... */
    children: React.ReactNode;
    /** Always visible, below the folding part (settings used day to day). */
    footer?: React.ReactNode;
}

/**
 * The Agent page's connection section, fixed between the status row and the
 * rules. Open: everything needed to point a client at the gateway. Folded:
 * one line — "Connection ▸ <Base URL> · Key ●●●●●● [Copy URL]".
 */
export const AgentAccessSection: React.FC<AgentAccessSectionProps> = ({ expanded, onToggle, url, onCopyUrl, children, footer }) => {
    const { t } = useTranslation();
    return (
        <Card
            sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', backgroundColor: 'background.paper' }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, minHeight: 48 }}>
                <ButtonBase
                    onClick={onToggle}
                    aria-expanded={expanded}
                    aria-label={t(expanded ? 'agentAccess.collapse' : 'agentAccess.expand')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, borderRadius: 1, px: 0.5, py: 0.25, flexShrink: 0, '&:hover': { backgroundColor: 'action.hover' } }}
                >
                    {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t('agentAccess.title')}</Typography>
                </ButtonBase>
                {!expanded && (
                    <>
                        <Typography
                            variant="body2"
                            noWrap
                            title={url}
                            sx={{ fontFamily: fontMono, color: 'text.primary', minWidth: 0, flex: '0 1 auto' }}
                        >
                            {url}
                        </Typography>
                        <Typography variant="body2" noWrap sx={{ color: 'text.secondary', flexShrink: 0 }}>
                            · {t('agentAccess.key')} ●●●●●●
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <Button size="small" variant="outlined" onClick={onCopyUrl} sx={{ flexShrink: 0 }}>
                            {t('agentAccess.copyUrl')}
                        </Button>
                    </>
                )}
            </Box>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ pb: 1 }}>{children}</Box>
            </Collapse>
            {footer}
        </Card>
    );
};

export default AgentAccessSection;
