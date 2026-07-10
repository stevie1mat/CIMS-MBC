import { readFileSync } from 'node:fs';

const content = readFileSync('sql/u306526696_website.sql', 'utf8');
const insertIndex = content.indexOf('INSERT INTO `savsoft_users`');
const endIndex = content.indexOf(';', insertIndex);

const insertBlock = content.substring(insertIndex, endIndex);

// The values start after "VALUES "
const valuesStart = insertBlock.indexOf('VALUES\n') + 7;
const valuesStr = insertBlock.substring(valuesStart);

// We need to parse records. 
// A naive regex or careful character iteration.
const records = [];
let inString = false;
let currentRecord = [];
let currentValue = "";

for (let i = 0; i < valuesStr.length; i++) {
  const char = valuesStr[i];
  
  if (char === "'" && valuesStr[i-1] !== '\\') {
    inString = !inString;
    continue;
  }
  
  if (!inString) {
    if (char === '(' && currentValue.trim() === '') {
      continue;
    }
    if (char === ',') {
      currentRecord.push(currentValue.trim());
      currentValue = "";
      continue;
    }
    if (char === ')') {
      currentRecord.push(currentValue.trim());
      records.push(currentRecord);
      currentRecord = [];
      currentValue = "";
      // skip comma or newline after tuple
      while(i + 1 < valuesStr.length && (valuesStr[i+1] === ',' || valuesStr[i+1] === '\n' || valuesStr[i+1] === '\r')) {
        i++;
      }
      continue;
    }
  }
  
  currentValue += char;
}

const roles = {};
let studentCount = 0;
let teacherCount = 0;
let adminCount = 0;
let unknownCount = 0;

records.forEach(r => {
  // r[2] is email (with or without quotes stripped)
  // r[5] is contact_no (with or without quotes)
  // r[27] is checkstudent (usually unquoted number)
  
  const email = r[2] ? r[2].replace(/^'|'$/g, '') : '';
  const contactNo = r[5] ? r[5].replace(/^'|'$/g, '') : '';
  const checkStudent = r[27] ? r[27].replace(/^'|'$/g, '') : '';
  
  let role = 'unknown';
  
  if (checkStudent === '0' || contactNo.startsWith('MBC#T')) role = 'teacher';
  if (checkStudent === '1' || contactNo.startsWith('MBC#S')) role = 'student';
  if (checkStudent === '3') role = 'admin';
  
  if (role === 'teacher') teacherCount++;
  else if (role === 'student') studentCount++;
  else if (role === 'admin') adminCount++;
  else unknownCount++;
  
  roles[checkStudent] = (roles[checkStudent] || 0) + 1;
});

console.log(`Total users: ${records.length}`);
console.log(`Teachers: ${teacherCount}`);
console.log(`Students: ${studentCount}`);
console.log(`Admins: ${adminCount}`);
console.log(`Unknown: ${unknownCount}`);
console.log('CheckStudent value frequencies:', roles);
