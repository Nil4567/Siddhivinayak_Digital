# Google Sheets Database Integration

## Overview
This directory contains a simple, API-free solution for using Google Sheets as a database for your Siddhivinayak_Digital project. No authentication keys or complex API setup required!

## How It Works

### Architecture
1. **Google Sheet** - Create your data in Google Sheets
2. **Export as CSV** - Download from Google Sheets
3. **Convert to JSON** - Use free tool or script
4. **Store as data.json** - Commit to repository
5. **Load in JavaScript** - Use `db.js` to query data

## Setup Instructions

### Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new sheet and add your data
3. Example columns: `id`, `name`, `description`, `status`, etc.

### Step 2: Export Data
1. In Google Sheets, go to **File → Download → CSV (.csv)**
2. Save the file locally

### Step 3: Convert CSV to JSON
**Option A: Online Converter**
- Visit [csvjson.com](https://csvjson.com)
- Paste your CSV content
- Copy the JSON output
- Paste into `database/data.json`

**Option B: Python Script**
```python
import csv
import json

with open('your_file.csv', 'r') as csvfile:
    reader = csv.DictReader(csvfile)
    data = list(reader)

with open('data.json', 'w') as jsonfile:
    json.dump({'data': data}, jsonfile, indent=2)
```

### Step 4: Update data.json
Replace the sample data in `database/data.json` with your exported JSON

## File Structure

```
database/
├── data.json          # Your actual data (exported from Google Sheets)
├── db.js             # Database utility functions
├── example.html      # Example usage & testing interface
└── README.md         # This file
```

## Usage

### Basic Usage in HTML/JavaScript

```html
<!-- Include the database library -->
<script src="database/db.js"></script>

<script>
  // Initialize
  const db = new GoogleSheetsDB('./database/data.json');
  
  // Load data
  await db.loadData();
  
  // Get all records
  const allData = db.getAll();
  
  // Find by ID
  const record = db.findById(1);
  
  // Search
  const results = db.search('keyword');
  
  // Filter
  const filtered = db.filter('status', 'active');
  
  // Display as table
  db.displayTable('containerId');
</script>
```

## API Reference

### Methods

#### `loadData()`
Loads data from the JSON file
```javascript
await db.loadData();
```

#### `getAll()`
Returns all records
```javascript
const records = db.getAll();
```

#### `findById(id)`
Find a record by ID
```javascript
const record = db.findById(1);
```

#### `filter(property, value)`
Filter records by property value
```javascript
const active = db.filter('status', 'active');
```

#### `search(keyword)`
Search all records by keyword
```javascript
const results = db.search('john');
```

#### `count()`
Get total number of records
```javascript
const total = db.count();
```

#### `displayTable(containerId, columns)`
Display data as HTML table
```javascript
db.displayTable('tableContainer', ['id', 'name', 'email']);
```

#### `exportCSV()`
Export data as CSV string
```javascript
const csv = db.exportCSV();
```

## Example Use Cases

### 1. Display Product Catalog
```javascript
const db = new GoogleSheetsDB('./database/data.json');
await db.loadData();

const products = db.filter('category', 'electronics');
products.forEach(product => {
  console.log(`${product.name}: $${product.price}`);
});
```

### 2. Search Functionality
```javascript
const searchBox = document.getElementById('search');
searchBox.addEventListener('keyup', (e) => {
  const results = db.search(e.target.value);
  displayResults(results);
});
```

### 3. Dynamic Table
```javascript
await db.loadData();
db.displayTable('results', ['id', 'name', 'status']);
```

## Updating Data

### Workflow
1. Make changes in your Google Sheet
2. Export as CSV
3. Convert CSV to JSON
4. Update `database/data.json` in repository
5. Commit and push changes

### Automated Updates (Optional)
For more frequent updates, consider:
- GitHub Actions to auto-sync from Google Sheets
- Google Apps Script to export automatically
- Manual updates (simplest)

## Limitations

- **Read-only**: This solution is read-only from the web
- **Updates**: To modify data, update the JSON file and re-upload
- **Real-time**: Changes won't reflect immediately (need to update the file)
- **Scale**: Works best with datasets under 10,000 records

## Advantages

✅ No API keys required  
✅ No authentication setup  
✅ Free hosting on GitHub  
✅ Easy to maintain  
✅ Works with static sites  
✅ Simple to share/collaborate  

## Testing

Open `database/example.html` in your browser to:
- View all records
- Search records
- Find by ID
- Export as CSV

## Troubleshooting

### Data not loading
- Check file path is correct
- Ensure data.json is valid JSON
- Check browser console for errors

### CSV to JSON conversion issues
- Ensure no special characters in CSV
- Use quotes for text containing commas
- Validate JSON with [jsonlint.com](https://jsonlint.com)

### CORS errors
- Ensure data.json is in same domain
- Or use GitHub Pages for hosting

## Next Steps

1. ✅ Created database structure
2. 🔄 Update `data.json` with your actual data
3. 📝 Integrate `db.js` into your project files
4. 🧪 Test with `example.html`
5. 🚀 Deploy to your site

## Support

For issues or questions, check:
- [Google Sheets Help](https://support.google.com/sheets)
- [JSON Validation](https://jsonlint.com)
- [CSV to JSON Converter](https://csvjson.com)

---

**Last Updated**: 2026-06-01
