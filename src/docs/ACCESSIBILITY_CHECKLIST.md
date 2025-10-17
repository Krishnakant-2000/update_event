# Accessibility Testing Checklist

Use this checklist to verify accessibility compliance for the Event Page feature.

## Keyboard Navigation

### Event Tabs
- [ ] Tab key moves focus to first tab
- [ ] Arrow Right moves to next tab
- [ ] Arrow Left moves to previous tab
- [ ] Arrow keys wrap around (last to first, first to last)
- [ ] Enter/Space activates focused tab
- [ ] Active tab has `tabIndex={0}`, others have `tabIndex={-1}`
- [ ] Focus indicator is clearly visible

### Event Cards
- [ ] Tab key moves between event cards
- [ ] Enter key opens event details
- [ ] Space key opens event details
- [ ] Focus indicator is clearly visible
- [ ] Cards are in logical tab order

### Create Event Button
- [ ] Tab key reaches the button
- [ ] Enter/Space activates the button
- [ ] Disabled state is clearly indicated
- [ ] Tooltip appears on hover/focus

### Create Event Form Modal
- [ ] Focus moves to close button when modal opens
- [ ] Tab key cycles through form fields
- [ ] Shift+Tab cycles backwards
- [ ] Tab from last element returns to first
- [ ] Escape key closes modal
- [ ] Focus returns to trigger button on close
- [ ] Cannot tab outside modal while open

### Form Fields
- [ ] Tab key moves through all fields in order
- [ ] Enter submits form (when on submit button)
- [ ] Escape closes modal from any field
- [ ] Date pickers are keyboard accessible
- [ ] Dropdown menus work with arrow keys

### Location Autocomplete
- [ ] Arrow Down moves to first suggestion
- [ ] Arrow Up/Down navigates suggestions
- [ ] Enter selects highlighted suggestion
- [ ] Escape closes suggestions
- [ ] Tab moves to next field (closes suggestions)

### Video Upload
- [ ] Tab reaches upload button
- [ ] Enter/Space opens file dialog
- [ ] Tab reaches remove button when file selected
- [ ] Enter/Space removes file

## Screen Reader Testing

### Page Structure
- [ ] Page title is announced
- [ ] Skip link is announced and functional
- [ ] Main landmark is identified
- [ ] Heading hierarchy is logical (h1 → h2 → h3)

### Event Tabs
- [ ] Tab list role is announced
- [ ] Number of tabs is announced
- [ ] Current tab position is announced (e.g., "1 of 3")
- [ ] Tab selection state is announced
- [ ] Tab panel content is associated with tab

### Event List
- [ ] List role is announced
- [ ] Number of items is announced
- [ ] Loading state is announced
- [ ] Empty state message is announced
- [ ] Error messages are announced immediately

### Event Cards
- [ ] Card is announced as button
- [ ] Event title is announced
- [ ] Sport, location, and date are announced
- [ ] Official badge is announced when present
- [ ] Participant count is announced when present

### Create Event Form
- [ ] Modal opening is announced
- [ ] Modal title is announced
- [ ] Form role is identified
- [ ] All labels are announced with fields
- [ ] Required fields are indicated
- [ ] Field instructions are announced
- [ ] Character count is announced
- [ ] Validation errors are announced immediately
- [ ] Submit button state is announced

### Location Input
- [ ] Autocomplete behavior is announced
- [ ] Number of suggestions is announced
- [ ] Selected suggestion is announced
- [ ] Autocomplete errors are announced (graceful degradation)

### Video Upload
- [ ] Upload button purpose is announced
- [ ] File selection is announced
- [ ] Upload progress is announced
- [ ] File name and size are announced
- [ ] Remove button is announced

## Visual Testing

### Focus Indicators
- [ ] All interactive elements have visible focus
- [ ] Focus outline is at least 3px wide
- [ ] Focus outline has sufficient contrast (3:1)
- [ ] Focus outline has 2px offset
- [ ] Focus is visible on all backgrounds
- [ ] No focus on mouse click (only keyboard)

### Color Contrast
- [ ] Page title: contrast ratio ≥ 4.5:1
- [ ] Body text: contrast ratio ≥ 4.5:1
- [ ] Button text: contrast ratio ≥ 4.5:1
- [ ] Link text: contrast ratio ≥ 4.5:1
- [ ] Error messages: contrast ratio ≥ 4.5:1
- [ ] Warning messages: contrast ratio ≥ 4.5:1
- [ ] Placeholder text: contrast ratio ≥ 4.5:1
- [ ] Disabled text: contrast ratio ≥ 3:1
- [ ] Focus indicators: contrast ratio ≥ 3:1

