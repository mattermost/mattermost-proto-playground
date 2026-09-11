# RHS overlay pattern

When a prototype renders a `RightSidebar` panel alongside a center pane, the wrapper div must carry these styles — the defaults on each property cause clipping or missing shadow:

```scss
.rhs {
  position: relative;
  z-index: 2;          // above center pane
  flex-shrink: 0;      // default flex: 0 1 auto allows shrink below 400px → clips content
  overflow: hidden;    // clips thread overlay slide animation
  box-shadow: var(--elevation-2); // must be on wrapper — overflow: hidden clips child box-shadows
}
```
