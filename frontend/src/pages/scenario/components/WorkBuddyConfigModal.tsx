import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScenarioPageModal } from '@/pages/scenario/context/ScenarioPageContext';
import { CopyUrlKeyButtons } from './config/CopyUrlKeyButtons';
import { InstructionSteps } from './config/InstructionSteps';
import { fontMono } from '@/theme/fonts';

interface WorkBuddyConfigModalProps {
    open: boolean;
    onClose: () => void;
    baseUrl: string;
    copyToClipboard: (text: string, label: string) => Promise<void>;
}

const WorkBuddyConfigModal: React.FC<WorkBuddyConfigModalProps> = ({
    open,
    onClose,
    baseUrl,
    copyToClipboard,
}) => {
    const { t } = useTranslation();
    const { token } = useScenarioPageModal();
    // Give the complete chat-completions endpoint. WorkBuddy validates / completes
    // a bare base URL when "Custom Protocol" is off, but a full path is correct
    // either way.
    const url = `${baseUrl}/tingly/workbuddy/v1/chat/completions`;
    const modelPlaceholder = t('scenarioPage.workbuddy.modelPlaceholder');
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('scenarioPage.workbuddy.configTitle')}
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
                <Stack spacing={2}>
                    <InstructionSteps
                        steps={[
                            <><strong>1.</strong> {t('scenarioPage.workbuddy.step1')}</>,
                            <><strong>2.</strong> {t('scenarioPage.workbuddy.step2')}</>,
                        ]}
                        values={
                            <>
                                <Typography variant="subtitle2" sx={{ fontFamily: fontMono, wordBreak: 'break-all' }}>
                                    {t('scenarioPage.workbuddy.labelUrl')}: <strong>{url}</strong>
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontFamily: fontMono }}>
                                    {t('scenarioPage.workbuddy.labelApiKey')}: <strong>{token.slice(0, 16)}...</strong>
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontFamily: fontMono }}>
                                    {t('scenarioPage.workbuddy.labelModel')}: <strong>{modelPlaceholder}</strong>
                                </Typography>
                            </>
                        }
                        trailingStep={<><strong>3.</strong> {t('scenarioPage.workbuddy.capabilityNote')}</>}
                    />

                    <CopyUrlKeyButtons url={url} token={token} copyToClipboard={copyToClipboard} />

                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {t('scenarioPage.workbuddy.restartNote')}
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
                <Button onClick={onClose} variant="contained">
                    {t('common.done')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WorkBuddyConfigModal;
