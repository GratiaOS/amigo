import { expect, test } from "@playwright/test";

test("amigo cycle: create -> open -> burn -> refresh", async ({ page }) => {
  const secret = "Field test 123.";

  await page.goto("/?lang=en");
  await page.getByPlaceholder("Your message").fill(secret);
  await page.getByRole("button", { name: /SEAL AND TRANSMIT/i }).click();

  const linkLocator = page.locator("code").first();
  await expect(linkLocator).toContainText("http");
  const short = (await linkLocator.textContent())?.trim();
  expect(short).toBeTruthy();

  const roomUrl = new URL(short as string);
  roomUrl.searchParams.set("lang", "en");
  await page.goto(roomUrl.toString());

  await page.getByRole("button", { name: /Break seal/i }).click();
  await expect(page.getByText(secret, { exact: false })).toBeVisible();

  await page.getByRole("button", { name: /^Burn$/i }).click();
  await expect(page.getByText(/Frequency cleared|The trail faded\./i)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Frequency cleared|The trail faded\./i)).toBeVisible();
  await expect(page.getByText(secret)).toHaveCount(0);
});

test("amigo cycle: link -> open -> burn -> refresh", async ({ page }) => {
  const targetUrl = "https://example.com";

  await page.goto("/?lang=en");
  await page.getByPlaceholder("https://example.com").fill(targetUrl);
  await page.getByRole("button", { name: /Generate link/i }).click();

  const linkLocator = page.locator("code").first();
  await expect(linkLocator).toContainText("http");
  const short = (await linkLocator.textContent())?.trim();
  expect(short).toBeTruthy();

  const roomUrl = new URL(short as string);
  roomUrl.searchParams.set("lang", "en");
  await page.goto(roomUrl.toString());

  await page.getByRole("button", { name: /Break seal/i }).click();
  await expect(page.getByRole("link", { name: targetUrl })).toBeVisible();

  await page.getByRole("button", { name: /^Burn$/i }).click();
  await expect(page.getByText(/Frequency cleared|The trail faded\./i)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Frequency cleared|The trail faded\./i)).toBeVisible();
});
