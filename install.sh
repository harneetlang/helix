#!/usr/bin/env bash
set -euo pipefail

# Install Harneet language support and theme into Helix runtime or user config.
# Usage: ./install.sh [HELIX_RUNTIME_DIR]
# If HELIX_RUNTIME_DIR is not provided, tries to use /Users/gjanjua/sandbox/personal/helix/runtime
# Falls back to ~/.config/helix for languages.toml if runtime not found.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}"
GRAMMAR_DIR="${ROOT_DIR}/tree-sitter-harneet"
LANG_FILE="${ROOT_DIR}/languages.toml"
THEME_FILE="${ROOT_DIR}/themes/harneet.toml"

DEFAULT_RUNTIME="/Users/gjanjua/sandbox/personal/helix/runtime"
TARGET_RUNTIME="${1:-$DEFAULT_RUNTIME}"

echo "==> Building Tree-sitter grammar (if tree-sitter-cli is available)"
if command -v tree-sitter >/dev/null 2>&1; then
  (cd "$GRAMMAR_DIR" && tree-sitter generate)
else
  echo "WARN: tree-sitter CLI not found. Skipping grammar generation. Install with: npm i -g tree-sitter-cli"
fi

echo "==> Preparing Helix configuration"
# Install languages.toml
if [ -d "$TARGET_RUNTIME" ]; then
  echo "Using Helix runtime: $TARGET_RUNTIME"
  cp -f "$LANG_FILE" "$TARGET_RUNTIME/languages.toml"
  mkdir -p "$TARGET_RUNTIME/themes"
  cp -f "$THEME_FILE" "$TARGET_RUNTIME/themes/"
  echo "Installed languages.toml and theme to runtime."
else
  echo "Helix runtime not found at $TARGET_RUNTIME"
  echo "Installing user config to ~/.config/helix instead."
  mkdir -p "$HOME/.config/helix"
  cp -f "$LANG_FILE" "$HOME/.config/helix/languages.toml"
  mkdir -p "$HOME/.config/helix/themes"
  cp -f "$THEME_FILE" "$HOME/.config/helix/themes/"
  echo "Installed languages.toml and theme to ~/.config/helix."
fi

echo "==> Done. In Helix, set 'theme = \"harneet\"' in ~/.config/helix/config.toml"
echo "Open a .ha file to verify highlighting."
