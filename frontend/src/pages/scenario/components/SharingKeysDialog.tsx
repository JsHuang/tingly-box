import { Key as IconKey } from '@/components/icons';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Stack,
} from '@mui/material';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import SharingKeysTable, { type SharingKey } from '@/components/SharingKeysTable';
import CreateSharingKeyButton from '@/components/CreateSharingKeyButton';
import type { Team } from '@/types/team';
import TeamKeyScopeAlert from '@/components/TeamKeyScopeAlert';

type TableActionProps = Omit<ComponentProps<typeof SharingKeysTable>, 'tokens' | 'loading'>;

interface SharingKeysDialogProps {
    open: boolean;
    onClose: () => void;
    team: Team;
    /** The Team's keys, owned by the page so its overview stays in step. */
    keys: SharingKey[];
    loading: boolean;
    /** From the page's `useSharingKeyActions`. */
    tableProps: TableActionProps;
    onCreate: () => void;
}

const SharingKeysDialog: React.FC<SharingKeysDialogProps> = ({ open, onClose, team, keys, loading, tableProps, onCreate }) => {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1} sx={{
                    alignItems: "center"
                }}>
                    <IconKey />
                    <span>{t('sharingKeys.titleForTeam', {team: team.name})}</span>
                </Stack>
                <CreateSharingKeyButton team={team} onClick={onCreate} />
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <TeamKeyScopeAlert team={team} />
                    <SharingKeysTable
                        tokens={keys}
                        loading={loading}
                        {...tableProps}
                    />
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default SharingKeysDialog;
