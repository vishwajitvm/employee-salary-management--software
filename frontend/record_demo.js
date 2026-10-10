const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Starting Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: path.join(__dirname, 'video'),
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  
  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:3000');
    
    // Select HR Manager
    await page.selectOption('select', 'HR_MANAGER');
    await page.click('button:has-text("Sign in via SSO")');
    console.log('Clicked login...');
    
    // Wait for dashboard to load
    await page.waitForURL('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000); // look at the dashboard
    
    // Go to Directory
    console.log('Navigating to Directory...');
    await page.click('text=Directory');
    await page.waitForURL('http://localhost:3000/dashboard/employees');
    await page.waitForTimeout(2000); // look at employees
    
    // Filter
    console.log('Applying filters...');
    await page.selectOption('select:has-text("All Departments")', { label: 'Legal' });
    await page.waitForTimeout(1000);
    await page.selectOption('select:has-text("All Countries")', { label: 'USA' });
    await page.waitForTimeout(2000);
    
    // Bulk Update
    console.log('Triggering bulk update...');
    await page.click('button:has-text("Bulk Update")');
    await page.waitForTimeout(1000);
    await page.fill('input.swal2-input', '10');
    await page.click('button:has-text("Execute Update")');
    await page.waitForTimeout(4000); // wait for toaster to show and fade a bit
    
    // Clear filters
    console.log('Clearing filters...');
    await page.selectOption('select:has-text("Legal")', { label: 'All Departments' });
    await page.waitForTimeout(1000);
    
    // Download PDF (dossier)
    console.log('Downloading Dossier...');
    await page.click('table tbody tr:first-child button');
    await page.waitForTimeout(2000);

    // Download Master Report
    console.log('Downloading Master Report...');
    await page.click('button:has-text("Export")');
    await page.waitForTimeout(2000);
    
    // Sign out
    console.log('Signing out...');
    await page.click('text=Sign Out');
    await page.waitForURL('http://localhost:3000');
    await page.waitForTimeout(1000);

    // Login as standard employee
    console.log('Logging in as Standard Employee...');
    await page.selectOption('select', 'EMPLOYEE');
    await page.waitForTimeout(1000);
    // Select first employee from dropdown
    await page.locator('select').nth(1).selectOption({ index: 1 });
    await page.click('button:has-text("Sign in via SSO")');
    
    // Wait for Employee Portal
    await page.waitForTimeout(3000); // look at portal
    
  } catch (error) {
    console.error('Error during recording:', error);
  } finally {
    console.log('Closing context to save video...');
    await context.close();
    await browser.close();
    
    // Rename video
    const files = fs.readdirSync(path.join(__dirname, 'video'));
    const webmFile = files.find(f => f.endsWith('.webm') && f !== 'demo.webm');
    if (webmFile) {
        const oldPath = path.join(__dirname, 'video', webmFile);
        const newPath = path.join(__dirname, 'video', 'demo.webm');
        if (fs.existsSync(newPath)) fs.unlinkSync(newPath); // replace old one
        fs.renameSync(oldPath, newPath);
        console.log(`Video saved to video/demo.webm`);
    }
  }
})();
