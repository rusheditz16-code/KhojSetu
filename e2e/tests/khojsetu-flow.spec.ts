import { test, expect } from '@playwright/test';

test.describe('KhojSetu (FoundBeacon) Full Campus Flow', () => {
  test('Complete flow: Post Item -> Match Radar -> Private Claim -> Proctor/Finder Approval', async ({ page }) => {
    // 1. Visit the home feed
    await page.goto('/');
    await expect(page).toHaveTitle(/KhojSetu \| FoundBeacon/);
    await expect(page.locator('text=Campus Item Reports')).toBeVisible();

    // 2. Open Report Item page
    await page.click('text=Report Item');
    await expect(page).toHaveURL('/report');

    // 3. Fill W3C Accessible Form
    await page.fill('#item-title', 'Casio FX-991EX ClassWiz Calculator');
    await page.selectOption('#item-cat', 'electronics');
    await page.selectOption('#item-zone', 'library');
    await page.fill('#item-area', 'Central Library 1st Floor Desk 12');
    await page.fill('#item-desc', 'Black scientific calculator left on table after morning calculus study session.');
    await page.fill('#item-secret', 'What custom name is engraved with label tape on the battery cover?');

    // Submit report
    await page.click('button:has-text("Publish Report")');

    // 4. Verify redirected to item details dossier
    await expect(page).toHaveURL(/\/items\/itm-/);
    await expect(page.locator('text=Casio FX-991EX ClassWiz Calculator')).toBeVisible();

    // 5. Open Match Radar Modal
    const matchRadarBtn = page.locator('button:has-text("Deep Scan")');
    if (await matchRadarBtn.isVisible()) {
      await matchRadarBtn.click();
      await expect(page.locator('text=FoundBeacon Match Radar')).toBeVisible();
      // Close radar
      await page.click('button:has-text("Close")');
    }

    // 6. Navigate to Found Dell Laptop to test Private Claim Flow
    await page.goto('/items/itm-fnd-laptop-02');
    await expect(page.locator('text=Found Dell Laptop in Grey Sleeve')).toBeVisible();

    // Check Private Verification Question is visible to claimant
    await expect(page.locator('text=Private Verification Question Required by Reporter')).toBeVisible();

    // 7. Click Verify & Claim Ownership
    await page.click('button:has-text("Verify & Claim Ownership")');
    await expect(page.locator('text=Private Ownership Verification')).toBeVisible();

    // Provide confidential ownership proof
    await page.fill('#proof-text', 'Dell XPS 13. Has a round blue NASA sticker and a GitHub Octocat on top lid. Charger is inside the front pocket.');
    await page.click('button:has-text("Submit Private Claim")');

    // 8. Switch to Finder Persona (Rahul Verma) and Review Claim
    await page.click('button[aria-label="Switch demo persona"]');
    await page.click('text=Rahul Verma');

    // Go to My Reports & Claims
    await page.goto('/my-posts');
    await expect(page.locator('text=Review Claims').first()).toBeVisible();
    await page.click('text=Review Claims');

    // Verify confidential proof is visible to the owner
    await expect(page.locator('text=Review Ownership Claims')).toBeVisible();
    await expect(page.locator('text=Submitted Private Proof:')).toBeVisible();

    // Approve the claim with pickup instructions
    if (await page.locator('button:has-text("Review & Respond")').isVisible()) {
      await page.click('button:has-text("Review & Respond")');
      await page.fill('input[placeholder*="Library Desk 2"]', 'Deposited at Central Library Desk 2 with Ref #502');
      await page.click('button:has-text("Approve Ownership")');
    }

    // 9. Verify Proctor Dashboard
    await page.click('button[aria-label="Switch demo persona"]');
    await page.click('text=Prof. Vikram Sen');

    await page.goto('/moderator');
    await expect(page.locator('text=Moderator Dashboard')).toBeVisible();
    await expect(page.locator('text=Audit History Log')).toBeVisible();
  });
});
