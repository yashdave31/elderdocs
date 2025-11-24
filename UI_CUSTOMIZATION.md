# ElderDocs UI Customization Guide

## Overview

ElderDocs allows you to customize the visual appearance of your API documentation through a simple YAML configuration file (`elderdocs.yml`). You can customize fonts, colors, and button styles to match your brand.

## Configuration File Location

Create a `elderdocs.yml` file in your Rails application root directory:

```bash
# In your Rails app root
touch elderdocs.yml
```

## UI Customization Options

### Fonts

Customize the typography used throughout the documentation:

```yaml
ui:
  font_heading: 'Syne'        # Font for headings, buttons, and UI elements
  font_body: 'IBM Plex Sans' # Font for body text and content
```

**Available Fonts:**
- `Syne` - Modern, geometric sans-serif (default heading)
- `IBM Plex Sans` - Clean, readable sans-serif (default body)
- `Inter` - Versatile, professional sans-serif
- `Space Grotesk` - Contemporary, friendly sans-serif
- `Oswald` - Bold, condensed sans-serif
- `Fira Code` - Monospace font (great for code)
- `Roboto` - Google's versatile sans-serif
- `Open Sans` - Humanist sans-serif

**Note:** Fonts are automatically loaded from Google Fonts. Make sure you have an internet connection for custom fonts to load.

### Colors

Customize the color scheme:

```yaml
ui:
  colors:
    primary: '#f8d447'      # Primary accent color (buttons, highlights)
    secondary: '#000000'    # Secondary color (text, borders)
    background: '#ffffff'   # Page background color
    surface: '#ffffff'      # Panel/Card background color
```

**Color Usage:**
- `primary`: Used for buttons, badges, highlights, and accent elements
- `secondary`: Used for text, borders, and secondary UI elements
- `background`: Main page background color
- `surface`: Background for cards, panels, and content containers

**Color Format:** Use hex color codes (e.g., `#f8d447`, `#000000`, `#ffffff`)

### Corner Radius

Control the roundness of UI elements:

```yaml
ui:
  corner_radius: '0px'  # Sharp corners (default)
```

**Examples:**
- `'0px'` - Sharp corners (default, modern look)
- `'4px'` - Slightly rounded
- `'8px'` - Moderately rounded
- `'12px'` - Very rounded
- `'99px'` - Pill-shaped (fully rounded)

## Complete Example

Here's a complete `elderdocs.yml` example with all UI customization options:

```yaml
# Mount path
mount_path: /docs

# API Configuration
api_server: https://api.example.com
api_servers:
  - url: https://api-sandbox.example.com
    description: Sandbox Environment
  - url: https://api.example.com
    description: Production Environment

# Authentication
auth_types:
  - bearer
  - api_key
  - basic
  - oauth2

# UI Customization
ui:
  # Typography
  font_heading: 'Oswald'
  font_body: 'Roboto'
  
  # Colors
  colors:
    primary: '#3b82f6'      # Blue accent
    secondary: '#1e293b'    # Dark slate text
    background: '#f8fafc'   # Light gray background
    surface: '#ffffff'      # White panels
  
  # Styling
  corner_radius: '8px'      # Rounded corners
```

## Applying Changes

After updating `elderdocs.yml`:

1. **Rebuild the documentation:**
   ```bash
   bundle exec elderdocs deploy
   ```

2. **Restart your Rails server** (if running):
   ```bash
   # Stop the server (Ctrl+C) and restart
   bundle exec rails server
   ```

3. **Refresh your browser** to see the changes

## Default Theme

If you don't specify UI customization, ElderDocs uses:

- **Fonts:** Syne (heading), IBM Plex Sans (body)
- **Colors:** Bright Yellow (#f8d447) and Black (#000000) on White (#ffffff)
- **Corners:** Sharp (0px radius)

## Tips

1. **Contrast:** Ensure sufficient contrast between text (`secondary`) and backgrounds (`background`, `surface`) for readability
2. **Brand Colors:** Use your brand's primary color for the `primary` color
3. **Font Pairing:** Choose complementary fonts - one for headings, one for body text
4. **Testing:** Test your color scheme in both light and dark environments
5. **Accessibility:** Ensure text colors meet WCAG contrast guidelines

## Troubleshooting

**Fonts not loading?**
- Check your internet connection (fonts load from Google Fonts)
- Verify the font name is spelled correctly
- Check browser console for font loading errors

**Colors not applying?**
- Ensure hex color codes start with `#`
- Run `bundle exec elderdocs deploy` after changes
- Clear browser cache and refresh

**Changes not visible?**
- Make sure you've rebuilt with `bundle exec elderdocs deploy`
- Restart your Rails server
- Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows/Linux)

