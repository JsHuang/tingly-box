import { Navigate } from 'react-router-dom';
import { useActivityItems } from '@/layout/useActivityItems';
import type { ActivityItem } from '@/layout/types';

const ACTIVITY_KEY = 'layout.activeActivity';

function savedActivity(): string | null {
    try {
        return localStorage.getItem(ACTIVITY_KEY);
    } catch {
        return null;
    }
}

// OnboardingGate decides where an authenticated user lands: back in the rail
// activity they were last in, at its default page. The rail is ordered by how
// often each activity is used (Dashboard first), so whoever lives in the
// Dashboard opens straight into it, and whoever works on agents opens /agent.
// A brand-new install has no saved activity and lands on /agent, whose guided
// Quick Start (provider → model → install → apply) is the first-run path.
// An activity that is gone (hidden, flag off) or has no rail item (Help)
// falls back to /agent too.
export function landingPath(saved: string | null, items: Pick<ActivityItem, 'key' | 'defaultPath'>[]): string {
    const activity = saved ? items.find(item => item.key === saved) : undefined;
    return activity?.defaultPath && activity.key !== 'scenario' ? activity.defaultPath : '/agent';
}

const OnboardingGate: React.FC = () => {
    const items = useActivityItems();
    return <Navigate to={landingPath(savedActivity(), items)} replace />;
};

export default OnboardingGate;
