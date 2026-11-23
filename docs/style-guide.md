# ViewFinder style guide

The MVP uses a restrained, nature-inspired palette and small, reusable interface patterns. Keep controls quiet so the map and places remain the focus.

## Tokens

| Token | Value     | Use                                   |
| ----- | --------- | ------------------------------------- |
| Paper | `#f7f7f3` | App canvas and quiet surfaces         |
| Ink   | `#202520` | Primary text                          |
| Muted | `#777e74` | Secondary labels                      |
| Line  | `#e8e9e2` | Dividers and field borders            |
| Green | `#355d4a` | Primary actions and selected map pins |
| Sage  | `#e7ece4` | Selected and supporting surfaces      |

Use Georgia for large editorial headings and Arial/Helvetica for interface text. Prefer 4–5px corner radii, thin borders, visible keyboard focus rings, and reduced motion where requested.

## Patterns in the MVP

- **Primary button:** solid green, white text, concise label.
- **Text field:** visible label, subtle border, explicit focus treatment.
- **Place row:** numbered location, title, and neighborhood; selection is indicated by a green-tinted background and marker.
- **Map marker:** green numbered pin; selected pin uses a light surface and stronger contrast.
- **Place card:** one image, neighborhood, title, and a short description.
- **Preview notice:** state clearly when a form or feature is not connected to a backend.

## States

Shared loading, empty, and error states live in `src/components/ui/`. All three accept `className`.

**Spinner:** use for waits with no content to show yet; always give it a specific `label`.

```tsx
<Spinner size="sm" label="Loading viewpoints" />
```

**EmptyState:** use when a list or page has nothing to show; offer a next step through `action` when one exists. Use `titleAs="h1"` only for full-page states.

```tsx
<EmptyState icon={SearchX} title="No viewpoints match" description="Try a wider area." />
```

**InlineError:** use for recoverable failures next to the content that failed; pass `onRetry` when retrying can help.

```tsx
<InlineError message="Couldn't load photos." onRetry={refetch} />
```

The shared native button and input wrappers live in `src/components/ui/`; keep their APIs small and build feature-specific appearance through class names rather than introducing a second design system.

The `ApplicationShell` in `src/components/application-shell.tsx` provides a shared brand/header-controls slot and main content area for route-level experiences.
