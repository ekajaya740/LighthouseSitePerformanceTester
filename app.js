import fs from "fs";
import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import config from "./config/site.json" assert { type: "json" };
import settings from "./config/lighthouse.json" assert { type: "json" };
import login from "./auth.js";

const PORT = 9222;

const options = {
  disableStorageReset: false,
  output: "html",
  sandbox: false,
  disableDeviceEmulation: false,
  throttling: {
    rttMs: 40,
    throughputKbps: 10 * 1024, // 10 Mbps
    cpuSlowdownMultiplier: 1, // No CPU slowdown
  },
  chromeFlags: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--headless=false",
    "--incognito",
    "--disable-mobile-emulation",
  ],
  maxWaitForLoad: 45000, // Increase load timeout to 45 seconds
  logLevel: "info", //
};

const generatePerformanceReport = async () => {
  const browser = await puppeteer.launch({
    args: [
      `--remote-debugging-port=${PORT}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
    headless: false, //can be set to false
    slowMo: 0,
    executablePath: "/snap/bin/chromium",
  }); // Generating report for login page, which is an unauthenticated page

  await generateReportForLogin(); // Logging into the site
  await login(browser, config.originUrl); // Generating report for home page, which is an authenticated page
  await generateReportForHome();
  await generateReportForWeddingPlanEdit();
  await browser.close();
};

// Storing the login page report in file system
const generateReportForLogin = async () => {
  const loginPageReport = await lighthouse(config.originUrl, options, settings);
  const loginPageReportHtml = loginPageReport.report;
  fs.writeFileSync(`./reports/new/loginPageReport.html`, loginPageReportHtml);
}; // Storing the home page report in file system

const generateReportForWeddingPlanEdit = async () => {
  const url = config.weddingPlan.editUrl;
  const report = await lighthouse(url, options, settings);
  const reportHtml = report.report;
  fs.writeFileSync(`./reports/new/weddingPlanEditPageReport.html`, reportHtml);
  console.log(
    `Wedding plan edit page performance report generated successfully`
  );
};

const generateReportForHome = async () => {
  //HomePage performance
  const url = config.originUrl;
  const homePageReport = await lighthouse(url, options, settings);
  const homePageReportHtml = homePageReport.report;
  fs.writeFileSync(`./reports/new/homePageReport.html`, homePageReportHtml);
  console.log(`home page performance report generated successfully`);
};

try {
  generatePerformanceReport();
} catch (e) {
  console.log(e);
}
