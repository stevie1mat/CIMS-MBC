const fs = require('fs');
const xlsx = require('xlsx');

try {
  const buffer = fs.readFileSync('/Users/stevenmathew/Downloads/MBC/questions-format/RIGHTLY DIVIDING THE WORD  UNIT 2.xls');
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  console.log("Success! Rows:", rows.length);
} catch (err) {
  console.error("Error reading with buffer:", err);
}
