import { Box, ButtonBase, Card, Collapse, Tooltip, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@/components/icons';
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
 * line with the Base URL; the whole line opens it. The fold chevron sits at
 * the card's right edge, as on the rule cards.
 */
export const AgentAccessSection: React.FC<AgentAccessSectionProps> = ({ expanded, onToggle, url, children }) => {
    const { t } = useTranslation();
    const label = t(expanded ? 'agentAccess.collapse' : 'agentAccess.expand');
    // The same fold control as the rule card's header (ModelRequestHeader): a
    // chevron, turned over while open, grey until hovered.
    const chevron = (
        <ExpandMoreIcon
            sx={{
                transition: 'transform 0.2s',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                fontSize: '1.1rem',
                color: 'text.secondary',
                flexShrink: 0,
            }}
        />
    );
    return (
        <Card
            sx={{
                position: 'relative',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                backgroundColor: 'background.paper',
                '& .agent-access-toggle:hover svg': { color: 'text.primary' },
            }}
        >
            {expanded ? (
                <Tooltip title={label}>
                    <ButtonBase
                        className="agent-access-toggle"
                        onClick={onToggle}
                        aria-expanded
                        aria-label={label}
                        sx={{ position: 'absolute', top: 12, right: 22, zIndex: 1, p: 0.25, borderRadius: 1 }}
                    >
                        {chevron}
                    </ButtonBase>
                </Tooltip>
            ) : (
                <ButtonBase
                    className="agent-access-toggle"
                    onClick={onToggle}
                    aria-expanded={false}
                    aria-label={label}
                    sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: 2, px: 3, py: 1, minHeight: 48, textAlign: 'left', '&:hover': { backgroundColor: 'action.hover' } }}
                >
                    <Typography variant="body2" noWrap sx={{ fontFamily: fontMono, color: 'text.primary', minWidth: 0 }}>
                        {url}
                    </Typography>
                    {chevron}
                </ButtonBase>
            )}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ pt: 1, pb: 1 }}>{children}</Box>
            </Collapse>
        </Card>
    );
};

export default AgentAccessSection;
