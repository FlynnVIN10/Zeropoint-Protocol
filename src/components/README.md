# Enhanced Navigation Components

This directory contains enhanced navigation components designed for the Zeropoint Protocol public website.

## Components

### EnhancedNavigation
The main navigation component with three variants:
- `header` - Horizontal navigation bar (default)
- `sidebar` - Vertical sidebar navigation
- `mobile` - Mobile-optimized navigation

### EnhancedLayout
A wrapper around Docusaurus Layout that automatically includes the enhanced navigation.

### PhasePageLayout
A specialized layout for phase pages that includes navigation and proper spacing.

## Usage

### For Main Pages (TSX/TS)
```tsx
import EnhancedLayout from '../components/EnhancedLayout';

export default function MyPage() {
  return (
    <EnhancedLayout
      title="Page Title"
      description="Page description">
      {/* Your page content */}
    </EnhancedLayout>
  );
}
```

### For Phase Pages (MDX)
```mdx
---
title: 'Phase Title'
description: 'Phase description'
---

import PhasePageLayout from '@site/src/components/PhasePageLayout';

<PhasePageLayout>

# Your Phase Content

Content goes here...

</PhasePageLayout>
```

### Direct Navigation Usage
```tsx
import EnhancedNavigation from '../components/EnhancedNavigation';

// Header variant (default)
<EnhancedNavigation variant="header" />

// Sidebar variant
<EnhancedNavigation variant="sidebar" />

// Mobile variant
<EnhancedNavigation variant="mobile" />
```

## Features

- **Responsive Design**: Adapts to all screen sizes
- **Corporate Aesthetics**: Professional, sophisticated design
- **Multiple Variants**: Header, sidebar, and mobile layouts
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Performance**: Optimized animations and transitions
- **Customizable**: Extensive styling and behavior options

## Styling

All navigation styles are defined in `src/css/custom.css` using CSS custom properties for consistent theming across the platform.
