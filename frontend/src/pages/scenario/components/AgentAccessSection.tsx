import { Box, ButtonBase, Card, Collapse, Typography } from '@mui/material';
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
    /** The open section: Base URL, API Key, model mode... */
    children: React.ReactNode;
}

/**
 * The Agent page's connection card, fixed between the status row and the
 * rules. Open: the original card (Base URL, API Key, ...). Folded: a single
 * line — an arrow and the Base URL; the whole line opens it.
 */
export const AgentAccessSection: React.FC<AgentAccessSectionProps> = ({ expanded, onToggle, url, children }) => {
    const { t } = useTranslation();
    return (
        <Card
            sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', backgroundColor: 'background.paper' }}
        >
            <ButtonBase
                onClick={onToggle}
                aria-expanded={expanded}
                aria-label={t(expanded ? 'agentAccess.collapse' : 'agentAccess.expand')}
                sx={{ display: 'flex', width: '100%', justifyContent: 'flex-start', alignItems: 'center', gap: 0.75, px: 2, py: 1, minHeight: 44, textAlign: 'left', '&:hover': { backgroundColor: 'action.hover' } }}
            >
                {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                {expanded ? (
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t('agentAccess.title')}</Typography>
                ) : (
                    <Typography variant="body2" noWrap sx={{ fontFamily: fontMono, color: 'text.primary', minWidth: 0 }}>
                        {url}
                    </Typography>
                )}
            </ButtonBase>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ pb: 1 }}>{children}</Box>
            </Collapse>
        </Card>
    );
};

export default AgentAccessSection;
