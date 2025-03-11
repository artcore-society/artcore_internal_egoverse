// Define collision groups as bitmasks using powers of two.
// This ensures each group is represented by a unique bit in binary form,
// making them easily combinable and distinguishable using bitwise operations.
export enum PhysicsCollisionGroup {
	FLOOR = 1, // 0001 - Represents the floor. Interacts with characters and walls.
	WALL = 2, // 0010 - Represents walls. Interacts with characters and the floor.
	CHARACTER = 4 // 0100 - Represents characters. Uses 4 instead of 3 to avoid overlap with other groups.
}

// Explanation:
// Using powers of two (1, 2, 4, 8, etc.) ensures non-overlapping groups.
// Each group occupies a unique bit in a binary number:
// - FLOOR (1) = 0001
// - WALL (2) = 0010
// - CHARACTER (4) = 0100
//
// If CHARACTER was set to 3 (0011), it would overlap with both FLOOR (1) and WALL (2).
// This overlap would cause unintended collisions when filtering using collisionFilterMask.
