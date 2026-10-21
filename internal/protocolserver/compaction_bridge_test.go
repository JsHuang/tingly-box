package protocolserver

import (
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"

	"github.com/openai/openai-go/v3/responses"
	"github.com/stretchr/testify/require"
	"github.com/tidwall/gjson"
	"github.com/tingly-dev/tingly-box/internal/protocol"
	"github.com/tingly-dev/tingly-box/internal/typ"
)

func parseCompactionParams(t *testing.T, body string) *responses.ResponseNewParams {
	t.Helper()
	var p responses.ResponseNewParams
	require.NoError(t, json.Unmarshal([]byte(body), &p))
	return &p
}

func TestTBCompactionEnvelopeBoundaries(t *testing.T) {
	for _, payload := range []string{
		"tingly-box:summary:v2:abc", tbCompactionPrefix + "!", tbCompactionPrefix,
		tbCompactionPrefix + base64.RawURLEncoding.EncodeToString([]byte{255}),
		tbCompactionPrefix + base64.RawURLEncoding.EncodeToString([]byte("  ")),
		tbCompactionPrefix + strings.Repeat("a", base64.RawURLEncoding.EncodedLen(maxCompactionSummaryBytes)+1),
	} {
		raw, _ := json.Marshal(map[string]any{"input": []any{map[string]any{"type": "compaction", "encrypted_content": payload}}})
		p := parseCompactionParams(t, string(raw))
		_, err := expandTBCompactions(p)
		require.Error(t, err)
	}
	p := parseCompactionParams(t, `{"input":[{"type":"compaction","encrypted_content":"opaque-native-cipher"}]}`)
	original, _ := json.Marshal(p)
	expanded, err := expandTBCompactions(p)
	require.NoError(t, err)
	require.Same(t, p, expanded)
	after, _ := json.Marshal(p)
	require.Equal(t, string(original), string(after))
	encoded := tbCompactionPrefix + base64.RawURLEncoding.EncodeToString([]byte("Keep auth.go edits"))
	p = parseCompactionParams(t, `{"input":[{"type":"message","role":"user","content":"retained"},{"type":"compaction","encrypted_content":"`+encoded+`"},{"type":"message","role":"user","content":"continue"}]}`)
	expanded, err = expandTBCompactions(p)
	require.NoError(t, err)
	after, _ = json.Marshal(expanded)
	require.Equal(t, "retained", gjson.GetBytes(after, "input.0.content").String())
	require.Equal(t, "user", gjson.GetBytes(after, "input.1.role").String())
	require.Contains(t, gjson.GetBytes(after, "input.1.content").String(), "Keep auth.go edits")
	require.Equal(t, "continue", gjson.GetBytes(after, "input.2.content").String())
	require.Equal(t, encoded, p.Input.OfInputItemList[1].OfCompaction.EncryptedContent)
}

func TestSummaryRequestHistoryBoundaries(t *testing.T) {
	for _, body := range []string{
		`{"input":[{"type":"compaction_trigger"}]}`,
		`{"input":[{"type":"compaction_trigger"},{"type":"message","role":"user","content":"after"}]}`,
		`{"input":[{"type":"compaction_trigger"},{"type":"compaction_trigger"}]}`,
		`{"input":[{"type":"compaction","encrypted_content":"native"},{"type":"compaction_trigger"}]}`,
		`{"previous_response_id":"resp_hidden","input":[{"type":"message","role":"user","content":"a"},{"type":"compaction_trigger"}]}`,
		`{"conversation":"conv_hidden","input":[{"type":"message","role":"user","content":"a"},{"type":"compaction_trigger"}]}`,
	} {
		_, err := summaryRequest(parseCompactionParams(t, body))
		require.Error(t, err, body)
	}
	p := parseCompactionParams(t, `{"model":"alias","instructions":"retain constraint","input":[{"type":"reasoning","summary":[{"type":"summary_text","text":"visible reasoning"}],"encrypted_content":"secret-opaque"},{"type":"message","role":"user","content":[{"type":"input_text","text":"useful goal"},{"type":"input_image","image_url":"data:image/png;base64,AA=="}]},{"type":"compaction_trigger"}]}`)
	result, err := summaryRequest(p)
	require.NoError(t, err)
	raw, err := json.Marshal(result)
	require.NoError(t, err)
	require.Contains(t, string(raw), "useful goal")
	require.Contains(t, string(raw), "visible reasoning")
	require.Contains(t, string(raw), "retain constraint")
	require.NotContains(t, string(raw), "secret-opaque")
	require.NotContains(t, string(raw), "base64,AA==")
	require.NotContains(t, string(raw), "compaction_trigger")
	require.Empty(t, result.Tools)
}

func TestSummaryCompactionNeverInstallsFailedOutput(t *testing.T) {
	for _, tc := range []struct {
		name   string
		status int
		body   string
		want   int
	}{
		{"valid", 200, `{"id":"chatcmpl_1","choices":[{"finish_reason":"stop","message":{"role":"assistant","content":"Preserve auth.go changes"}}]}`, 200},
		{"upstream_protection", 502, `{"error":{"message":"response protection is unavailable","type":"internal_error"}}`, 502},
		{"upstream_429", 429, `{"error":{"message":"quota","type":"rate_limit_error"}}`, 429},
		{"empty", 200, `{"id":"chatcmpl_1","choices":[{"finish_reason":"stop","message":{"role":"assistant","content":""}}]}`, 502},
		{"truncated", 200, `{"id":"chatcmpl_1","choices":[{"finish_reason":"length","message":{"role":"assistant","content":"partial summary"}}]}`, 502},
		{"tools", 200, `{"id":"chatcmpl_1","choices":[{"finish_reason":"tool_calls","message":{"role":"assistant","tool_calls":[{"id":"call_1","type":"function","function":{"name":"danger","arguments":"{}"}}]}}]}`, 502},
	} {
		t.Run(tc.name, func(t *testing.T) {
			var calls atomic.Int32
			upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				calls.Add(1)
				require.Equal(t, "/v1/chat/completions", r.URL.Path)
				raw, _ := io.ReadAll(r.Body)
				require.False(t, gjson.GetBytes(raw, "stream").Bool())
				require.Empty(t, gjson.GetBytes(raw, "tools").Array())
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(tc.status)
				_, _ = io.WriteString(w, tc.body)
			}))
			defer upstream.Close()
			router := newDualProviderRouter(t, upstream.URL, protocol.APIStyleOpenAI, typ.ScenarioOpenAI, "compact-model", "native-model")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, httptest.NewRequest(http.MethodPost, "/tingly/openai/v1/responses", strings.NewReader(`{"model":"compact-model","stream":true,"input":[{"type":"message","role":"user","content":"history"},{"type":"compaction_trigger"}]}`)))
			require.Equal(t, tc.want, w.Code, w.Body.String())
			if tc.want == 200 {
				require.Contains(t, w.Body.String(), "response.output_item.done")
				require.Contains(t, w.Body.String(), "response.completed")
				require.Contains(t, w.Body.String(), tbCompactionPrefix)
				require.Equal(t, "summary-v1", w.Header().Get("X-Tingly-Compaction"))
				require.Equal(t, "text/event-stream", w.Header().Get("Content-Type"))
			} else {
				require.NotContains(t, w.Body.String(), "response.completed")
				require.NotContains(t, w.Body.String(), tbCompactionPrefix)
			}
			require.Equal(t, int32(1), calls.Load())
		})
	}
}
