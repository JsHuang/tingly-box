#!/usr/bin/env bash
# Builds the "protocol surface only" slim of go-genai into a fresh directory, renamed to a
# new module path. Roots are the 48 genai symbols used by internal/protocol (production code),
# written to surface/surface.go. Result: ~2.8k lines, depends only on cloud.google.com/go.
#
#   scripts/sdk-slim/genai-types-only.sh <out-dir> [module-path]
#
# <out-dir> must not exist. Nothing under libs/ or the tingly-box tree is modified:
# the source is taken from the committed submodule revision (git archive).
# NOTE: tingly-box itself cannot build against this output yet, because internal/client
# uses genai.Client; the output is checked by building it standalone and by pointing
# internal/protocol/... at it (see .design/sdk-slim.md, "types-only variant").
set -euo pipefail

TB="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TOOLS="$TB/scripts/sdk-slim"
OUT="${1:?usage: genai-types-only.sh <out-dir> [module-path]}"
NEW="${2:-github.com/tingly-dev/google-api}"
[ -e "$OUT" ] && { echo "$OUT exists" >&2; exit 1; }
WORK="$(mktemp -d)"

for t in measure apply surfacegen; do (cd "$TOOLS/$t" && GOWORK=off go build -o "$WORK/$t" .); done

mkdir -p "$OUT"
git -C "$TB/libs/go-genai" archive HEAD | tar -x -C "$OUT"
OUT="$(cd "$OUT" && pwd)"

# 1. surface from the protocol layer's real usage (production code only)
(cd "$TB" && "$WORK/surfacegen" "$TB" google.golang.org/genai github.com/tingly-dev/tingly-box/internal/protocol "$WORK/surface.go" google.golang.org/genai)

# 2. new identity
cd "$OUT"
grep -rl 'google.golang.org/genai' --include=*.go --include=go.mod --include=*.md . | xargs sed -i "s#google.golang.org/genai#$NEW#g"
mkdir surface && sed "s#google.golang.org/genai#$NEW#" "$WORK/surface.go" > surface/surface.go
find . -name '*_test.go' -delete; rm -rf examples samples testdata tokenizer .github

# 3. trim: closed-world methods, the surface package is the only root
git init -q . 2>/dev/null || true
CLOSEDMETHODS=1 NOSVC=1 NOTESTS=1 ROOTPREFIX="$NEW/surface" SDKPREFIX="$NEW" PATTERNS=./... \
  "$WORK/measure" "$OUT" "$WORK/out.json" 2>&1 | tail -1
"$WORK/apply" "$WORK/out.json" "$WORK/out.json.spans" "$OUT/"
rm -rf .git
rm -f internal/changefinder/main.go; rmdir internal/changefinder internal 2>/dev/null || true

go build ./... && go vet ./...
echo "lines: $(cat *.go | wc -l)"
echo "deps:  $(go list -deps -f '{{if .Module}}{{.Module.Path}}{{end}}' ./... | sort -u | grep -v "$NEW" | tr '\n' ' ')"
echo "methods dropped by closed-world mode (public API the slim does not have):"
sed "s#$OUT/##" "$WORK/out.json.dropped_methods"
