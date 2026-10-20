import { useCallback, useEffect, useRef, useState } from 'react';
import { api, isFolder, unwrap, type ProjectSummary } from '../client';
import { PROJECTS_CHANGED } from '../host/ProjectsHost';
import { useAllProjectEvents, type ProjectEvent } from './useProjectEvents';

const POLL_MS = 30_000;
const RELOAD_DEBOUNCE_MS = 300;

/** The single list the sidebar groups and the waiting signal counts: every active project, of either type. */
export interface ProjectList {
    /** Every non-archived project and folder; null until the first answer. */
    all: ProjectSummary[] | null;
    /** `type=project`, starred first. */
    projects: ProjectSummary[] | null;
    /** `type=folder`, by name. */
    folders: ProjectSummary[] | null;
    /** How many threads wait on the user, in projects and folders alike. */
    waiting: number;
    reload: () => void;
}

/** Threads waiting on the user across a list of projects. */
export const waitingCount = (list: ProjectSummary[] | null): number => (list ?? []).reduce((n, p) => n + p.threads.waiting, 0);

/**
 * `GET /projects` (projects and folders together), kept fresh by the
 * all-projects event stream, a slow poll, a page reporting a change and the
 * tab coming back. Only the latest answer lands. `onEvent` and `onOpen` pass
 * the stream's events and reconnects on to a page that needs them too.
 */
export function useProjectList(enabled = true, onEvent?: (ev: ProjectEvent) => void, onOpen?: () => void): ProjectList {
    const [all, setAll] = useState<ProjectSummary[] | null>(null);
    const latest = useRef(0);
    const timer = useRef<number | undefined>(undefined);

    const load = useCallback(() => {
        if (document.visibilityState === 'hidden') return;
        const request = ++latest.current;
        unwrap(api.GET('/api/v1/projects'))
            .then((r) => {
                if (request === latest.current) setAll(r.projects);
            })
            .catch(() => {
                // Unreachable: keep the last list.
            });
    }, []);

    // Events come in bursts (a turn writes many): one reload per burst.
    const soon = useCallback(() => {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(load, RELOAD_DEBOUNCE_MS);
    }, [load]);

    useEffect(() => {
        if (!enabled) return;
        load();
        const poll = window.setInterval(load, POLL_MS);
        window.addEventListener(PROJECTS_CHANGED, load);
        document.addEventListener('visibilitychange', load);
        return () => {
            latest.current = -1;
            window.clearInterval(poll);
            window.clearTimeout(timer.current);
            window.removeEventListener(PROJECTS_CHANGED, load);
            document.removeEventListener('visibilitychange', load);
        };
    }, [enabled, load]);

    // A page that also wants the events (the folder page) shares this stream.
    const forward = useRef(onEvent);
    forward.current = onEvent;
    const reopened = useRef(onOpen);
    reopened.current = onOpen;
    useAllProjectEvents((ev) => {
        if (ev.type === 'thread' || ev.type === 'project') soon();
        forward.current?.(ev);
    }, () => {
        load();
        reopened.current?.();
    }, enabled);

    const projects = all && all.filter((p) => !isFolder(p)).sort((a, b) => Number(b.starred) - Number(a.starred));
    const folders = all && all.filter(isFolder).sort((a, b) => (a.name || a.path || '').localeCompare(b.name || b.path || ''));
    return { all, projects, folders, waiting: waitingCount(all), reload: load };
}
