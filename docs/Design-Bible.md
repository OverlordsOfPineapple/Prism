# Prism Design Bible

## Product vision

Prism is a premium entertainment discovery platform. Movies are the first medium; television, books, comics, and future media types must fit the same coherent product rather than becoming separate applications.

## Experience principles

- Content and artwork lead; interface chrome remains restrained.
- Discovery should guide rather than overwhelm.
- Complexity is revealed progressively and hidden when not needed.
- Luxury comes from restraint, hierarchy, spacing, and polish—not feature density.
- Every screen should feel calm, cinematic, modern, confident, and deliberate.
- Motion supports comprehension or delight; it must never become noisy or gimmicky.
- New work must remain coherent when Prism expands beyond movies.

## Visual language

- Dark neutral foundation and high contrast.
- Large, high-quality artwork.
- Confident typography with clear scale-based hierarchy.
- Generous whitespace and deliberate alignment.
- Restrained accents that do not compete with posters.
- Subtle depth, glass, glow, and shadow only where they improve focus.

## Interaction language

- Essential navigation stays obvious.
- Advanced filters and secondary controls use progressive disclosure.
- Search and discovery are distinct: search finds known titles; discovery helps people decide.
- Animation favours fades, soft scaling, gentle movement, smooth easing, and cinematic timing.
- Avoid bounce, visual clutter, gratuitous effects, and dashboard-like density.

## Engineering principles

- Modular, readable, maintainable, scalable, production-quality code.
- Architecture before feature volume.
- Performance is a product feature: fast startup, lazy loading, minimal layout shift, responsive interaction.
- Public deployments must keep private API credentials server-side.
- Every commit leaves Prism in a working state.

## Acceptance test

A proposed change should improve discovery or usability, fit Prism’s identity, be implementable cleanly, remain performant, and still make sense across future media types.

The standing design-review question is: **Would we be proud to put this on the homepage of prism.media?**
