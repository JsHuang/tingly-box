package project

import (
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/tingly-dev/tingly-box/projects/internal/db"
)

// mkProject stores p as a project with its main thread.
func mkProject(t *testing.T, store *db.Store, p *db.Project) *db.Project {
	t.Helper()
	require.NoError(t, store.CreateProjectWithMain(p, &db.Thread{Origin: "user"}, ""))
	return p
}

// mainThread is the id of a project's main thread.
func mainThread(t *testing.T, store *db.Store, projectID string) string {
	t.Helper()
	p, err := store.GetProject(projectID)
	require.NoError(t, err)
	return p.MainThreadID
}

// convo is a project's conversation: its main thread's events.
func convo(t *testing.T, store *db.Store, projectID string) []db.ThreadEvent {
	t.Helper()
	evs, err := store.ListThreadEvents(mainThread(t, store, projectID))
	require.NoError(t, err)
	return evs
}

// startFolder opens the folder as a project and starts a thread in it.
func (f *testFixture) startFolder(folder string, spec FolderThreadSpec) (*db.Thread, error) {
	path, err := CleanFolder(folder)
	if err != nil {
		return nil, err
	}
	p, err := f.store.OpenFolder(path, "")
	if err != nil {
		return nil, err
	}
	spec.ProjectID = p.ID
	return f.threads.StartFolderThread(spec)
}
