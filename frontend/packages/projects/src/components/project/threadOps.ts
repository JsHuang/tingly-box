// What a thread page does to its thread, over either set of routes: a
// project's thread, or a folder session (a thread with no project). The
// panel works with one of these so it never branches on the URL itself.
import { api, unwrap, type Attachment } from '../../client';
import type { SendMode } from '../Composer';

export interface ThreadOps {
    /** mode is only set when the user chose how to send while a turn runs; the default joins the turn. */
    send: (content: string, attachments?: Attachment[], mode?: SendMode) => Promise<unknown>;
    /** Takes back a message held for after the running turn. */
    unqueue: (id: string) => Promise<unknown>;
    respond: (requestId: string, allow: boolean, remember: boolean, answer?: string, answers?: Record<string, string>) => Promise<unknown>;
    stop: () => Promise<unknown>;
    /** Resolve a thread; archive a session. */
    finish: () => Promise<unknown>;
    reopen: () => Promise<unknown>;
    /** Release a session to a terminal: the command that resumes it. Threads have none. */
    handoff: () => Promise<string>;
}

export function projectThreadOps(projectId: string, tid: string): ThreadOps {
    const path = { params: { path: { id: projectId, tid } } };
    return {
        send: (content, attachments, mode) => unwrap(api.POST('/api/v1/projects/{id}/threads/{tid}/messages', { ...path, body: { content, attachments: attachments?.map((a) => a.path), mode } })),
        unqueue: (qid) => unwrap(api.DELETE('/api/v1/projects/{id}/threads/{tid}/queue/{qid}', { params: { path: { id: projectId, tid, qid } } })),
        respond: (request_id, allow, remember, answer, answers) => unwrap(api.POST('/api/v1/projects/{id}/threads/{tid}/respond', {
            ...path, body: { request_id, allow, scope: remember ? 'thread' : 'once', answer: answer || undefined, answers: answers && Object.keys(answers).length ? answers : undefined },
        })),
        stop: () => unwrap(api.POST('/api/v1/projects/{id}/threads/{tid}/stop', path)),
        finish: () => unwrap(api.POST('/api/v1/projects/{id}/threads/{tid}/resolve', path)),
        reopen: () => unwrap(api.POST('/api/v1/projects/{id}/threads/{tid}/reopen', path)),
        handoff: () => Promise.reject(new Error('a project thread is continued in its worktree')),
    };
}

export function sessionOps(sid: string): ThreadOps {
    const path = { params: { path: { sid } } };
    return {
        send: (content, attachments, mode) => unwrap(api.POST('/api/v1/projects/sessions/{sid}/messages', { ...path, body: { content, attachments: attachments?.map((a) => a.path), mode } })),
        unqueue: (qid) => unwrap(api.DELETE('/api/v1/projects/sessions/{sid}/queue/{qid}', { params: { path: { sid, qid } } })),
        respond: (request_id, allow, remember, answer, answers) => unwrap(api.POST('/api/v1/projects/sessions/{sid}/respond', {
            ...path, body: { request_id, allow, scope: remember ? 'thread' : 'once', answer: answer || undefined, answers: answers && Object.keys(answers).length ? answers : undefined },
        })),
        stop: () => unwrap(api.POST('/api/v1/projects/sessions/{sid}/stop', path)),
        finish: () => unwrap(api.POST('/api/v1/projects/sessions/{sid}/archive', path)),
        reopen: () => unwrap(api.POST('/api/v1/projects/sessions/{sid}/reopen', path)),
        handoff: async () => (await unwrap(api.POST('/api/v1/projects/sessions/{sid}/handoff', path))).command,
    };
}
