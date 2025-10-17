# Accessibility Implementation Guide

This document outlines the accessibility features implemented in the Event Page feature and provides guidelines for maintaining and testing accessibility.

## Overview

The Event Page has been built with WCAG 2.1 Level AA compliance in mind, ensuring that all users, including those using assistive technologies, can effectively use the application.

## Implemented Features

### 1. ARIA Labels and Roles

#### Event Tabs
- `role="tablist"` on the tab container
- `role="tab"` on each tab button
- `aria-selected` indicates the active tab
- `aria-controls` links tabs to their panels
- `aria-label="Event categories"` describes the tab group

#### Event List
- `role="list"` on the event container
- `role="listitem"` on each event wrapper
- `role="status"` for loading and empty states
- `role="alert"` for error messages with `aria-live="assertive"`

#### Event Cards
- `role="button"` for clickable cards
- `aria-label` provides descriptive text for each event
- `tabIndex={0}` makes cards keyboard accessible

#### Create Event Form
- `role="dialog"` on the modal
- `aria-modal="true"` indicates modal behavior
- `aria-labelledby` links to the modal title
- `aria-required="true"` on required fields
- `aria-invalid` indicates validation errors
- `aria-describedby` links fields to error messages
- `aria-busy` indicates loading state on submit button

#### Location Input
- `aria-autocomplete="list"` for autocomplete behavior
- `aria-controls` links to suggestions list
- `aria-expanded` indicates dropdown state
- `aria-activedescendant` tracks keyboard selection
- `role="listbox"` on suggestions container
- `role="option"` on each suggestion

#### Video Upload
- `role="progressbar"` for upload progress
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for progress values
- `aria-label` on file input and buttons

### 2. Keyboard Navigation

#### Tab Navigation
- **Arrow Left/Right**: Navigate between tabs
- **Tab**: Move to next focusable element
- **Enter/Space**: Activate focused element

#### Event Cards
- **Tab**: Navigate between cards
- **Enter/Space**: Open event details

#### Create Event Form
- **Tab**: Navigate through form fields
- **Shift+Tab**: Navigate backwards
- **Escape**: Close modal
- Focus trap keeps keyboard users within modal

#### Location Autocomplete
- **Arrow Up/Down**: Navigate suggestions
- **Enter**: Select highlighted suggestion
- **Escape**: Close suggestions dropdown

### 3. Focus Management

#### Modal Focus Trap
- Focus moves to close button when modal opens
- Tab key cycles through modal elements only
- Shift+Tab cycles backwards
- Focus returns to trigger element when modal closes
- Previous focus is restored on close

#### Focus Visible Styles
- Clear 3px blue outline on keyboard focus
- 2px offset for better visibility
- High contrast mode support with thicker outlines
- No outline on mouse click (`:focus-visible`)

#### Skip Link
- "Skip to main content" link appears on Tab
- Allows keyboard users to bypass navigation
- Positioned at top of page
- High contrast styling

### 4. ARIA Live Regions

#### Validation Errors
- `role="alert"` with `aria-live="assertive"`
- Immediate announcement of errors
- Each field has unique error ID
- Linked via `aria-describedby`

#### Loading States
- `role="status"` with `aria-live="polite"`
- Non-intrusive loading announcements
- Clear loading text for screen readers

#### Character Count
- `aria-live="polite"` for description counter
- Updates announced as user types
- Warning states clearly indicated

### 5. Color Contrast

All text and interactive elements meet WCAG AA standards:

#### Text Contrast Ratios
- Normal text: minimum 4.5:1
- Large text: minimum 3:1
- Error messages: #C41E3A on #FFF5F5 (high contrast)
- Warning messages: #8B6914 on #FFF9E6 (high contrast)

#### Interactive Elements
- Buttons: sufficient contrast in all states
- Links: #1565C0 (meets contrast requirements)
- Focus indicators: #4A90E2 with 3px width

#### Dark Mode Support
- Automatic color adjustments
- Maintains contrast ratios
- Tested with system preferences

## Testing Guidelines

### Manual Testing

#### Keyboard Navigation Test
1. Use only Tab, Shift+Tab, Arrow keys, Enter, Space, Escape
2. Verify all interactive elements are reachable
3. Ensure focus is always visible
4. Test modal focus trap
5. Verify skip link functionality

#### Screen Reader Test
1. Test with NVDA (Windows) or VoiceOver (Mac)
2. Verify all content is announced
3. Check form field labels and errors
4. Test tab navigation announcements
5. Verify loading and error states

#### Color Contrast Test
1. Use browser DevTools Accessibility panel
2. Check all text against backgrounds
3. Test in high contrast mode
4. Verify dark mode contrast

### Automated Testing

#### Tools to Use
- axe DevTools browser extension
- Lighthouse accessibility audit
- WAVE browser extension
- Pa11y CI for continuous testing

#### Test Commands
```bash
# Run accessibility tests (if configured)
npm run test:a11y

# Lighthouse audit
lighthouse http://localhost:3000/events --only-categories=accessibility
```

### Browser Testing

Test in multiple browsers with assistive technologies:
- Chrome + NVDA (Windows)
- Firefox + NVDA (Windows)
- Safari + VoiceOver (Mac)
- Edge + Narrator (Windows)

## Common Issues and Solutions

### Issue: Focus Lost After Modal Close
**Solution**: Store previous active element and restore focus on close

### Issue: Screen Reader Not Announcing Errors
**Solution**: Use `role="alert"` with `aria-live="assertive"`

### Issue: Tab Key Escapes Modal
**Solution**: Implement focus trap with Tab/Shift+Tab handling

### Issue: Keyboard Users Can't Navigate Tabs
**Solution**: Add Arrow key navigation and proper ARIA attributes

## Maintenance Checklist

When adding new features:
- [ ] Add appropriate ARIA labels and roles
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Verify color contrast
- [ ] Add focus visible styles
- [ ] Test focus management
- [ ] Update this documentation

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Compliance Status

✅ WCAG 2.1 Level A - Compliant
✅ WCAG 2.1 Level AA - Compliant
⚠️ WCAG 2.1 Level AAA - Partial (enhanced contrast in some areas)

Last Updated: 2025-10-17
