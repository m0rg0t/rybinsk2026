import { expect, test } from '@playwright/test';

for (const width of [320, 390, 1280]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`route, archive, search and theme at ${width}/${colorScheme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ colorScheme });
      await page.clock.setFixedTime(new Date('2026-08-01T06:00:00Z'));
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Рыбинскъ', exact: true })).toBeVisible();
      const theme = page.getByRole('button', { name: colorScheme === 'dark' ? 'Светлая тема' : 'Тёмная тема' });
      await expect(theme).toBeVisible();
      await theme.click();
      await page.reload();
      await expect(page.getByRole('button', { name: colorScheme === 'dark' ? 'Тёмная тема' : 'Светлая тема' })).toBeVisible();
      await page.getByRole('button', { name: 'В мой маршрут', exact: true }).first().click();
      await expect(page.getByRole('button', { name: 'Моё · 1', exact: true })).toBeVisible();
      await page.reload();
      await page.getByRole('button', { name: 'Моё · 1', exact: true }).click();
      await expect(page.getByRole('article')).toHaveCount(1);
      await page.getByRole('button', { name: 'По времени', exact: true }).click();
      await expect(page.getByRole('article')).toHaveCount(1);
      await page.getByRole('button', { name: 'Архив 2025', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Моё', exact: true })).toBeVisible();
      await page.getByRole('button', { name: '← Программа 2026', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Моё · 1', exact: true })).toBeVisible();
      await page.getByRole('searchbox').fill('No such event');
      await expect(page.getByText('По этим условиям ничего не идёт.')).toBeVisible();
      await page.getByRole('searchbox').clear();
      await page.getByRole('button', { name: 'Афиши', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Афиши', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Назад', exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

test('blocked storage cannot prevent initial rendering or changing the theme', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Тёмная тема' }).click();
  await expect(page.getByRole('button', { name: 'Светлая тема' })).toBeVisible();
  await page.getByRole('button', { name: 'В мой маршрут', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Моё · 1', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('malformed favorites do not become a character-by-character route', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rybinsk-route-2026-08-01', '"abc"'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Моё', exact: true }).click();
  await expect(page.getByText('Маршрут пока пуст — отмечайте события звёздочкой.')).toBeVisible();
});

for (const timezoneId of ['UTC', 'America/Los_Angeles', 'Asia/Tokyo']) {
  test.describe(timezoneId, () => {
    test.use({ timezoneId });
    test('city event status is independent of device timezone', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-08-01T09:30:00Z'));
      await page.goto('/');
      await page.getByRole('button', { name: /^Сейчас/ }).click();
      const events = page.getByRole('article');
      expect(await events.count()).toBeGreaterThan(0);
      await expect(events.first().getByText('Сейчас', { exact: true })).toBeVisible();
    });
  });
}

test('installed PWA remains available offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Рыбинскъ', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Архив 2025', exact: true }).click();
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('a stale reconnect timer cannot hide a new offline warning', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.evaluate(() => {
    window.dispatchEvent(new Event('online'));
    window.dispatchEvent(new Event('offline'));
  });
  await expect(page.getByText('Работает offline')).toBeVisible();
  await page.clock.fastForward(3500);
  await expect(page.getByText('Работает offline')).toBeVisible();
});
