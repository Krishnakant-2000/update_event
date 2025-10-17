# Accessibility Quick Reference

Quick guide for developers working on the Event Page feature.

## Import Accessibility Styles

Add to your main CSS/SCSS file:
```css
@import './styles/accessibility.css';
```

## Keyboard Shortcuts

| Action | Keys |
|--------|------|
| Navigate tabs | Arrow Left/Right |
| Navigate form fields | Tab / Shift+Tab |
| Activate button/link | Enter or Space |
| Close modal | Escape |
| Navigate autocomplete | Arrow Up/Down |
| Select autocomplete | Enter |
| Skip to content | Tab (from top) |

## Common ARIA Patterns

### Button
```tsx
<button
  onClick={handleClick}
  aria-label="Descriptive action"
  disabled={isDisabled}
>
  Click me
</button>
```

### Form Field
```tsx
<label htmlFor="field-id">Field Label *</label>
<input
  id="field-id"
  type="text"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? 'field-error' : undefined}
/>
{error && (
  <div id="field-error" role="alert" aria-live="assertive">
    {error}
  </div>
)}
```

### Modal
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Modal Title</h2>
  {/* Modal content */}
</div>
```

### Loading State
```tsx
<div role="status" aria-live="polite">
  <span>Loading...</span>
</div>
```

### Error State
```tsx
<div role="alert" aria-live="assertive">
  <p>Error message</p>
</div>
```

### Tabs
```tsx
<div role="tablist" aria-label="Tab group name">
  <button
    role="tab"
    aria-selected={isActive}
    aria-controls="panel-id"
    id="tab-id"
    tabIndex={isActive ? 0 : -1}
  >
    Tab Label
  </button>
</div>

<div
  role="tabpanel"
  id="panel-id"
  aria-labelledby="tab-id"
>
  {/* Panel content */}
</div>
```

## Focus Management Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus order is logical
- [ ] Focus is visible (3px outline)
- [ ] Modal traps focus
- [ ] Focus restored after modal closes
- [ ] Skip link provided

## Color Contrast Requirements

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18pt+) | 3:1 |
| UI components | 3:1 |
| Focus indicators | 3:1 |

## Testing Commands

```bash
# Check with axe DevTools (browser extension)
# Check with Lighthouse
lighthouse http://localhost:3000/events --only-categories=accessibility

# Keyboard test: Use only Tab, Shift+Tab, Enter, Space, Arrow keys, Escape
# Screen reader test: Enable NVDA (Windows) or VoiceOver (Mac)
```

## Common Mistakes to Avoid

❌ **Don't**: Use `<div onClick>` without role and keyboard support
✅ **Do**: Use `<button>` or add `role="button"` with keyboard handlers

❌ **Don't**: Use placeholder as label
✅ **Do**: Use proper `<label>` element

❌ **Don't**: Rely on color alone for information
✅ **Do**: Use text, icons, or patterns in addition to color

❌ **Don't**: Disable zoom on mobile
✅ **Do**: Allow pinch-to-zoom

❌ **Don't**: Use `tabIndex` > 0
✅ **Do**: Use natural DOM order or `tabIndex={0}` / `tabIndex={-1}`

## Quick Fixes

### Make div clickable
```tsx
// Before
<div onClick={handleClick}>Click me</div>

// After
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>
```

### Add focus trap to modal
```tsx
useEffect(() => {
  if (!isOpen) return;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusable || focusable.length === 0) return;
    
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
    
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', handleTab);
  return () => document.removeEventListener('keydown', handleTab);
}, [isOpen]);
```

## Resources

- Full docs: `src/docs/ACCESSIBILITY.md`
- Testing checklist: `src/docs/ACCESSIBILITY_CHECKLIST.md`
- Implementation summary: `.kiro/specs/event-page/accessibility-implementation-summary.md`

## Support

For questions or issues:
1. Check the full accessibility documentation
2. Review the implementation summary
3. Test with the accessibility checklist
4. Consult WCAG 2.1 guidelines
