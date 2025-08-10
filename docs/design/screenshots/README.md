# Visual Regression Testing Screenshots

This directory contains baseline screenshots for visual regression testing of the Zeropoint Protocol website.

## Directory Structure

```
screenshots/
├── baseline/          # Baseline screenshots for comparison
│   ├── desktop/       # Desktop screenshots
│   │   ├── home.png
│   │   ├── technology.png
│   │   ├── status.png
│   │   └── navigation.png
│   └── mobile/        # Mobile screenshots
│       ├── home.png
│       ├── technology.png
│       ├── status.png
│       └── navigation.png
├── current/           # Current screenshots (generated during testing)
└── diff/              # Difference images (generated during comparison)
```

## Screenshot Specifications

### Desktop Screenshots
- **Resolution**: 1920x1080 (Full HD)
- **Browser**: Chrome 90+
- **Format**: PNG
- **Quality**: High quality, lossless

### Mobile Screenshots
- **Resolution**: 375x667 (iPhone SE)
- **Browser**: Chrome DevTools mobile emulation
- **Format**: PNG
- **Quality**: High quality, lossless

## Pages to Capture

### Required Screenshots
1. **Home Page** (`/`)
   - Hero section with glitch-art cityscape
   - Feature cards with animations
   - Navigation menu states

2. **Technology Page** (`/technology`)
   - Page content and layout
   - Typography and spacing
   - Component styling

3. **Status Page** (`/status`)
   - Real-time status display
   - Data visualization
   - Update timestamps

4. **Navigation States**
   - Default navigation
   - Mobile menu open
   - Dropdown menus (if any)

## Testing Commands

### Capture Baseline Screenshots
```bash
# Install visual regression testing tools
npm install --save-dev puppeteer reg-cli

# Capture baseline screenshots
npx reg-cli capture baseline screenshots/baseline/

# Or capture specific pages
npx reg-cli capture baseline screenshots/baseline/ --urls https://zeropointprotocol.ai
```

### Compare with Current State
```bash
# Capture current screenshots
npx reg-cli capture current screenshots/current/

# Compare baseline with current
npx reg-cli compare screenshots/baseline/ screenshots/current/ screenshots/diff/

# Generate HTML report
npx reg-cli report screenshots/diff/ screenshots/report.html
```

### Automated Testing
```bash
# Run visual regression tests
npm run test:visual

# Update baseline (after intentional changes)
npm run test:visual:update
```

## Visual Elements to Test

### Color Palette
- **Deep Black**: #1A1A1A (primary background)
- **Anthracite**: #333333 (secondary background)
- **Off-White**: #F5F5F0 (primary text)
- **Electric Blue**: #00C4FF (accent color)
- **Neon Purple**: #BF00FF (highlight color)

### Typography
- **Font Family**: Montserrat (sans-serif)
- **Headings**: All-caps, bold
- **Body Text**: Regular weight, proper spacing
- **Line Height**: 1.6 for readability

### Components
- **Buttons**: Oversized rectangles with hover glows
- **Cards**: Deep-black backgrounds with neon accents
- **Navigation**: Transparent/deep-black with high contrast
- **Animations**: Smooth fade-ins and micro-interactions

## Quality Assurance

### Before Committing Screenshots
- [ ] All required pages captured
- [ ] Screenshots are clear and high quality
- [ ] No sensitive information visible
- [ ] Consistent lighting and contrast
- [ ] Proper file naming convention

### Visual Regression Checklist
- [ ] No unintended layout changes
- [ ] Colors remain consistent
- [ ] Typography displays correctly
- [ ] Animations work as expected
- [ ] Responsive design functions properly

## Troubleshooting

### Common Issues
1. **Screenshots not matching**: Check browser version and viewport size
2. **Color differences**: Ensure consistent color profiles and settings
3. **Layout shifts**: Verify stable content and no dynamic elements
4. **Performance issues**: Optimize screenshot capture process

### Debugging Commands
```bash
# Check screenshot dimensions
file screenshots/baseline/desktop/home.png

# Compare specific images
compare screenshots/baseline/desktop/home.png screenshots/current/desktop/home.png screenshots/diff/home-diff.png

# Generate detailed report
npx reg-cli report screenshots/diff/ --reportDir screenshots/reports/
```

## Maintenance

### Regular Updates
- Update baseline screenshots after intentional design changes
- Review and clean up old screenshots monthly
- Update testing procedures as needed
- Document any new visual elements

### Version Control
- Commit baseline screenshots to version control
- Tag releases with corresponding screenshot versions
- Maintain changelog for visual changes

---

**Last Updated**: December 29, 2024  
**Next Review**: January 2025