# Quick Start Guide: Google Sheets Database

## 5-Minute Setup

### 1️⃣ Create Your Google Sheet
```
Go to sheets.google.com → New spreadsheet
Add columns: id | name | description | status
Add your data rows
```

### 2️⃣ Export as CSV
```
File → Download → CSV (.csv)
```

### 3️⃣ Convert to JSON
```
Visit csvjson.com
Paste CSV → Click convert → Copy JSON
```

### 4️⃣ Update data.json
```
Replace content in database/data.json with your JSON
Commit and push
```

### 5️⃣ Use in Your Code
```html
<script src="database/db.js"></script>
<script>
  const db = new GoogleSheetsDB('./database/data.json');
  await db.loadData();
  db.displayTable('tableId');
</script>
```

## Common Tasks

### Display a Table
```javascript
db.displayTable('containerId');
```

### Search Data
```javascript
const results = db.search('keyword');
```

### Get Specific Record
```javascript
const record = db.findById(1);
```

### Filter by Property
```javascript
const active = db.filter('status', 'active');
```

### Export as CSV
```javascript
const csv = db.exportCSV();
```

## Files

- `data.json` - Your database (CSV exported as JSON)
- `db.js` - Query engine
- `example.html` - Testing interface

## Example

Open `example.html` in browser to see all features in action!

---

**Need help?** See `README.md` for detailed documentation
