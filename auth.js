import config from "./config/site.json" assert { type: "json" };

const EMAIL = config.email;
const PASSWORD = config.password;

const login = async (browser, origin) => {
  const page = await browser.newPage();
  await page.goto(origin);
  await page.waitForSelector('input[id="session_email"]', { visible: true });
  await page.waitForSelector('input[id="session_password"]', { visible: true });
  const emailInput = await page.$('input[id="session_email"]');
  const passwordInput = await page.$('input[id="session_password"]');
  await emailInput.type(EMAIL);
  await passwordInput.type(PASSWORD);
  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForNavigation(),
  ]);
};

export default login;
