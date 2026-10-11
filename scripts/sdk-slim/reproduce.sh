#!/usr/bin/env bash
# Reproduces the in-place SDK slimming experiment described in .design/sdk-slim.md:
# trim libs/{openai-go,anthropic-sdk-go,go-genai} in place, then build/vet/test tingly-box.
#
#   scripts/sdk-slim/reproduce.sh [--no-test]
#
# Local only: it edits the three submodule working trees and never commits or pushes.
# Undo with:  for d in openai-go anthropic-sdk-go go-genai; do git -C libs/$d reset -q && git -C libs/$d checkout -q . && git -C libs/$d clean -fdq; done
set -euo pipefail

TB="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TOOLS="$TB/scripts/sdk-slim"
WORK="$(mktemp -d)"
RUN_TESTS=1
[ "${1:-}" = "--no-test" ] && RUN_TESTS=0

log() { printf '\n==> %s\n' "$*"; }

for d in openai-go anthropic-sdk-go go-genai; do
  if [ -z "$(ls -A "$TB/libs/$d" 2>/dev/null)" ]; then
    echo "libs/$d is empty: run 'git submodule update --init --depth 1' first" >&2; exit 1
  fi
  if [ -n "$(git -C "$TB/libs/$d" status --short)" ]; then
    echo "libs/$d is not clean; undo first (see header)" >&2; exit 1
  fi
done

log "build tools into $WORK"
for t in measure apply surfacegen; do
  (cd "$TOOLS/$t" && GOWORK=off go build -o "$WORK/$t" .)
done

lines() { find "$1" -name '*.go' -not -path '*/.git/*' | xargs cat | wc -l; }
echo "before: openai-go $(lines "$TB/libs/openai-go") lines, anthropic-sdk-go $(lines "$TB/libs/anthropic-sdk-go") lines, go-genai $(lines "$TB/libs/go-genai") lines" | tee "$WORK/before.txt"

cd "$TB"

log "A. openai-go + anthropic-sdk-go: roots = every package of tingly-box incl. tests"
"$WORK/measure" "$TB" "$WORK/a.json" 2>&1 | tail -1
for d in openai-go anthropic-sdk-go; do
  (cd "libs/$d" && "$WORK/apply" "$WORK/a.json" "$WORK/a.json.spans" "libs/$d/" \
     && find . -name '*_test.go' -not -path './.git/*' -delete && rm -rf examples)
done
# Packages tingly-box never imports are not analysed; they must go too or they no longer compile.
rm -rf libs/openai-go/bedrock
rm -rf libs/anthropic-sdk-go/{aws,toolrunner,mcp,tools,googlecloud,foundry} \
       libs/anthropic-sdk-go/lib/betafallback libs/anthropic-sdk-go/lib/environments
for d in openai-go anthropic-sdk-go; do (cd "libs/$d" && GOWORK=off go build ./... && GOWORK=off go vet ./...); done

log "B. go-genai: patch out the cloud auth dependency, then trim"
patch -p1 -d libs/go-genai < "$TOOLS/patches/genai-no-auth.patch"
NOSVC=1 SDKPREFIX=google.golang.org/genai "$WORK/measure" "$TB" "$WORK/b.json" 2>&1 | tail -1
(cd libs/go-genai && "$WORK/apply" "$WORK/b.json" "$WORK/b.json.spans" "libs/go-genai/" \
   && find . -name '*_test.go' -not -path './.git/*' -delete && rm -rf examples samples tokenizer)
(cd libs/go-genai && GOWORK=off go build ./... && GOWORK=off go vet ./...)

echo "after:  openai-go $(lines libs/openai-go) lines, anthropic-sdk-go $(lines libs/anthropic-sdk-go) lines, go-genai $(lines libs/go-genai) lines"
echo "genai module deps now: $(cd libs/go-genai && GOWORK=off go list -deps -f '{{if .Module}}{{.Module.Path}}{{end}}' ./... | sort -u | grep -v 'google.golang.org/genai' | tr '\n' ' ')"

log "C. tingly-box build + vet"
go build ./...
go vet ./...

if [ "$RUN_TESTS" = 1 ]; then
  log "D. tingly-box tests (main module + sub modules)"
  go test ./... -count=1
  for m in ai imbot agentboot afk swagger; do (cd "$m" && go test ./... -count=1); done
fi
log "done (work dir: $WORK)"
