# Background Image Setup

## How to Add Your Background Image

1. **Save your background image** in this `public` folder
2. **Rename it to**: `background-image.jpg`
3. **Supported formats**: JPG, PNG, WebP

## Image Requirements

- **Resolution**: At least 1920x1080 (Full HD) for best quality
- **File size**: Keep under 2MB for fast loading
- **Format**: JPG recommended for photos, PNG for graphics with transparency

## Current Setup

The app is configured to use `/background-image.jpg` as the background image.

## Alternative Setup

If you want to use a different filename or path, update the CSS in `src/index.css`:

```css
body {
  background-image: url('/your-image-name.jpg');
  /* ... other properties ... */
}
```

## Troubleshooting

- **Image not showing**: Make sure the image is in the `public` folder
- **Wrong size**: Check that `background-size: cover` is set in CSS
- **Performance**: Optimize large images before adding them
