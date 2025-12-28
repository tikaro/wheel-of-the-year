const fs = require('fs');

const content = fs.readFileSync('src/calendarDates.js', 'utf8');

// Replace "label": with "calendarLabels":
let updated = content.replace(/"label":/g, '"calendarLabels":');

fs.writeFileSync('src/calendarDates.js', updated, 'utf8');
console.log('Successfully renamed label to calendarLabels in calendarDates.js');
