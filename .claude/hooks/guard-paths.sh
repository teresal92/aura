#!/usr/bin/env bash
# PreToolUse guard for Edit|Write: enforces the "don't edit" rules in AGENTS.md.
set -euo pipefail

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
file="$(jq -r '.tool_input.file_path // empty')"
[ -n "$file" ] || exit 0
rel="${file#"$root"/}"

decide() {
  jq -n --arg d "$1" --arg r "$2" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: $d, permissionDecisionReason: $r}}'
  exit 0
}

case "$rel" in
  src/components/ui/*)
    decide ask "src/components/ui is vendored shadcn/ui; edit only to fix a breaking bug. Customize via className, globals.css tokens, or a wrapper in src/components." ;;
  pnpm-lock.yaml)
    decide deny "pnpm-lock.yaml is generated; change dependencies with pnpm instead." ;;
  .env.example) ;;
  .env* | */.env*)
    decide deny "Don't edit .env files; they hold secrets. Update .env.example and tell the user what to set." ;;
esac

# Vendored skills come from skills-lock.json; update them with `npx skills update -p -y`.
if [ -f "$root/skills-lock.json" ]; then
  while read -r skill; do
    case "$rel" in
      .agents/skills/"$skill"/* | .claude/skills/"$skill"/*)
        decide deny "$skill is a vendored skill; update it with \`npx skills update -p -y\`. Put Aura-specific guidance in Aura's own skills." ;;
    esac
  done < <(jq -r '.skills | keys[]' "$root/skills-lock.json")
fi
