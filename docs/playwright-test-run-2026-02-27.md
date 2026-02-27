# Playwright Live Test Run — mesiafy.com
**Date:** 2026-02-27
**Tool:** Playwright MCP (browser automation)
**Target:** https://mesiafy.com
**Channel used for testing:** `ninja` (1020 clips)

---

## What Was Tested

| # | Area | What Was Checked |
|---|------|-----------------|
| 1 | Landing page | Renders correctly — title, subtitle, input, submit button |
| 2 | Empty form submission | Shows inline error, stays on page |
| 3 | Valid channel submission | Redirects to `/ninja`, loads all clips (1020) |
| 4 | Clips page UI | Thumbnails, duration overlays, metadata, controls bar |
| 5 | Sort Views ↑ | Lowest view count appears first |
| 6 | Sort Views ↓ | Highest view count appears first |
| 7 | Sort Date ↑ | Oldest clips appear first |
| 8 | Sort mutual exclusivity | Clicking Date resets Views button arrow |
| 9 | Filter by Game | Only matching game clips shown, clip count updates |
| 10 | Pagination after filter | Page count recalculates based on filtered results |
| 11 | Next / Last navigation | Page counter advances, buttons update |
| 12 | Boundary disable states | Next + Last disabled on final page |
| 13 | Clear Filters | All state resets — count, page, dropdowns, sort arrows |
| 14 | Invalid channel | Error message shown, stays on landing page |
| 15 | Header nav link | "Mesiafy" link on clips page returns to `/` |

**Overall result: 15/15 passed ✅**

---

## Test 1 — Landing Page Renders

```js
await page.goto('https://mesiafy.com');
```

**What was checked:** Page title is "Mesiafy", heading, subtitle, textbox, and Submit button all present in accessibility tree.

**Screenshot:** `screenshots/test-landing.png`

---

## Test 2 — Empty Form Submission

```js
async (page) => {
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(1000);
  return { url: page.url(), title: await page.title() };
}
```

**What was checked:** URL stays at `https://mesiafy.com/`, error message "Please enter a channel name" appears with red border on input.

**Screenshot:** `screenshots/test-empty-submit.png`

---

## Test 3 — Valid Channel Loads Clips

```js
await page.goto('https://mesiafy.com/ninja');
```

**What was checked:** Page URL becomes `/ninja`, accessibility tree shows controls bar with sort buttons, filter dropdowns, clip count "Showing 1020 clips", and 20 clip cards on page 1.

**Screenshot:** `screenshots/test-clips-page.png`

---

## Test 4 — Sort Views Descending

```js
async (page) => {
  await page.getByRole('button', { name: 'Views' }).click();
  await page.waitForTimeout(500);
  const viewsBtn = await page.getByRole('button', { name: /Views/ }).textContent();
  const firstViewCount = await page.locator('.clip-card:visible').first()
    .locator('text=/views/').textContent();
  return { viewsButtonText: viewsBtn, firstCardViews: firstViewCount };
}
```

**What was checked:** Button shows `Views ↓`, first visible card has highest view count (310,121 views).

---

## Test 5 — Sort Views Ascending

```js
async (page) => {
  await page.getByRole('button', { name: /Views/ }).click(); // to none
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Views/ }).click(); // to ascending ↑
  await page.waitForTimeout(500);
  const viewsBtn = await page.getByRole('button', { name: /Views/ }).textContent();
  const allViewCounts = await page.locator('.clip-card:visible').evaluateAll(cards =>
    cards.map(c => parseInt(c.getAttribute('data-views')))
  );
  return { viewsButtonText: viewsBtn, firstViews: allViewCounts[0], lastViews: allViewCounts[allViewCounts.length - 1] };
}
```

**What was checked:** Button shows `Views ↑`, first card has 782 views (lowest), last card on page has 801 views — ascending order confirmed.

---

## Test 6 — Sort Date Ascending + Mutual Exclusivity

```js
async (page) => {
  await page.getByRole('button', { name: 'Date' }).click();
  await page.waitForTimeout(500);
  const viewsBtn = await page.getByRole('button', { name: /Views/ }).textContent();
  const dateBtn = await page.getByRole('button', { name: /Date/ }).textContent();
  const dates = await page.locator('.clip-card:visible').evaluateAll(cards =>
    cards.map(c => c.getAttribute('data-date'))
  );
  return { viewsButtonText: viewsBtn, dateBtnText: dateBtn, firstDate: dates[0], lastDate: dates[dates.length - 1] };
}
```

