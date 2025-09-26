as of Sep 26, 2025 , this is not working. Any help is well appreciated
for docs visit - [docs.harneetlang.com](docs.harneetlang.com)

# Harneet Language Support for Helix

This folder contains Helix configuration, a Tree-sitter grammar scaffold, and a theme for the Harneet programming language (`.ha`).

## Contents

- `languages.toml` — Helix language configuration and grammar source mapping
- `themes/harneet.toml` — A dark theme tailored for Harneet syntax groups
- `tree-sitter-harneet/` — Tree-sitter grammar scaffold
  - `grammar.js` — Grammar rules (WIP but covers most core language features)
  - `queries/highlights.scm` — Highlight queries mapping grammar nodes to scopes
  - `package.json` — Build/test scripts for Tree-sitter
- `install.sh` — Helper script to build the grammar and install config/theme into your Helix runtime or user config

## Prerequisites

- Node.js / npm (for `tree-sitter-cli`)
- Helix editor installed locally
- Optional: write access to Helix runtime overlay for easy installation

Install Tree-sitter CLI globally:

```bash
npm i -g tree-sitter-cli
```

## Build the Tree-sitter Grammar

```bash
cd /Users/gjanjua/sandbox/personal/harneet_org/helix/tree-sitter-harneet
# Generate parser sources
tree-sitter generate
# (Optional) run tests later when corpus is added
# tree-sitter test
```

## Install Language Config and Theme

You can use the helper script, which installs to your Helix runtime if present,
falling back to your user config at `~/.config/helix`.

```bash
cd /Users/gjanjua/sandbox/personal/harneet_org/helix
chmod +x install.sh
./install.sh  # optional arg: path to helix runtime, defaults to /Users/gjanjua/sandbox/personal/helix/runtime
```

What the script does:

- Copies `languages.toml` to either the Helix runtime or `~/.config/helix/languages.toml`
- Copies `themes/harneet.toml` into the appropriate themes directory
- Runs `tree-sitter generate` in `tree-sitter-harneet/` if `tree-sitter` is available

## Manual Installation (Alternative)

If you prefer to set things up manually:

- Language config
  - Copy `languages.toml` to one of:
    - `~/.config/helix/languages.toml`
    - Project-local: `.helix/languages.toml` in your Harneet project
    - Helix runtime: `/Users/gjanjua/sandbox/personal/helix/runtime/languages.toml`
- Theme
  - Copy `themes/harneet.toml` into:
    - `~/.config/helix/themes/harneet.toml`
    - or your Helix runtime themes directory
- Grammar
  - Leave `[[grammar]]` path in `languages.toml` as `./tree-sitter-harneet` if rel-path works from where `languages.toml` is installed
  - Otherwise, change the grammar `source.path` to an absolute path to the `tree-sitter-harneet` directory

## Enable the Theme

In your Helix config file `~/.config/helix/config.toml`, set:

```toml
theme = "harneet"
```

## Verify

- Open any `.ha` file in Helix
- You should see:
  - Keywords, strings, numbers, booleans, None/null
  - Functions and parameters (including anonymous and arrow functions)
  - Struct type declarations
  - Arrays, maps, typed arrays
  - Calls, member/index access, assignments, operators

## Notes & Roadmap

- Current grammar is functional and covers most language constructs. We can extend it further to cover:
  - Method declarations, tuple returns, multiple assignment
  - More operator precedence rules and pattern matching edge cases
  - A test corpus (Tree-sitter) to prevent regressions (`corpus/`)
- If you run into any parsing or highlighting issues, please share the `.ha` snippet and we’ll augment the grammar/queries.

## Updating

When making grammar changes:

```bash
cd /Users/gjanjua/sandbox/personal/harneet_org/helix/tree-sitter-harneet
# Edit grammar.js or queries/highlights.scm
tree-sitter generate
# Re-run install if languages.toml or theme changed
cd ..
./install.sh
```

Happy coding in Harneet with Helix!
