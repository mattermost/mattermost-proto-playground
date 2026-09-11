# RHS overlay pattern

Use `RightSidebar` from `@mattermost/compass-proto` as the primary panel. It accepts `header`, `children` (body), and `footer` slots, and has shadow, border, and layout built in.

For a secondary panel that slides in over the primary (e.g. a thread over a playbook), give the shared wrapper `position: relative` and the secondary panel `position: absolute`. Animation and stacking are the prototype's concern.
