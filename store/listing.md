# Chrome Web Store listing

Paste each block into the matching field in the developer dashboard.

## Package

Upload `dist/username-censor-for-reddit-2.0.0.zip` (rebuild with `./package.sh`).

## Store listing tab

**Name** (from manifest)

```
Username Censor for Reddit
```

**Summary** (from manifest, 128 of 132 chars)

```
Click the toolbar button to cover every Reddit username with a color block. Each user keeps one color, so threads stay readable.
```

**Description**

```
Sharing a screenshot of a Reddit thread usually means opening an image editor and scribbling over every username by hand. Miss one and you have named someone who never agreed to be in your screenshot.

This extension covers them all with one click.

What it does
• Covers every username on the page with a solid color block, and hides avatars.
• Gives each user one color. The same person has the same color in every comment, so you can still follow who replied to whom.
• Covers u/ mentions inside comment text.
• Keeps covering new comments as you scroll or expand replies.
• Click the button again to put everything back.
• Works on new Reddit and old.reddit.com, in light and dark mode.

How to use
Open a Reddit page and click the extension's toolbar button, or press Alt+Shift+U. The button shows ON while usernames are hidden. Take your screenshot, then click again to undo.

Good to know
It covers names that link to a user profile. A username someone typed as plain text, without the u/ prefix, stays visible. Check your screenshot before you post it.

Privacy
It runs only when you click it, and only on the tab you clicked it in. It collects no data and makes no network requests.

Open source
The code is on GitHub: https://github.com/DWMiller/reddit-censor

This extension is not affiliated with or endorsed by Reddit.
```

**Category**: Make Chrome Yours > Functionality & UI

**Language**: English

**Graphic assets**

| Field | File |
| --- | --- |
| Store icon (128x128) | `icons/icon128.png` |
| Screenshots (1280x800), in this order | `store/screenshot-1.png`, `store/screenshot-2.png`, `store/screenshot-3.png` |
| Small promo tile (440x280) | `store/promo-small.png` |
| Marquee promo tile (1400x560) | `store/promo-marquee.png` |

Upload only the PNGs listed above. `store/src/` holds the SVG and HTML sources. `./store/render.sh` re-renders the icons and every store image from them.

**Homepage URL**

```
https://github.com/DWMiller/reddit-censor
```

**Support URL**

```
https://github.com/DWMiller/reddit-censor/issues
```

**Official URL**: leave blank. It only accepts a domain verified in Google Search Console.

## Privacy practices tab

**Single purpose description**

```
Hides usernames and avatars on the Reddit page the user is viewing, so they can take a screenshot that names no one.
```

**Permission justifications**

The dashboard shows a box for each permission it wants explained. Fill the ones that appear.

activeTab

```
The extension acts only when the user clicks its toolbar button or presses its shortcut. activeTab gives it access to that one tab at that moment, so it needs no standing access to reddit.com or any other site. On that click it runs its bundled censor.js in the tab, which restyles links to Reddit user profiles so the names are covered. It reads nothing else and sends nothing anywhere.
```

scripting

```
When the user clicks the button, the extension uses chrome.scripting.executeScript to run its bundled censor.js in the active tab. That script restyles links to Reddit user profiles so the names are covered. It reads nothing else and sends nothing anywhere.
```

**Are you using remote code?** No, I am not using remote code.

**Data usage**: check none of the data type boxes. Then tick all three certifications:

- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL**

```
https://github.com/DWMiller/reddit-censor/blob/master/store/privacy.md
```

## Distribution tab

- Payments: Free
- Visibility: Public
- Regions: All regions
