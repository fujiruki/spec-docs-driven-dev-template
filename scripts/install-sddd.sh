#!/usr/bin/env sh
set -eu

usage() {
  echo "Usage: $0 PROJECT_PATH [--with-github] [--without-claude] [--overwrite]" >&2
  exit 1
}

[ "$#" -ge 1 ] || usage

project_path=$1
shift
with_github=false
without_claude=false
overwrite=false

while [ "$#" -gt 0 ]; do
  case "$1" in
    --with-github) with_github=true ;;
    --without-claude) without_claude=true ;;
    --overwrite) overwrite=true ;;
    *) usage ;;
  esac
  shift
done

[ -d "$project_path" ] || { echo "Project path does not exist: $project_path" >&2; exit 1; }

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(CDPATH= cd -- "$script_dir/.." && pwd)
template_root="$repo_root/templates"
project_root=$(CDPATH= cd -- "$project_path" && pwd)

copy_item() {
  source_rel=$1
  destination_rel=$2
  source_root=${3:-$template_root}
  source="$source_root/$source_rel"
  destination="$project_root/$destination_rel"

  [ -e "$source" ] || { echo "Template not found: $source" >&2; exit 1; }

  if [ -e "$destination" ]; then
    if [ "$overwrite" = false ]; then
      echo "Skip existing: $destination_rel" >&2
      return
    fi
    rm -rf "$destination"
  fi

  mkdir -p "$(dirname -- "$destination")"
  cp -R "$source" "$destination"
  echo "Installed: $destination_rel"
}

copy_item "SDDD.md" "SDDD.md"
copy_item "AGENTS.md" "AGENTS.md"
copy_item "task.md" "task.md"
copy_item "docs/SPEC.md" "docs/SPEC.md"
copy_item "docs/requests.md" "docs/requests.md"
copy_item "docs/requests_log.md" "docs/requests_log.md"
copy_item "docs/automation.md" "docs/automation.md"
copy_item "docs/collaboration.md" "docs/collaboration.md"
copy_item "docs/spec" "docs/spec"
copy_item "handover" "docs/handover"

# Codex discovers repository skills from .agents/skills. Install each skill
# additively so an existing .agents/skills directory is never replaced.
copy_item ".agents/skills/kaigi" ".agents/skills/kaigi" "$repo_root"
copy_item ".agents/skills/kaigi2" ".agents/skills/kaigi2" "$repo_root"

if [ "$without_claude" = false ]; then
  copy_item "CLAUDE.md" "CLAUDE.md"
  copy_item ".claude" ".claude"
fi

if [ "$with_github" = true ]; then
  copy_item ".github" ".github"
fi

gitignore="$project_root/.gitignore"
if [ ! -f "$gitignore" ]; then
  printf '%s\n' '# SdDD / CodeGraph local derived data' > "$gitignore"
fi
grep -qxF '.sddd/' "$gitignore" || printf '%s\n' '.sddd/' >> "$gitignore"
grep -qxF '.codegraph/' "$gitignore" || printf '%s\n' '.codegraph/' >> "$gitignore"

mkdir -p "$project_root/.sddd"
cat > "$project_root/.sddd/template-source.md" <<EOF
# SdDD template source (local metadata; do not commit)
template_root: $repo_root
installed_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

echo "SdDD installed. Ask the AI to read SDDD.md, then add a request to docs/requests.md or tell it to the AI."
