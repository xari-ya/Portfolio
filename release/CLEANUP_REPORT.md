# Cleanup report

Recovery and baseline protection preceded cleanup. No original work was permanently destroyed, no legacy history was rewritten, and no external publication occurred.

## Original inventory

| Measurement | Original |
|---|---:|
| Entire working directory, including Git and ignored files | 3,413,966,371 bytes (3.414 GB), 3,966 files |
| Git-tracked working files | 507,080,977 bytes, 1,198 files |
| Untracked/ignored files excluding Git metadata | 2,567,120,227 bytes |
| Existing Git metadata | 339,765,167 bytes |
| Verification directory | 1,375,848,005 bytes |
| Character assets and editing intermediates | 1,049,247,693 bytes |
| Other supplied assets | 286,381,721 bytes |
| Mobile audit evidence | 164,574,306 bytes |
| Engineer assets | 86,868,102 bytes |

Largest non-Git files included a 268,435,584-byte UV-position cache, 204,148,833-byte supplied car OBJ, 62,061,979-byte supplied car ZIP, and multiple 26–49 MB Blender revisions. PNG files totaled 1,540,308,530 bytes; `.blend` 309,076,133; `.npy` 271,343,920; OBJ 221,327,610; GLB 216,133,468. Full file, directory, extension, tracked/untracked and hash inventories remain external.

## Protection and quarantine

The recovery directory is `../site-recovery/20261107-160423/`, outside this repository and deployment. All 3,966 original file hashes were verified after copying; five representative files were restored successfully. The original `.git` is preserved in the snapshot and remains in `../site/.git` to preserve the existing linked mobile worktree; its integrity check passed with one ordinary dangling blob retained. Original HEAD was `bcaeba7` on `feat/career-lab-reference-room`, with existing uncommitted work preserved.

The curated exact application baseline is protected in the external `publication-baseline/` repository by tag `baseline/approved-2026-11-07` at `f9d108ba59fa21f7a2e4564c11bae1f5218da154`. Its pre-sanitization provenance is recovery material, not upload history. A supplemental complete baseline tag, `baseline/approved-complete-2026-11-07` at `a04480c34652f88049135fb8444a80f1bb7f4474`, restores the original CSS fallback image omitted from the initial curated baseline; the full original snapshot always contained it. The clean publication history in `site-publication` starts separately at `5e8dd21`; no legacy history was destroyed to obtain a small repository.

There are **3,421 original file paths no longer in the working project**, totaling **3,031,580,143 bytes**, excluding relocated Git metadata and installed dependencies. Their originals remain in the snapshot; removed source/artifact copies are quarantined. The first candidate manifest covers 3,255 paths, including 2,981 verification/historical fixtures, 56 editing/model intermediates, 30 historical root documents, 82 one-off preparation scripts and 106 uncertain/source files. Subsequently 114 historical browser scripts were archived because they depend on old commits or absent capture fixtures, and replaced/rejected texture outputs were quarantined after successful production checks. The original `obsidian_preview.png` was restored when independent review identified its fallback dependency.

A live development-server log changed after the snapshot. Its current version was preserved separately before replacing the known project server; the initial version remains in the full snapshot. No unrelated process or personal project was changed.

Every candidate has a path/category/size/reason/evidence/recovery/verification record in the external `cleanup-candidates.json`; supplemental manifests cover optimized assets and historical scripts. Uncertain material was preserved in quarantine rather than judged disposable. See [recovery instructions](LOCAL_RECOVERY.md).

## Duplicate findings and retained assets

Content hashing found **192 exact-duplicate groups** in the original directory, including repeated screenshot snapshots, source copies and three byte-identical 5,675,428-byte character GLBs. Legacy copies remain recoverable externally. The intentional desktop/mobile engineer exports differ in topology/texture resolution and are retained unchanged. No visually similar but different technical model was replaced.

For active runtime assets, one duplicate compact-phone material entry now references the existing canonical texture; its material-index mapping was checked against content hashes. Forty-two phone material entries use smaller GPU-pixel-verified outputs; a mismatching conversion and two larger conversions were rejected. Eleven other images use lossless WebP. Original images stay in recovery, including rejected candidates. Fifteen superseded/inactive project previews remain in source for maintenance but are excluded from deployment; the seven active studies use their canonical `-model.jpg` images.

All approved CSS, visible body content, main workshop/Kira geometry, engineer GLBs, handset binaries, room assets, CV and required fallback assets are retained. Text line endings were normalized to UTF-8/LF for byte-reproducible Windows/Linux checkouts. Asset moves did not change the custom HTML/CSS/JavaScript/WebGL architecture.

## Result

The source tree is approximately **36.5 MB**, versus 507.1 MB of originally tracked files. The local working directory, including the clean Git history, installed test dependencies and a generated deployment copy, is approximately **137 MB**, versus 3.414 GB initially (about **96% smaller**). Generated output and dependencies are ignored, not repository contents. Exact final measurements are recorded with the final external release evidence; small report/Git bookkeeping changes do not affect the deployed artifact.

The initial conservative equivalent static deployment set was **39,598,574 bytes / 217 files**; no prior production build artifact existed. The final deployment is **34,138,240 bytes / 209 files**, approximately **13.8% smaller**, including newly supplied credits, license notices and 404/metadata. This comparison is deployment storage, not a claim that a visitor originally downloaded the entire 3.4 GB development folder. Network/load measurements are reported separately.

No ordinary Git blob or deployed file exceeds 5,036,103 bytes. The complete intended upload history passes the 100 MiB GitHub object audit; output passes the 25 MiB/file and 20,000-file Cloudflare Pages Free checks.

The canonical release is the separate `site-publication` checkout. The original `site` retains its legacy Git metadata and cleaned working files, so its Git status intentionally describes cleanup relative to the legacy branch; it is not the repository to publish. Its sibling mobile worktree was not edited, and its Git connection/HEAD were verified after restoring the original metadata location. No source was merged from that worktree.

The original `site` directory is approximately 429 MB after cleanup, including its intentionally retained 340 MB legacy Git metadata. The canonical `site-publication` directory is approximately 137 MB including current Git, dependencies and generated output. Neither external snapshot nor quarantine is counted as publication size.
