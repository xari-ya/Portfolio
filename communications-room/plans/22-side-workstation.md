# 22 / Side workstation

Reference: supplied Office & Communications diagram. Implemented in room.js unless an existing shared component is identified below. Coordinates are room-local metres unless marked world.

Build: Build a small console and PCB monitor with the existing screen painter. Clone the existing chair's shared geometry into this placement.

Placement: Console group [-5.3, 0, 0.92], yaw +90 degrees, top y = 0.8175 m; chair near [-4.72,0,0.99]. Raised shelves carry simple chassis props and warm light strips. Keep the shared entrance corridor clear at z = -0.5.

Reuse and budget: Reuse createWorkshopLaptopScreen and the existing chair primitives/materials. No independent animation loop.

Verification: Check chair orientation, desk height, visible monitor and clear central aisle.