### Text Sizing
- [ ] Text is readable at 200% zoom
- [ ] No horizontal scrolling at 200% zoom
- [ ] Layout doesn't break at 200% zoom
- [ ] All content is accessible at 200% zoom

### Touch Targets
- [ ] All buttons are at least 44x44px
- [ ] All links are at least 44x44px
- [ ] Tabs are at least 44px tall
- [ ] Form fields are at least 44px tall
- [ ] Adequate spacing between targets

## Form Validation

### Error Handling
- [ ] Errors are announced immediately
- [ ] Errors are associated with fields
- [ ] Error messages are descriptive
- [ ] Multiple errors are all announced
- [ ] Errors persist until corrected
- [ ] Success is announced after submission

### Field Validation
- [ ] Required fields are marked
- [ ] Required state is announced
- [ ] Invalid state is announced
- [ ] Error messages are specific
- [ ] Character count is announced
- [ ] File size errors are clear
- [ ] Date validation errors are clear

## Responsive Design

### Mobile Testing
- [ ] All features work on touch devices
- [ ] Touch targets are adequate size
- [ ] Pinch zoom is not disabled
- [ ] Orientation changes work correctly
- [ ] Modal is usable on small screens

### Tablet Testing
- [ ] Layout adapts appropriately
- [ ] Touch and keyboard both work
- [ ] All features are accessible

## Browser Compatibility

### Chrome
- [ ] Keyboard navigation works
- [ ] Screen reader (NVDA) works
- [ ] Focus indicators visible
- [ ] All features functional

### Firefox
- [ ] Keyboard navigation works
- [ ] Screen reader (NVDA) works
- [ ] Focus indicators visible
- [ ] All features functional

### Safari
- [ ] Keyboard navigation works
- [ ] Screen reader (VoiceOver) works
- [ ] Focus indicators visible
- [ ] All features functional

### Edge
- [ ] Keyboard navigation works
- [ ] Screen reader (Narrator) works
- [ ] Focus indicators visible
- [ ] All features functional

## Automated Testing

### axe DevTools
- [ ] No critical issues
- [ ] No serious issues
- [ ] Moderate issues addressed or documented
- [ ] Minor issues addressed or documented

### Lighthouse
- [ ] Accessibility score ≥ 90
- [ ] All critical issues resolved
- [ ] Best practices followed

### WAVE
- [ ] No errors
- [ ] Alerts reviewed and addressed
- [ ] Contrast issues resolved
- [ ] ARIA usage validated

## Special Features

### Skip Link
- [ ] Appears on first Tab press
- [ ] Moves focus to main content
- [ ] Visually clear and styled
- [ ] Works in all browsers

### Focus Trap
- [ ] Focus stays in modal
- [ ] Tab cycles through modal elements
- [ ] Shift+Tab cycles backwards
- [ ] Escape closes modal
- [ ] Focus restored on close

### Live Regions
- [ ] Loading states announced
- [ ] Error states announced
- [ ] Success states announced
- [ ] Updates are polite (not intrusive)
- [ ] Critical updates are assertive

## Reduced Motion

### Animation Testing
- [ ] Animations respect prefers-reduced-motion
- [ ] Transitions are minimal or removed
- [ ] No motion sickness triggers
- [ ] Core functionality still works

## High Contrast Mode

### Windows High Contrast
- [ ] All text is visible
- [ ] All borders are visible
- [ ] Focus indicators are visible
- [ ] Icons are visible or have text alternatives

## Dark Mode

### Color Scheme
- [ ] Dark mode colors have sufficient contrast
- [ ] Focus indicators are visible
- [ ] Error messages are readable
- [ ] All states are distinguishable

## Documentation

- [ ] Accessibility features are documented
- [ ] Testing procedures are documented
- [ ] Known issues are documented
- [ ] Maintenance guidelines are provided

## Sign-off

- [ ] All critical issues resolved
- [ ] All serious issues resolved
- [ ] Moderate issues addressed or documented
- [ ] Testing completed by: _______________
- [ ] Date: _______________
- [ ] WCAG Level: A / AA / AAA (circle one)

## Notes

Use this section to document any issues found, workarounds implemented, or areas needing future improvement:

---

**Testing Tools Used:**
- [ ] Keyboard only
- [ ] NVDA (Windows)
- [ ] VoiceOver (Mac)
- [ ] Narrator (Windows)
- [ ] JAWS (Windows)
- [ ] axe DevTools
- [ ] Lighthouse
- [ ] WAVE
- [ ] Color contrast analyzer

**Browsers Tested:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Devices Tested:**
- [ ] Desktop
- [ ] Laptop
- [ ] Tablet
- [ ] Mobile phone
