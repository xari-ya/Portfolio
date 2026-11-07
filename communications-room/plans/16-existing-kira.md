# 16 / Existing Kira

Reference: supplied Office & Communications diagram. Implemented in room.js unless an existing shared component is identified below. Coordinates are room-local metres unless marked world.

Build: Extend the existing reversible route at its central junction. Walk through the shared door, turn clear of the desk and reach the pad.

Placement: World route crosses x = 0 at z = -23.6, -26.1 and -27.05, then x = 1.75 before reaching [-0.3, -35].

Reuse and budget: Keep one robot owner and one renderer. Route reversals first return to the common junction; reduced motion parks directly.

Office proportions: The existing instance smoothly scales from 1 to 0.75 on the lab approach, finishing at world z = -23.3 before the office threshold at -25.5, returning to its original size on the way back to the lab junction. The original robot mesh builder is unchanged. Scale-adjusted track clearance and pad contact keep its tracks on the supporting surface.

Verification: Run continuity tests for Skills → office → Skills and mid-route destination changes.
