// Client-safe constants for UI components - no server-only dependencies
export type ArtStyle =
  | "3d-animated" // Pixar/DreamWorks look
  | "realistic" // photoreal (kid-safe)
  | "watercolor"
  | "manga"
  | "line-art" // coloring

export type Quality = "draft" | "standard" | "ultra"

export const STYLE_OPTIONS = [
  { value: "3d-animated" as const, label: "3D Animated (Pixar-style)" },
  { value: "realistic" as const, label: "Realistic Photography" },
  { value: "watercolor" as const, label: "Watercolor Painting" },
  { value: "manga" as const, label: "Manga/Anime Style" },
  { value: "line-art" as const, label: "Line Art (Coloring Book)" },
]

export const QUALITY_OPTIONS = [
  { value: "draft" as const, label: "Draft (fast)" },
  { value: "standard" as const, label: "Standard" },
  { value: "ultra" as const, label: "Ultra (best for covers)" },
]
