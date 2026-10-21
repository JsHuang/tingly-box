package protocoltest

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/tidwall/gjson"
	"github.com/tingly-dev/tingly-box/internal/protocol"
)

// Send native compaction controls through the complete authenticated gateway,
// rather than proving only that a particular SDK struct can marshal them.
func TestNativeCompactionControls(t *testing.T) {
	for _, target := range []protocol.APIType{protocol.TypeOpenAIResponses, protocol.TypeAnthropicBeta} {
		for _, streaming := range []bool{false, true} {
			t.Run(fmt.Sprintf("%s/stream=%t", target, streaming), func(t *testing.T) {
				env := NewTestEnv(t)
				defer env.Close()
				s := TextScenario()
				s.Name = "native_compaction"
				env.SetupRoute(target, target, s)
				model := env.routeModels[routeKey(target, target, s.Name)]
				body := map[string]any{"model": model, "stream": streaming}
				var path string
				var field string
				var want string
				if target == protocol.TypeOpenAIResponses {
					path = "/tingly/openai/v1/responses"
					body["input"] = []any{map[string]any{"type": "message", "role": "user", "content": "Continue"}, map[string]any{"type": "compaction", "encrypted_content": "opaque-window"}, map[string]any{"type": "compaction_trigger"}}
					body["context_management"] = []any{map[string]any{"type": "compaction", "compact_threshold": 10000}}
					field, want = "context_management.0.type", "compaction"
				} else {
					path = "/tingly/anthropic/v1/messages?beta=true"
					body["max_tokens"] = 128
					body["messages"] = []any{map[string]any{"role": "user", "content": "Continue"}}
					body["context_management"] = map[string]any{"edits": []any{map[string]any{"type": "compact_20260112", "pause_after_compaction": true}}}
					field, want = "context_management.edits.0.type", "compact_20260112"
				}
				raw, err := json.Marshal(body)
				require.NoError(t, err)
				status, result := sendRawWithHeaders(t, env, path, raw, map[string]string{"anthropic-beta": "compact-2026-01-12"})
				require.Equal(t, 200, status, result)
				endpoint := EndpointResponses
				if target == protocol.TypeAnthropicBeta {
					endpoint = EndpointAnthropic
				}
				capture := env.UpstreamLastRequest(endpoint)
				require.NotNil(t, capture)
				require.Equal(t, want, gjson.GetBytes(capture.Body, field).String())
				if target == protocol.TypeOpenAIResponses {
					require.Equal(t, "opaque-window", gjson.GetBytes(capture.Body, "input.1.encrypted_content").String())
					require.Equal(t, "compaction_trigger", gjson.GetBytes(capture.Body, "input.2.type").String())
				}
			})
		}
	}
}

func TestResponsesCompactionCannotDowngradeToChat(t *testing.T) {
	env := NewTestEnv(t)
	defer env.Close()
	s := TextScenario()
	s.Name = "compaction_no_downgrade"
	env.SetupRoute(protocol.TypeOpenAIResponses, protocol.TypeOpenAIChat, s)
	model := env.routeModels[routeKey(protocol.TypeOpenAIResponses, protocol.TypeOpenAIChat, s.Name)]
	for _, fields := range []string{

		`"input":[{"type":"compaction","encrypted_content":"opaque"}]`,
		`"input":"hello","context_management":[{"type":"compaction","compact_threshold":10000}]`,
	} {
		status, body := sendRaw(t, env, "/tingly/openai/v1/responses", []byte(`{"model":"`+model+`",`+fields+`}`))
		require.Equal(t, 501, status, body)
		require.Equal(t, "unsupported_operation", gjson.Get(body, "error.code").String())
	}
	require.Zero(t, env.virtual.CallCount())
}
