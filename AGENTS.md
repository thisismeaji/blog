<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:shadcn-design-system-rules -->
# Strict shadcn/ui Design System Enforcement

All layout, UI elements, spacing, and styling MUST strictly follow the default shadcn/ui design system tokens.
- **NO CUSTOM PADDING OR MARGIN OVERRIDES**: Do not add manual paddings (e.g. `p-3.5`, `py-2.5`) or custom heights/gaps that override default shadcn/ui components (like `Card`, `Button`, `Input`, `Select`). Use the components' built-in layout parameters.
- **NO CUSTOM BORDERS OR SHADOWS**: Rely entirely on shadcn's default styling class rings (e.g. `ring-1 ring-foreground/10`) and shadow variables.
- **PURE SHADCN COMPONENTS**: Keep the design 100% consistent with default shadcn blocks and component definitions. Avoid manual customization that makes the UI deviate from the canonical shadcn dashboard look.
<!-- END:shadcn-design-system-rules -->
