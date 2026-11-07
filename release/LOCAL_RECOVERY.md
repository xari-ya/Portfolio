# Local recovery index

The full protected original is stored **outside this repository**, in the sibling `../site-recovery/20261107-160423/` directory. Do not upload that directory. This relative location avoids embedding private machine/user paths in the publication source.

- `original/`: complete original worktree, including ignored and untracked source artwork, models, experiments, installed dependencies, and `.git`.
- `manifest.json`, `inventory.json`, `VERIFIED.json`: every original file's path, size and SHA-256; directory/extension/duplicate inventories; verification of all 3,966 files / 3,413,966,371 bytes.
- `restore-check/`: five successfully restored representative files, including application source, CV, Git HEAD and the supplied TerraVita GLB.
- `legacy-git/`: original active repository metadata, moved intact after snapshot verification; original branch `feat/career-lab-reference-room`, HEAD `bcaeba7`. No original history was rewritten.
- `publication-baseline/`: curated legitimate application baseline Git repository, protected by tag `baseline/approved-2026-11-07`, commit `f9d108ba59fa21f7a2e4564c11bae1f5218da154`. This baseline contains pre-sanitization provenance; it is local recovery material, not publication history.
- `status.txt`, `working.txt`, `staged.txt`, `history.txt`, `remotes.txt`: original worktree and repository state.
- `quarantine/`: original editing sources, historical test artifacts and scripts, replaced textures, and uncertain material, retained with original relative paths. Nothing was permanently destroyed.
- `cleanup-candidates.json`, `optimized-quarantine.json`, `archived-test-scripts.json`: removal/quarantine reasons, dependency evidence and hashes. Additional late exclusions and restored fallback assets are described in the cleanup report.
- `baseline/`, `production/`, `interactions/`, performance and visual comparison outputs: bulky evidence, deliberately outside production and publication.

To recover the original, copy `original/` into a **new empty directory**, preserve its `.git`, then inspect `git status` and `git log`. Do not overlay newer release work. Follow the external `RESTORE.md`.

For asset editing, restore only the required original relative paths into a separate working copy: `engineer-assets/character/sarith-engineer-rigged.blend`, `character-assets/refined-character/`, `engineer-assets/laptop/final-v4-source/`, `verification/showcase/phone-source/`, `project sources/`, supplied car sources, or the supplied TerraVita model. Their historical preparation tools and provenance are also preserved. Rebuilding the static release does not require those source-only files or Blender/Python.