**What was checked:**
- `Date ↑` shows oldest clips first (Sep 19, 2020)
- `Views` button resets to no arrow — mutual exclusivity confirmed

---

## Test 7 — Filter by Game

```js
async (page) => {
  await page.locator('select').first().selectOption('Fortnite');
  await page.waitForTimeout(500);
  const clipCount = await page.locator('text=/Showing \\d+ clips/').textContent();
  const games = await page.locator('.clip-card:visible').evaluateAll(cards =>
    [...new Set(cards.map(c => c.getAttribute('data-game')))]
  );
  return { clipCount, uniqueGamesVisible: games };
}
```

**What was checked:** Clip count drops to "Showing 699 clips". `uniqueGamesVisible` returns `["Fortnite"]` — no clips from other games are visible.

---

## Test 8 — Pagination After Filter

```js
async (page) => {
  const pageIndicator = await page.locator('text=/Page \\d+ of \\d+/').textContent();
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.waitForTimeout(300);
  const pageAfterNext = await page.locator('text=/Page \\d+ of \\d+/').textContent();
  await page.getByRole('button', { name: 'Last' }).click();
  await page.waitForTimeout(300);
  const pageAfterLast = await page.locator('text=/Page \\d+ of \\d+/').textContent();
  const lastBtnDisabled = await page.getByRole('button', { name: 'Last' }).isDisabled();
  const nextBtnDisabled = await page.getByRole('button', { name: 'Next →' }).isDisabled();
  return { pageIndicator, pageAfterNext, pageAfterLast, lastDisabled: lastBtnDisabled, nextDisabled: nextBtnDisabled };
}
```

**What was checked:**
- Filter produces "Page 1 of 35" (699 clips ÷ 20 = 34.95 → 35 pages ✅)
- Next → advances to page 2
- Last jumps to page 35
- Next and Last buttons disabled at boundary ✅

---

## Test 9 — Clear Filters

```js
async (page) => {
  await page.getByRole('button', { name: 'Clear Filters' }).click();
  await page.waitForTimeout(500);
  const clipCount = await page.locator('text=/Showing \\d+ clips/').textContent();
  const pageIndicator = await page.locator('text=/Page \\d+ of \\d+/').textContent();
  const gameDropdown = await page.locator('select').first().inputValue();
  const dateBtn = await page.getByRole('button', { name: /Date/ }).textContent();
  const firstBtnDisabled = await page.getByRole('button', { name: 'First' }).isDisabled();
  return { clipCount, pageIndicator, gameDropdown, dateBtnText: dateBtn, firstDisabled: firstBtnDisabled };
}
```

**What was checked:** All state fully resets:
- Clip count: "Showing 1020 clips"
- Page indicator: "Page 1 of 51"
- Game dropdown value: `""` (All Games)
- Date button text: `"Date"` (no arrow)
- First/Prev disabled (back on page 1) ✅

---

## Test 10 — Invalid Channel

```js
await page.goto('https://mesiafy.com/thischanneldoesnotexist12345xyz');
```

**What was checked:** Returns landing page, accessibility tree includes `"Channel not found. Please check the spelling and try again."` error paragraph with red border styling.

**Screenshot:** `screenshots/test-invalid-channel.png`

---

## Test 11 — Header Nav Link

```js
async (page) => {
  await page.goto('https://mesiafy.com/ninja');
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: 'Mesiafy' }).click();
  await page.waitForLoadState('load');
  return { url: page.url(), title: await page.title() };
}
```

**What was checked:** After clicking the "Mesiafy" header link on the clips page, URL returns to `https://mesiafy.com/` — home navigation confirmed.

---

## Screenshots

| File | Description |
|------|-------------|
| `screenshots/test-landing.png` | Landing page initial state |
| `screenshots/test-empty-submit.png` | Empty form submission error |
| `screenshots/test-clips-page.png` | Clips page with 1020 Ninja clips |
| `screenshots/test-invalid-channel.png` | Invalid channel error state |
