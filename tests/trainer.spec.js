const { test, expect } = require('@playwright/test');

test('ten verses, trope toggle, and mobile layout', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.verse-row')).toHaveCount(10);
  await expect(page.locator('.verse-number').last()).toHaveText('10');
  const original = await page.locator('.verse-line').first().textContent();
  await page.getByRole('button', { name: 'Trope', exact: true }).click();
  expect(await page.locator('.verse-line').first().textContent()).toBe(original.replace(/[\u0591-\u05AF]/g, ''));
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('live Supabase phrase and recording round trip', async ({ page, request }) => {
  test.setTimeout(60000);
  page.on('response', response => { if (response.status() >= 400) console.log(response.status(), response.url()); });
  let groupId;
  await page.goto('/');
  await expect(page.locator('#status')).toContainText('Select Hebrew words');
  // Wait for the backend load, not merely the initial static hint.
  await page.waitForFunction(() => remoteReady);
  const config = await page.evaluate(() => ({ url: SUPABASE_URL, key: SUPABASE_KEY, table: GROUP_TABLE, recordings: RECORDING_TABLE, bucket: RECORDING_BUCKET, storageKey: SUPABASE_STORAGE_ANON_KEY }));
  try {
    await page.evaluate(() => {
      const words = document.querySelectorAll('.verse-line[data-verse="10"] .word');
      const range = document.createRange(); range.setStartBefore(words[0]); range.setEndAfter(words[1]);
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      document.querySelector('#passage').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    });
    await expect(page.locator('#recorder-dialog')).toBeVisible();
    groupId = await page.evaluate(() => selectedGroup.id);
    await page.locator('#record-button').click();
    await expect(page.locator('#record-button')).toHaveText('■ Stop');
    await page.waitForTimeout(1300);
    await page.locator('#record-button').click({ force: true });
    await expect(page.locator('#status')).toContainText('Recording saved to Supabase', { timeout: 20000 });
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    await page.reload(); await page.waitForFunction(() => remoteReady);
    expect(await page.evaluate(id => recordings.has(id), groupId)).toBe(true);
    await page.locator('.verse-number').last().click();
    await expect(page.locator('#status')).toContainText('Verse 10 complete', { timeout: 15000 });
    await page.locator(`[data-group-id="${groupId}"]`).first().click();
    await page.getByRole('button', { name: 'Delete recording', exact: true }).click();
    await expect(page.locator('#status')).toContainText('Recording deleted');
  } finally {
    if (groupId) {
      await page.evaluate(async ({ config, groupId }) => {
        await fetch(`${config.url}/storage/v1/object/${config.bucket}/groups/${groupId}.webm`, { method: 'DELETE', headers: { apikey: config.storageKey, Authorization: `Bearer ${config.storageKey}` } });
        const result = await fetch(`${config.url}/rest/v1/${config.table}?id=eq.${groupId}`, { method: 'DELETE', headers: { apikey: config.key } });
        if (!result.ok) throw new Error('Test cleanup failed');
      }, { config, groupId });
    }
  }
});
