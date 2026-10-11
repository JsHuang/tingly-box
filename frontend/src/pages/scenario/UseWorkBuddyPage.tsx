import WorkBuddyConfigModal from './components/WorkBuddyConfigModal';
import { AgentPage, type AgentPageDescriptor } from './AgentPage';

const WORKBUDDY_DOCS_URL =
    'https://www.workbuddy.ai/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model';

// WorkBuddy is wired through its "custom model" setting (an OpenAI-compatible
// endpoint + key), not through a WorkBuddy account login — see
// .design/workbuddy-oauth.md for why there is no OAuth here.
const workbuddy: AgentPageDescriptor = {
    scenario: 'workbuddy',
    title: 'WorkBuddy',
    tooltipKey: 'scenarioPage.tooltip.workbuddy',
    connection: { compact: true, apiKeyRow: true, baseUrlRow: true },
    setup: {
        kind: 'guide',
        renderDialog: (slot) => (
            <WorkBuddyConfigModal
                open={slot.dialogOpen}
                onClose={slot.closeDialog}
                baseUrl={slot.baseUrl}
                copyToClipboard={slot.copyToClipboard}
            />
        ),
    },
    quickStart: {
        installDescriptionKey: 'scenarioPage.workbuddy.installDescription',
        installActions: (t) => [
            { label: t('scenarioPage.workbuddy.viewDocs'), href: WORKBUDDY_DOCS_URL, variant: 'outlined', external: true },
        ],
        applyStepLabelKey: 'scenarioPage.workbuddy.applyStepLabel',
        applyStepDescriptionKey: 'scenarioPage.workbuddy.applyStepDescription',
        openDialogLabelKey: 'scenarioPage.workbuddy.openGuide',
    },
};

const UseWorkBuddyPage: React.FC = () => <AgentPage agent={workbuddy} />;

export default UseWorkBuddyPage;
