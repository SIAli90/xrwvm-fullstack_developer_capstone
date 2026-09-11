const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8000';
const EVIDENCE_DIR = path.resolve(process.env.EVIDENCE_DIR || '../submission_evidence');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TEST_USERNAME = process.env.TEST_USERNAME;
const TEST_PASSWORD = process.env.TEST_PASSWORD;
const REVIEW_DEALER_ID = 15;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !TEST_USERNAME || !TEST_PASSWORD) {
  throw new Error('Screenshot capture credentials were not supplied through environment variables.');
}

fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

const screenshot = async (page, filename) => {
  await page.screenshot({ path: path.join(EVIDENCE_DIR, filename), fullPage: true });
};

(async () => {
  const browser = await chromium.launch({ headless: true });

  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${BASE_URL}/admin/login/?next=/admin/`, { waitUntil: 'networkidle' });
  await adminPage.fill('input[name="username"]', ADMIN_USERNAME);
  await adminPage.fill('input[name="password"]', ADMIN_PASSWORD);
  await Promise.all([
    adminPage.waitForURL(/\/admin\/?$/),
    adminPage.click('input[type="submit"]'),
  ]);
  await screenshot(adminPage, 'admin_login.png');

  const logoutButton = adminPage.locator('form#logout-form button, a[href*="logout"]').first();
  if (await logoutButton.count()) {
    await logoutButton.click();
    await adminPage.waitForLoadState('networkidle');
  } else {
    await adminPage.goto(`${BASE_URL}/admin/logout/`, { waitUntil: 'networkidle' });
  }
  await screenshot(adminPage, 'admin_logout.png');
  await adminContext.close();

  const userContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await userContext.newPage();

  await page.goto(`${BASE_URL}/dealers`, { waitUntil: 'networkidle' });
  await page.waitForSelector('table tbody tr');
  await screenshot(page, 'get_dealers.png');

  const loginResult = await page.evaluate(async ({ username, password }) => {
    const response = await fetch('/djangoapp/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: username, password }),
    });
    return response.json();
  }, { username: TEST_USERNAME, password: TEST_PASSWORD });

  if (loginResult.status !== 'Authenticated') {
    throw new Error(`Login failed during screenshot capture: ${JSON.stringify(loginResult)}`);
  }

  await page.evaluate((user) => {
    sessionStorage.setItem('username', user.userName);
    sessionStorage.setItem('firstname', user.firstName || 'Capstone');
    sessionStorage.setItem('lastname', user.lastName || 'User');
  }, loginResult);

  await page.goto(`${BASE_URL}/dealers`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Review Dealer');
  await page.waitForSelector(`text=${TEST_USERNAME}`);
  await screenshot(page, 'get_dealers_loggedin.png');

  await page.goto(`${BASE_URL}/dealers/Kansas`, { waitUntil: 'networkidle' });
  await page.waitForSelector('table tbody tr');
  await screenshot(page, 'dealersbystate.png');

  await page.goto(`${BASE_URL}/dealer/${REVIEW_DEALER_ID}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Customer Reviews');
  await page.waitForSelector('.review_panel');
  await screenshot(page, 'dealer_id_reviews.png');

  await page.goto(`${BASE_URL}/postreview/${REVIEW_DEALER_ID}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('textarea#review');
  await page.fill('textarea#review', 'Fantastic services and friendly staff');
  await page.fill('input[type="date"]', '2023-08-15');
  const carSelect = page.locator('select').first();
  const options = carSelect.locator('option:not([disabled])');
  const firstCarValue = await options.nth(1).getAttribute('value');
  if (!firstCarValue) throw new Error('No car model options were available.');
  await carSelect.selectOption(firstCarValue);
  await page.fill('input[type="number"]', '2023');
  await screenshot(page, 'dealership_review_submission.png');

  await Promise.all([
    page.waitForURL(new RegExp(`/dealer/${REVIEW_DEALER_ID}$`)),
    page.getByRole('button', { name: 'Post Review' }).click(),
  ]);
  await page.waitForSelector('text=Fantastic services and friendly staff');
  await screenshot(page, 'added_review.png');

  await userContext.close();
  await browser.close();
  console.log(`Evidence screenshots saved to ${EVIDENCE_DIR}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
