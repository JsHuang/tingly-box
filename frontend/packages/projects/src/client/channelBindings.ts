// PLACEHOLDER API for IM channel bindings (TEP #2143, M1).
//
// The backend routes exist only in a parallel PR and `openapi.json` has not
// been regenerated, so these calls are hand-written against the agreed
// contract instead of the generated client. Once the backend is merged and
// `task codegen` has run, replace this module's bodies with `api.GET/PUT/DELETE`
// on '/api/v1/projects/channel-bindings' and take `ChannelBinding` from
// `components['schemas']`. Everything else imports from here only, so that is
// the one place to change.
//
//   GET    /api/v1/projects/channel-bindings        -> { bindings: ChannelBinding[] }
//   PUT    /api/v1/projects/channel-bindings        body { platform, chat_id, project_id } -> ChannelBinding
//   DELETE /api/v1/projects/channel-bindings/:id    -> 204 / {}
import { ApiError, apiFetch } from './index';

/** One IM chat bound to a place. M1 binds to projects only (working folders come in M2). */
export interface ChannelBinding {
    id: string;
    platform: string;
    chat_id: string;
    chat_title: string;
    target_kind: 'project';
    project_id: string;
    created_at: string;
    updated_at: string;
}

/**
 * Where a project message came from when it was written by an IM chat
 * (.design/projects-im.md, "Thread / project_messages"). All optional: a Web
 * message has none. Also a placeholder until codegen adds them to
 * `ProjectMessage`.
 */
export interface MessageSource {
    source?: 'im' | 'web';
    source_platform?: string;
    source_chat_id?: string;
}

const BASE = '/api/v1/projects/channel-bindings';

async function call(path: string, init?: RequestInit): Promise<unknown> {
    const res = await apiFetch(path, {
        ...init,
        headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
    });
    const text = await res.text();
    let body: unknown;
    try {
        body = text ? JSON.parse(text) : undefined;
    } catch {
        body = undefined;
    }
    if (!res.ok) {
        throw new ApiError((body as { error?: string } | undefined)?.error ?? `${res.status} ${res.statusText}`, res.status, body);
    }
    return body;
}

export async function listChannelBindings(): Promise<ChannelBinding[]> {
    const body = await call(BASE);
    const list = Array.isArray(body) ? body : (body as { bindings?: ChannelBinding[] } | undefined)?.bindings;
    return list ?? [];
}

/** Binds a chat to a project; a chat bound elsewhere is moved (one place at a time), old threads stay. */
export async function bindChannel(req: { platform: string; chat_id: string; project_id: string }): Promise<ChannelBinding> {
    return (await call(BASE, { method: 'PUT', body: JSON.stringify(req) })) as ChannelBinding;
}

export async function unbindChannel(id: string): Promise<void> {
    await call(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
