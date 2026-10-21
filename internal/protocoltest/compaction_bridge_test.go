package protocoltest

import (
	"encoding/json"
	"fmt"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/tidwall/gjson"
	"github.com/tingly-dev/tingly-box/internal/protocol"
)

func TestCompactionBridgeRoundTrip(t *testing.T) {
	for _, target := range []protocol.APIType{protocol.TypeOpenAIResponses, protocol.TypeOpenAIChat, protocol.TypeAnthropicBeta} {
		for _, streaming := range []bool{false, true} {
			t.Run(fmt.Sprintf("%s/stream=%t", target, streaming), func(t *testing.T) {
				echo := NewEchoServertoolProvider()
				env := NewTestEnv(t, NewTestEnvOptionWithServertoolProviders(echo))
				defer env.Close()
				s := TextScenario()
				s.Name = "bridge_summary"
				env.SetupRoute(protocol.TypeOpenAIResponses, target, s)
				model := env.routeModels[routeKey(protocol.TypeOpenAIResponses, target, s.Name)]
				status, result := sendRaw(t, env, "/tingly/openai/v1/responses", []byte(`{"model":"`+model+`","stream":`+fmt.Sprint(streaming)+`,"instructions":"Keep branch work intact","tools":[{"type":"function","name":"danger","parameters":{"type":"object"}}],"input":[{"type":"message","role":"user","content":"Fix the auth handler"},{"type":"function_call","call_id":"call_1","name":"read_file","arguments":"{}"},{"type":"function_call_output","call_id":"call_1","output":"auth.go is changed"},{"type":"compaction_trigger"}]}`))
				require.Equal(t, 200, status, result)
				var item gjson.Result
				if streaming {
					done := 0
					completed := false
					for _, line := range strings.Split(result, "\n") {
						if !strings.HasPrefix(line, "data: ") {
							continue
						}
						event := gjson.Parse(strings.TrimPrefix(line, "data: "))
						if event.Get("type").String() == "response.output_item.done" {
							done++
							item = event.Get("item")
						}
						if event.Get("type").String() == "response.completed" {
							completed = true
							require.Equal(t, 1, len(event.Get("response.output").Array()))
						}
					}
					require.Equal(t, 1, done)
					require.True(t, completed)
				} else {
					item = gjson.Get(result, "output.0")
				}
				require.Equal(t, "compaction", item.Get("type").String())
				require.True(t, strings.HasPrefix(item.Get("encrypted_content").String(), "tingly-box:summary:v1:"), result)
				endpoint := EndpointResponses
				if target == protocol.TypeOpenAIChat {
					endpoint = EndpointChat
				} else if target == protocol.TypeAnthropicBeta {
					endpoint = EndpointAnthropic
				}
				capture := env.UpstreamLastRequest(endpoint)
				require.NotNil(t, capture)
				require.False(t, gjson.GetBytes(capture.Body, "stream").Bool())
				require.Empty(t, gjson.GetBytes(capture.Body, "tools").Array())
				require.Empty(t, echo.Calls())
				require.Contains(t, string(capture.Body), "auth.go is changed")
				require.Contains(t, string(capture.Body), "Keep branch work intact")

				// Decode through a NEW gateway and a DIFFERENT provider protocol. There
				// is no in-memory state and no TB envelope may reach the new upstream.
				next := NewTestEnv(t)
				defer next.Close()
				other := protocol.TypeOpenAIChat
				if target == other {
					other = protocol.TypeAnthropicBeta
				}
				next.SetupRoute(protocol.TypeOpenAIResponses, other, s)
				nextModel := next.routeModels[routeKey(protocol.TypeOpenAIResponses, other, s.Name)]
				body, err := json.Marshal(map[string]any{"model": nextModel, "input": []any{json.RawMessage(item.Raw), map[string]any{"type": "message", "role": "user", "content": "Continue"}}})
				require.NoError(t, err)
				status, result = sendRaw(t, next, "/tingly/openai/v1/responses", body)
				require.Equal(t, 200, status, result)
				otherEndpoint := EndpointChat
				if other == protocol.TypeAnthropicBeta {
					otherEndpoint = EndpointAnthropic
				}
				replay := next.UpstreamLastRequest(otherEndpoint)
				require.NotNil(t, replay)
				require.NotContains(t, string(replay.Body), "tingly-box:summary:")
				require.NotContains(t, string(replay.Body), "encrypted_content")
				require.Contains(t, string(replay.Body), "Context summary from an earlier conversation")
				require.Contains(t, string(replay.Body), "Continue")

				// A second compaction expands the previous summary before summarizing.
				body, err = json.Marshal(map[string]any{"model": nextModel, "input": []any{json.RawMessage(item.Raw), map[string]any{"type": "compaction_trigger"}}})
				require.NoError(t, err)
				status, result = sendRaw(t, next, "/tingly/openai/v1/responses", body)
				require.Equal(t, 200, status, result)
				require.Equal(t, "compaction", gjson.Get(result, "output.0.type").String())
			})
		}
	}
}

func TestCompactionBridgePreservesNativeCodex(t *testing.T) {
	for _, fails := range []bool{false, true} {
		t.Run(fmt.Sprint(fails), func(t *testing.T) {
			env := NewTestEnv(t)
			defer env.Close()
			s := TextScenario()
			s.Name = "native_v2"
			s.MockResponses[FormatOpenAIResponses] = MockResponseBuilder{Stream: func() []string {
				if fails {
					return []string{`data: {"error":{"message":"response protection is unavailable","type":"internal_error"}}`}
				}
				return []string{
					`data: {"type":"response.created","response":{"id":"resp_native","status":"in_progress","output":[]}}`,
					`data: {"type":"response.output_item.done","output_index":0,"item":{"type":"compaction","id":"cmp_native","encrypted_content":"native-cipher"}}`,
					`data: {"type":"response.completed","response":{"id":"resp_native","status":"completed","output":[{"type":"compaction","id":"cmp_native","encrypted_content":"native-cipher"}],"usage":{"input_tokens":20,"output_tokens":5}}}`,
				}
			}}
			env.SetupCodexAssemblyRoute(protocol.TypeOpenAIResponses, s)
			model := env.routeModels[routeKey(protocol.TypeOpenAIResponses, protocol.TypeOpenAIResponses, s.Name)]
			status, result := sendRaw(t, env, "/tingly/openai/v1/responses", []byte(`{"model":"`+model+`","stream":true,"tools":[{"type":"web_search"}],"input":[{"type":"message","role":"user","content":"Fix auth"},{"type":"compaction_trigger"}]}`))
			if fails {
				require.GreaterOrEqual(t, status, 400, result)
				require.Contains(t, result, "response protection is unavailable")
				require.NotContains(t, result, "response.completed")
			} else {
				require.Equal(t, 200, status, result)
				require.Contains(t, result, "native-cipher")
				require.Contains(t, result, "response.completed")
			}
			capture := env.UpstreamLastRequest(EndpointResponses)
			require.NotNil(t, capture)
			require.True(t, gjson.GetBytes(capture.Body, "stream").Bool())
			require.Equal(t, "compaction_trigger", gjson.GetBytes(capture.Body, "input.1.type").String())
			require.Equal(t, "web_search", gjson.GetBytes(capture.Body, "tools.0.type").String())
			require.NotContains(t, result, "tingly-box:summary:")
		})
	}
}
