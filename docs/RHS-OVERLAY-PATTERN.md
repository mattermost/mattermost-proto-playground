# RHS overlay pattern

Use `RightSidebar` from `@mattermost/compass-proto` as the primary panel. It accepts `header`, `children` (body), and `footer` slots, and has shadow, border, and layout built in.

For a secondary panel that slides in over the primary (e.g. a thread over a playbook), give the shared wrapper `position: relative` and the secondary panel `position: absolute`. Animation and stacking are the prototype's concern.

## Motion

Right-hand panels enter like a sidebar, not a growing column: the panel appears at its fixed width and its content slides in 16px from the right while fading in (`translateX(16px)` → `0`, opacity `0` → `1`) over `var(--duration-quick)` with `var(--ease-entrance)`. Close reverses it with `var(--ease-exit)` before unmount (`useExitAnimation`). Respect `prefers-reduced-motion`. Reference: the `rhs-enter` keyframes in the outbound-calls prototype. Define the keyframes in your own module; do not import across prototypes.
