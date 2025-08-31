#!/usr/bin/env node

// Script to fix API_BASE_URL definitions across the frontend
const fs = require('fs');
const path = require('path');

const files = [
  '/app/frontend/src/components/Footer.jsx',
  '/app/frontend/src/contexts/AuthContext.js',
  '/app/frontend/src/pages/UserManagement.jsx',
  '/app/frontend/src/pages/ConfigureHours.jsx',
  '/app/frontend/src/pages/forms/PatientRegistrationPDF.jsx',
  '/app/frontend/src/pages/OurHours.jsx',
  '/app/frontend/src/pages/UrgentCareAppointments.jsx',
  '/app/frontend/src/pages/UrgentCare.jsx',
  '/app/frontend/src/pages/PhotoManagement.jsx',
  '/app/frontend/src/pages/ReviewUs.jsx',
  '/app/frontend/src/pages/Reviews.jsx',
  '/app/frontend/src/pages/EmailConfiguration.jsx',
  '/app/frontend/src/pages/BusinessInfo.jsx',
  '/app/frontend/src/pages/Home.jsx'
];

const oldPattern = /const API_BASE_URL = process\.env\.REACT_APP_BACKEND_URL \|\| import\.meta\.env\.REACT_APP_BACKEND_URL;/g;
const newReplacement = 'const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;';

files.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.match(oldPattern)) {
        content = content.replace(oldPattern, newReplacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
      } else {
        console.log(`ℹ️  No changes needed: ${filePath}`);
      }
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n🎉 API_BASE_URL fix completed!');