# Persian Dates Extension for Notion

A Chrome extension that automatically converts Gregorian dates to Persian (Jalali) dates in Notion. This extension helps Persian users work with dates in their preferred format while maintaining the original Gregorian dates for reference.

## Features

- 🔄 Automatic conversion of Gregorian dates to Persian dates in Notion
- 📅 Supports both date mentions (@Date) and table property dates
- 🎯 Click-to-scroll functionality to locate dates in the document
- 📋 Floating panel with all converted dates for easy reference
- 🔍 Visual highlighting of dates when navigating to them
- 💾 Persists panel position and state across sessions
- 🎨 Draggable and resizable interface
- 🔄 Toggle between Persian and Gregorian modes

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. After installation, you'll see a calendar icon (🗓️) in your Chrome toolbar
2. Click the icon to open the extension popup
3. Toggle the "Persian Dates" switch to enable/disable date conversion
4. When enabled:
   - All Gregorian dates in your Notion document will be automatically converted to Persian format
   - A floating panel will appear showing all converted dates
   - Click any date in the panel to scroll to its location in the document
   - The original date will be briefly highlighted for easy identification

## Features in Detail

### Floating Panel
- Shows all converted dates in Persian format
- Displays original Gregorian dates for reference
- Can be dragged to any position on the screen
- Can be minimized or hidden
- Persists its position across page reloads

### Date Conversion
- Automatically converts dates in:
  - Date mentions (e.g., @April 26, 2025)
  - Table property dates
  - Date reminders
- Maintains original Gregorian dates for reference
- Updates in real-time as you edit dates

### Navigation
- Click any Persian date in the panel to scroll to its location
- Visual highlight effect helps identify the date in the document
- Smooth scrolling animation for better user experience

## Technical Details

The extension uses:
- `jalaali-js` for accurate date conversions
- Chrome Extension APIs for storage and messaging
- DOM manipulation for real-time updates
- MutationObserver for detecting date changes

## Development

### Prerequisites
- Node.js and npm
- Chrome browser
- Basic understanding of TypeScript and Chrome Extension development

### Building
1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the extension:
   ```bash
   npm run build
   ```
3. Load the extension in Chrome as described in the Installation section

### Project Structure
```
src/
├── content/          # Content script for Notion page
├── popup/           # Extension popup UI
├── background/      # Background script
├── convertTable.ts  # Table date conversion logic
├── convertNotif.ts  # Date mention conversion logic
└── dateUtils.ts     # Date parsing utilities
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [jalaali-js](https://github.com/jalaali/jalaali-js) for Persian date conversion
- Notion for their excellent platform and API 