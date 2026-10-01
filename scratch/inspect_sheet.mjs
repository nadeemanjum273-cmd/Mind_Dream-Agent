import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

async function inspectSheet() {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
  const emailMatch = envContent.match(/GOOGLE_SERVICE_ACCOUNT_EMAIL=(.+)/);
  const keyMatch = envContent.match(/GOOGLE_PRIVATE_KEY="([\s\S]+?)"\nGOOGLE_SHEET_ID/);
  const sheetIdMatch = envContent.match(/GOOGLE_SHEET_ID=(.+)/);

  const email = emailMatch ? emailMatch[1].trim() : '';
  let key = keyMatch ? keyMatch[1].trim() : '';
  const sheetId = sheetIdMatch ? sheetIdMatch[1].trim() : '';

  if (key.includes('\\n')) key = key.replace(/\\n/g, '\n');

  console.log('Email:', email);
  console.log('Sheet ID:', sheetId);

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });

  console.log('--- SPREADSHEET TABS ---');
  for (const sheet of meta.data.sheets || []) {
    const title = sheet.properties?.title;
    const gid = sheet.properties?.sheetId;
    console.log(`Tab: "${title}" (gid: ${gid})`);
    
    // Get headers / first few rows
    try {
      const data = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${title}'!A1:Z10`,
      });
      console.log(`Rows in "${title}":`, data.data.values);
    } catch (e) {
      console.log(`Error reading "${title}":`, e.message);
    }
  }
}

inspectSheet().catch(console.error);
