import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"
import { fontSize, borderRadius, boxShadow } from "@/theme/tokens"

// Teach tailwind-merge about custom design tokens so e.g. `text-caption`
// is treated as a font size (not a color) and isn't dropped by `cn()`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: Object.keys(fontSize) }],
      rounded: [{ rounded: Object.keys(borderRadius) }],
      shadow: [{ shadow: Object.keys(boxShadow) }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
