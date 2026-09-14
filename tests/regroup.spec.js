const { test, expect } = require('@playwright/test');

test('verse 5 selections replace overlaps and exact selections reopen the recorder', async ({ page }) => {
  let calls = 0;
  const original = [
    { id: 101, verse: 5, start_word: 0, end_word: 2, color: 1 },
    { id: 102, verse: 5, start_word: 3, end_word: 5, color: 2 },
    { id: 103, verse: 5, start_word: 6, end_word: 7, color: 1 }
  ];
  await page.route('**/rest/v1/**', async route => {
    if (route.request().url().includes('/rpc/')) {
      calls++;
      expect(route.request().postDataJSON()).toMatchObject({ p_start: 1, p_end: 4 });
      await route.fulfill({ json: [{ id: 104, verse: 5, start_word: 1, end_word: 4, color: 2 }] });
    } else {
      await route.fulfill({ json: route.request().url().includes('highlight_groups') ? original : [] });
    }
  });
  await page.goto('/'); await page.waitForFunction(() => remoteReady);
  const select = () => page.evaluate(() => {
    const words = document.querySelectorAll('.verse-line[data-verse="5"] .word');
    const range = document.createRange(); range.setStartBefore(words[1]); range.setEndAfter(words[4]);
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
    document.querySelector('#passage').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
  await select();
  await expect(page.locator('#recorder-dialog')).toBeVisible();
  await expect(page.locator('.word[data-group-id="104"]')).toHaveCount(4);
  await expect(page.locator('[data-group-id="101"], [data-group-id="102"]')).toHaveCount(0);
  await expect(page.locator('.word[data-group-id="103"]')).toHaveCount(2);
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await select();
  await expect(page.locator('#recorder-dialog')).toBeVisible();
  expect(calls).toBe(1);
});
