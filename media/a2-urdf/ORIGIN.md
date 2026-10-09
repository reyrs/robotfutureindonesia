# A2 model — origin & licenses

This directory contains the AgiBot A2 humanoid description used to build
`public/models/a2.glb` for robotshow.id.

## Provenance

| Piece | Source | License |
| --- | --- | --- |
| `agibot_a2_description/` (meshes, xacro) | [fiveages-sim/robot_descriptions](https://github.com/fiveages-sim/robot_descriptions), path `humanoid/Agibot/agibot_a2_description` | **MPL-2.0** (see `agibot_a2_description/LICENSE`) — file-level copyleft; commercial use allowed |
| Repository root | same repo, root `LICENSE` | **Apache-2.0** (see `LICENSE-Apache-2.0-repo.txt`) |
| Upstream origin (credited by the package README) | [YanjieZe/GMR](https://github.com/YanjieZe/GMR) | **MIT** (see `LICENSE-GMR-MIT.txt`) |
| `A2.urdf` | expanded from `agibot_a2_description/xacro/robot.xacro` with the ROS `xacro` tool; mesh paths rewritten to be relative | derived from the above |

`package.xml` inside the package declares `BSD` and describes "Genie G1";
both fields are stale upstream — the shipped `LICENSE` file (MPL-2.0) is
authoritative.

## Compliance

- The unmodified package files are shipped verbatim under
  `agibot_a2_description/` so MPL-2.0 source obligations are satisfied.
- `A2.urdf` is a mechanical expansion of the package's xacro with path
  rewrites only (no geometry or kinematic edits).
- Site code (rig, viewer, materials handling) is original work for
  robotshow.id and is not covered by the package license.
- The UI surfaces this credit next to the A2 model, mirroring the X2
  credit next to the X2 model.

Sourced 2026-10-09.
