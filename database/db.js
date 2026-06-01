/**
 * Google Sheets Database Integration
 * No API required - uses JSON data exported from Google Sheets
 */

class GoogleSheetsDB {
  constructor(dataFilePath = './database/data.json') {
    this.dataFilePath = dataFilePath;
    this.data = [];
  }

  /**
   * Load data from JSON file
   */
  async loadData() {
    try {
      const response = await fetch(this.dataFilePath);
      const fileData = await response.json();
      this.data = fileData.data || [];
      console.log(`Loaded ${this.data.length} records from database`);
      return this.data;
    } catch (error) {
      console.error('Error loading data:', error);
      return [];
    }
  }

  /**
   * Get all records
   */
  getAll() {
    return this.data;
  }

  /**
   * Find record by ID
   */
  findById(id) {
    return this.data.find(record => record.id === id);
  }

  /**
   * Filter records by property
   */
  filter(property, value) {
    return this.data.filter(record => record[property] === value);
  }

  /**
   * Search records by keyword
   */
  search(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return this.data.filter(record =>
      Object.values(record).some(val =>
        String(val).toLowerCase().includes(lowerKeyword)
      )
    );
  }

  /**
   * Get total count
   */
  count() {
    return this.data.length;
  }

  /**
   * Display data in HTML table
   */
  displayTable(containerId, columns = null) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID '${containerId}' not found`);
      return;
    }

    if (this.data.length === 0) {
      container.innerHTML = '<p>No data available</p>';
      return;
    }

    const cols = columns || Object.keys(this.data[0]);
    let html = '<table border="1" cellpadding="10" cellspacing="0" style="width:100%; border-collapse:collapse;">';
    
    // Header
    html += '<thead><tr style="background-color:#f2f2f2;">';
    cols.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += '</tr></thead>';
    
    // Body
    html += '<tbody>';
    this.data.forEach(record => {
      html += '<tr>';
      cols.forEach(col => {
        html += `<td>${record[col] || 'N/A'}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    container.innerHTML = html;
  }

  /**
   * Export data as CSV
   */
  exportCSV() {
    if (this.data.length === 0) return '';
    
    const keys = Object.keys(this.data[0]);
    let csv = keys.join(',') + '\n';
    
    this.data.forEach(record => {
      const values = keys.map(key => {
        const val = record[key];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      });
      csv += values.join(',') + '\n';
    });
    
    return csv;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleSheetsDB;
}