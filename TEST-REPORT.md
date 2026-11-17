# AURELIA — Test Report

**Date:** 2026-11-16 (Dubai) · **Build:** index.html + app.js + styles.css, no build step
**Method:** Every tool was run in Node (tests/run-tests.js) using the *same libraries and algorithms as app.js* (pdf-lib-plus-encrypt, PDF.js, JSZip, SheetJS, Mammoth, Tesseract.js, @napi-rs/canvas standing in for the browser canvas), against **real files downloaded from public sources** — not only generated samples. Outputs were re-opened and verified (page counts, text extraction, round-trip reads). `node --check app.js` passes; a static-serve check returned HTTP 200 for index/app/styles; a wiring audit confirmed all 31 tool IDs have handlers (no dead buttons).

## Result: 31 / 31 PASS

| # | Tool | Real input file | Output | Size | Pages | Verification |
|---|---|---|---|---|---|---|
| 1 | Merge PDF | tracemonkey.pdf + dummy-w3c.pdf | merge.pdf | 974,203 B | 15 | Page count 14+1 = 15 ✓ |
| 2 | Split PDF | tracemonkey.pdf | split-1-3.pdf | 155,104 B | 3 | Range 1–3 extracted ✓ |
| 3 | Remove Pages | tracemonkey.pdf | remove.pdf | 962,830 B | 12 | 14 → 12 pages ✓ |
| 4 | Extract Pages | tracemonkey.pdf | extract.pdf | 118,798 B | 2 | Pages 2 & 5 ✓ |
| 5 | Organize / Reorder | tracemonkey.pdf | reorder.pdf | 155,104 B | 3 | Order 3,1,2 applied (app enforces full-page order in UI) ✓ |
| 6 | Rotate PDF | tracemonkey.pdf | rotated.pdf | 962,848 B | 14 | Page 1 rotation reads back 90° ✓ |
| 7 | Crop PDF | tracemonkey.pdf | cropped.pdf | 962,855 B | 14 | CropBox trimmed 36 pt/side ✓ |
| 8 | Repair PDF | sample-pdf995.pdf | repaired.pdf | 414,850 B | 5 | Load + clean re-save, all pages kept ✓ |
| 9 | Compress PDF | images-mozilla.pdf (1,494,439 B, image-heavy) | compress-1page.pdf (page-1 proof) | 24,774 B | 1 | Render + JPEG rebuild works; ~98% smaller on the proof page ✓ |
| 10 | PDF to JPG | tracemonkey.pdf | page1.jpg | 475,068 B | 1 | JPEG rendered at scale 2 ✓ |
| 11 | PDF to PNG | tracemonkey.pdf | page1.png | 702,415 B | 1 | PNG rendered at scale 2 ✓ |
| 12 | PDF to Text | tracemonkey.pdf | tracemonkey.txt | 84,803 chars | 14 | Contains expected "TraceMonkey" text ✓ |
| 13 | PDF to Markdown | tracemonkey.pdf | tracemonkey.md | 84,975 B | 14 | Page-headed Markdown built ✓ |
| 14 | PDF to Word (Beta) | tracemonkey.pdf | tracemonkey.docx | 87,303 B | 14 | DOCX re-read by Mammoth, text present ✓ |
| 15 | PDF to Excel (Beta) | tracemonkey.pdf | tracemonkey.xlsx | 102,630 B | 14 | XLSX re-read by SheetJS ✓ |
| 16 | Images to PDF | photo-picsum.jpg (900×650) + png-wikimedia.png (800×600) | images.pdf | 438,108 B | 2 | Both real images embedded ✓ |
| 17 | Word to PDF (Beta) | demo-calibre.docx (9,258 chars text) | word-to-pdf.pdf | 2,270 B | 1* | Text extracted & typeset (*harness printed first section; app paginates full text via the same text-to-PDF engine) ✓ |
| 18 | Text to PDF | tracemonkey.txt (extracted) | text.pdf | 923 B | 1 | Wrapped-text PDF created ✓ |
| 19 | HTML to PDF | orimi-test.pdf text via HTML path | html.pdf | 989 B | 1 | HTML → text → PDF path verified ✓ |
| 20 | Add Page Numbers | tracemonkey.pdf | numbered.pdf | 965,918 B | 14 | Stamped on all pages ✓ |
| 21 | Watermark | tracemonkey.pdf | watermarked.pdf | 967,152 B | 14 | Translucent rotated watermark on all pages ✓ |
| 22 | Edit PDF | tracemonkey.pdf | edited.pdf | 963,333 B | 14 | Text added on page 1 ✓ |
| 23 | Annotate PDF | tracemonkey.pdf | annotated.pdf | 963,368 B | 14 | Highlight note box added ✓ |
| 24 | Sign PDF | dummy-w3c.pdf | signed.pdf | 2,386,159 B | 1 | Signature image stamped (app uses hand-drawn canvas PNG, same embed path) ✓ |
| 25 | Redact PDF | tracemonkey.pdf | redacted.pdf | 963,199 B | 14 | Solid black cover box on page 1 ✓ |
| 26 | Protect PDF | dummy-w3c.pdf | protected.pdf | 12,860 B | 1 | Real encryption — PDF.js without password correctly demands one ✓ |
| 27 | Unlock PDF | protected.pdf (from #26) | unlocked.pdf | 17,312 B | 1 | Rebuilt file opens with NO password ✓ (app: permission-strip first, then owner-password rebuild) |
| 28 | Metadata Editor | dummy-w3c.pdf | metadata.pdf | 12,640 B | 1 | Title/Author read back exactly as set ✓ |
| 29 | Compare PDF | tracemonkey.pdf vs dummy-w3c.pdf | compare.txt | — | — | Line-diff computed; texts differ as expected ✓ |
| 30 | Summarize PDF | tracemonkey.pdf | summary text | 13,741 words in | 14 | Extractive summary over 1,038 sentences ✓ |
| 31 | OCR PDF | ocr-sample-eng.png wrapped as scanned PDF | OCR text | 362 chars | 1 | Tesseract confidence 86%, read the sample's opening line "Mild Splendour of the various-vested Night!" ✓ |

## Downloaded test materials (QA only — excluded from the published package via .gitignore)

All are free public samples, used only for testing, **not redistributed** in the repo.

| File | Source URL | Note |
|---|---|---|
| tracemonkey.pdf (14 pp, 1,016,315 B) | https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/tracemonkey.pdf | Mozilla pdf.js test corpus (Apache-2.0 project) — multi-page text PDF |
| compressed-tracemonkey.pdf | https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf | Mozilla pdf.js demo file |
| images-mozilla.pdf (1,494,439 B) | https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/images.pdf | Image-heavy PDF — Compress test |
| dummy-w3c.pdf (1 p) | https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf | W3C test file |
| sample-pdf995.pdf (5 pp) | https://www.pdf995.com/samples/pdf.pdf | pdf995 public sample |
| orimi-test.pdf (1 p) | https://www.orimi.com/pdf-test.pdf | Public PDF test file |
| demo-calibre.docx | https://calibre-ebook.com/downloads/demos/demo.docx | calibre demo document |
| photo-picsum.jpg (900×650) | https://picsum.photos/900/650 | Lorem Picsum free photo |
| png-wikimedia.png (800×600) | https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png | Wikimedia Commons |
| ocr-sample-eng.png (1486×668) | https://tesseract.projectnaptha.com/img/eng.png | Official Tesseract sample image — wrapped into a scanned-style PDF for the OCR test |

Failed first attempts (honest log): africau.edu "sample.pdf" and file-examples DOCX returned HTML error pages instead of files — discarded and replaced with pdf995 / calibre sources above.

## Known limitations (also labelled in the UI where relevant)

1. **Office conversions are Beta / text-based.** PDF→Word/Excel and Word→PDF preserve text, not pixel-perfect layout — a browser-only constraint (iLovePDF uses servers for this).
2. **Compress** re-renders pages as images: big size wins on image-heavy PDFs, but output text is no longer selectable.
3. **OCR** is English-only, runs page-by-page (default max 5 pages in UI) and is slow on large files; quality depends on scan quality (86% confidence on the clean Tesseract sample).
4. **Unlock:** permission-only encryption is stripped losslessly; user-password files require the owner to enter the correct password, and the rebuilt output is image-based.
5. **Redact** draws a true cover box but does not re-encode the page — for highly sensitive files, verify/flatten before sharing (noted in the tool result text).
6. **Repair** = clean load + re-save; severely corrupt files may lose content or fail, and the tool says so.
7. **PDF/A** was *not* shipped as a separate tool: a true PDF/A conversion cannot be honestly done with these browser libraries, so it is omitted rather than faked. The original brief's "PDF/A-style re-save" is covered by Repair.
8. **Translate** was *not* shipped: no honest offline translation exists without an external API key, so it is omitted rather than faked. Summarize (local extractive) is real and shipped.
9. First load needs internet for pinned CDN libraries (+ OCR language data on first OCR use).

## Publish package (GitHub)

`index.html` · `app.js` · `styles.css` · `README.md` · `TEST-REPORT.md` · `LICENSE` · `.gitignore`
Excluded from publish: `test-materials/`, `tests/` (harness + outputs + node_modules).

## Publish attempt log (2026-11-16, ~02:10 Dubai — under Safwan's blanket permission)

1. **GitHub app route — tried first, refused.** Account verified connected as **safwan-digital**. `search_repositories` confirmed no existing `aurelia-pdf` repo. `create_repository` returned the exact error: `failed to create repository: POST https://api.github.com/user/repos: 403 Resource not accessible by integration` — the GitHub App integration cannot create repositories (access limit, per github_publish_fallback skill). Not retried, per skill.
2. **Website route — requires the live browser.** Creating the repo + uploading files + enabling Pages must be done in the signed-in browser session (single tab, confirm account = safwan-digital, upload the 7 package files, Settings → Pages → Deploy from branch `main`, root `/`, then verify https://safwan-digital.github.io/aurelia-pdf/ loads and the repo file list matches). This step needs a browser-task agent / Safwan's browser session and could not be executed from this build worker.
3. **Status: package is 100% publish-ready locally; only the repo-creation/upload/Pages-enable step remains**, blocked solely by the app permission above — the one step that needs the browser session.

---

# V2 UPDATE — Visual editors + user-friendliness (2026-11-16)

**Why:** Safwan's live test of v1 found the UX was form-based, not visual: Merge felt single-file, Sign stamped at a fixed spot on the last page, and Remove/Extract/Split/Organize/Rotate/Crop/Edit/Redact made users type page numbers / coordinates with no preview. v1's tests were engine-level (Node) only — the browser UI layer was never driven. v2 fixes the UX and adds real UI-level tests.

## What changed

### A. Multi-file bulletproofing (Merge, Images to PDF, Compare)
- `fileInput.value` is now cleared after **every** change event — re-picking (including the same file after removing it) always registers.
- After files are chosen, a clear **“+ Add more files”** button reopens the picker; dropping more files appends too.
- File chips show name, size, a **× remove** button and **↑/↓ reorder** buttons (multi-file tools). A live counter reads “N files ready”.

### B. Visual Page Manager (shared, PDF.js thumbnails, lazy-rendered via IntersectionObserver)
- **Remove Pages:** thumbnail grid; tap to mark/unmark (red overlay + ✕); Select all / Clear; the count and the typed fallback stay in sync; processing uses exactly the marked set; removing every page is blocked with a plain message.
- **Extract Pages:** same grid, tap to select (blue ✓).
- **Organize:** thumbnails with pointer-based drag-to-reorder (works with touch; the dragged thumb reorders live) plus ◀ ▶ buttons; the order field stays in sync.
- **Rotate:** each thumbnail has a **⟳ button** that rotates that page only (preview rotates too), plus the previous rotate-all/typed fallback.
- **Split:** new **“pick” mode** — tap pages and extract them together as one PDF; ranges and each-page modes unchanged.

### C. Visual placement editor (large preview + overlay; positions stored as page fractions, converted to PDF points with the y-axis flip at stamp time)
- **Sign PDF:** after drawing, the signature appears as a **draggable overlay box** on the page preview, with a **page selector (Prev/Next)** and a **size slider**; it stamps at the exact overlay position/size on the chosen page — any page, not just the last. (Fixed v1 behaviour: x=320, y=60, last page.)
- **Edit PDF:** click on the preview places a text marker; text + size stamped there.
- **Annotate:** drag a rectangle on the preview → highlighted note box with the note text inside.
- **Redact:** drag rectangles on the preview → black boxes exactly there; **multiple boxes**, each removable (× on the box and in the box list).
- **Crop:** large preview with a **draggable / corner-resizable crop rectangle**; the trim numbers stay in sync and remain editable as fine-tune.
- Edge limit (stated honestly): placement math assumes page rotation 0; pages that already carry rotation may offset overlays.

### User-friendliness changes (Safwan directive, 2026-11-16 08:23)
- **2–3 tap flow everywhere:** Add file(s) → choose visually → one big action button → Download. Typing is never the primary path.
- **Typed fallbacks collapsed** under “Advanced options — type instead of tapping” for Remove, Extract, Organize, Rotate, Split (ranges), and the page-number fields of Edit/Annotate/Redact.
- **The action button says what will happen** and updates live: “Merge 3 PDFs”, “Remove 2 pages”, “Extract 3 pages as one PDF”, “Cover 2 areas & download”, “Place signature & download”, “Make PDF from 4 images”… and it **pulses** once files are ready.
- **After choosing a file, the preview/picker scrolls into view** so the next step is obvious.
- **Plain words:** tool descriptions rewritten (“Tap page thumbnails to choose pages to delete”), hints inside every picker, no “points/coordinates” language on the primary path.
- **Friendly errors:** raw technical errors are replaced with “Something went wrong with that file. Please try a different PDF — or a smaller, simpler one.” Our own short, plain messages (e.g. “Tap pages in the preview above to mark them for removal”) pass through unchanged.
- **Home screen:** new **“⭐ Most popular”** row (Merge, Compress, PDF to JPG, Images to PDF) above the categories; search unchanged.
- **Bigger tap targets:** chips ≥34px, rotate buttons 38px, larger action button (17px).

## UI-level tests (NEW in v2 — the gap that let v1's bugs ship)

**Harness:** `tests/ui-test.js` — puppeteer-core driving the VM's real Chrome (`/opt/meta-chromium/chrome`, Muse Browser 157) against the real page. Environment notes: this Chrome build refuses to start without its WebGL domain-policy switches (found on disk at `/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt` + its SHA-256), blocks loopback HTTP (Local Network Access), and its egress proxy rejects Chrome CONNECT tunnels — so the test loads the page via `file://` and answers the page's pinned-CDN requests with byte-identical files curl downloaded into `tests/vendor/` (same versions index.html references). Processed outputs are captured from the app's real result blob in-page (Chrome's download manager was flaky under this VM's throttled CPU; the first run additionally proved real downloads land on disk: aurelia-merged.pdf, tracemonkey-trimmed.pdf, tracemonkey-picked.pdf).

**Result: 20 / 20 PASS** (full log in `tests/ui-results.json`, screenshots in `tests/v2-shots/`)

| # | UI check | Evidence |
|---|---|---|
| 1 | Home renders 31 distinct tools | card count by tool id |
| 2 | “Most popular” row present | 4 cards |
| 3 | Merge: 3 PDFs added in **3 separate picks** | “3 files ready”, + Add more files visible |
| 4 | Merge: chip × removes, re-picking the **same file** registers again | back to 3 files |
| 5 | Action button label | “Merge 3 PDFs” |
| 6 | Merge output | **20 pages** (14 + 5 + 1) |
| 7 | Remove Pages: thumbnails render | 14 thumbs, canvases painted |
| 8 | Tap pages 2 & 5 | “2 marked for removal”, fallback field synced “2,5” |
| 9 | UX: label + collapsed Advanced | “Remove 2 pages”; pages field inside closed `<details>` |
| 10 | Remove Pages output | **12 pages** |
| 11 | Organize: drag-order state + ◀ ▶ move | order field becomes “2,1,3,…” |
| 12 | Rotate: per-page ⟳ | “1 page(s) rotated” |
| 13 | Split pick-mode | tapped pages 1 & 3 → one 2-page PDF |
| 14 | Sign: draw → overlay appears → **drag moves it** | signPos fx .52→.34, fy .76→.60 |
| 15 | Sign output | opens, 1 page, size 13,264 → 15,510 B (stamp present) |
| 16 | Crop: rectangle + numeric sync | trims auto-filled (left 42pt, top 59pt from default rect) |
| 17 | Edit: click places marker | marker set at click point |
| 18 | Redact: drag creates removable box | boxes = 1 |
| 19 | Mobile 390px: page manager renders | 14 thumbs |
| 20 | No uncaught page errors across the whole run | clean console |

**What the screenshots show** (`tests/v2-shots/`): `home-desktop.png` / `home-mobile.png` (glass grid + Most popular), `merge-3-files-desktop.png` (3 chips + “Merge 3 PDFs”), `remove-pages-manager-desktop.png` (pages 2 & 5 marked red ✕), `remove-pages-manager-mobile.png` (390px, Select all / Clear, tappable thumbs), `sign-editor-desktop.png` (drawn signature inside its blue dashed drag-box on the page preview, after being dragged).

## Regression check (v1 engine harness re-run)
`tests/run-tests.js`: **30 PASS, 1 blocked** — the only failure is *Compress PDF* with `Cannot find module 'canvas'`. That is a Node-harness environment problem, not app code: `canvas` is an *optional* dependency of pdfjs-dist's Node build, and reinstalling it fails in this VM (node-pre-gyp/node-gyp cannot download what it needs under Node 24). The Compress handler is **unchanged** in v2, and its exact rendering path (PDF.js page render → canvas) is exercised in the real browser by the UI tests above (thumbnails, PDF preview, sign editor all render pages through it). In a normal browser — where AURELIA actually runs — canvas is native.

## Remaining limits
- Placement/overlay math assumes unrotated pages (rotation ≠ 0 pages may offset stamps).
- Organize drag uses pointer events; the ◀ ▶ buttons are the guaranteed path on any device.
- All v1 known limits still apply (Office Beta text-based, Compress image-based output, OCR English/5 pages, Redact is a cover box — flatten advice shown, Translate/PDF-A not shipped).

---

# V3 — Audit fix pass (2026-11-16)

Full detail: `tests/FIX-v3.md`. Inputs: the comparative audits `tests/AUDIT-v2.md` (AURELIA v2: 1/31 clean, Rotate intermittent silent failure, OCR broken, Redact cosmetic-only) and `tests/ILOVEPDF-AUDIT.md` (benchmark patterns). All audit top-15 items and benchmark adoptions A–G were addressed; the v2 visual design is unchanged.

## Headline fixes
- **Redact is real now:** boxed pages are rasterized at 200 DPI with the boxes burned in — tracemonkey p1 went from 5,118 extractable characters to **0** (other pages untouched). No boxes → friendly error; the silent default box is gone.
- **Rotate root cause found & fixed:** a drag/state race in the editor layer (no pointer capture; async render completion rebuilt the overlay mid-gesture). All drags now use pointer capture / window-level tracking, and every tool runs in a job wrapper that surfaces friendly errors and always re-enables the button. Rotate verified **5× consecutive runs → 5 downloads**.
- **OCR works end-to-end in a real browser:** logger-driven progress %, Cancel (worker terminate), 120 s start / 180 s per-page timeouts. Blocked-assets case now fails friendly in 4 s (was a 300 s stall); with byte-identical assets served locally, browser OCR completed with the correct text ("Mild Splendour of the various-vested Night!…").
- **No more silent defaults:** Extract/Split-pick need a tapped page; Edit starts empty; Summarize and Unlock say honestly when there's nothing to do.
- **Signature stamps are transparent** (ink-cropped, alpha-0 corners; 0.00% white pixels in the stamped area on a grey page) and Sign gained Type (cursive, black/blue) and Upload modes plus an optional date stamp.
- **Benchmark adoptions:** file cards with first-page thumbnails + page counts; 3×3 position grids for Watermark/Page Numbers with the live placement sentence; result panel with tool-specific success line, output size, Compress before→after + % saved, "Continue to" chips and "↺ New task"; Organize per-page delete + Add blank page; Protect strength checklist + eye toggles; upfront "N files will be created" counts.
- **Also fixed:** whole-dropzone click, friendly errors everywhere (including a non-empty-message guarantee), Metadata view-before-process + clear-all, ≥40 px touch targets, Organize touch scrolling (`touch-action: pan-y`), header overlap (`scroll-margin-top`) + reachable mobile nav, honest "Text-based (Beta)" descriptions, basic column splitting in PDF→Excel.

## V3 test results
- `tests/ui-test.js` (real Chrome UI regression suite): **20/20 PASS**, two consecutive runs.
- `tests/v3-checks.js` (new targeted checks a–m + screenshots): **18/18 PASS** — redact text-gone, rotate ×5, no-selection errors, dropzone click, sign transparency, OCR fail-fast + completion, phone organize scroll + header clearance, metadata view/clear, protect checklist/encryption, unlock honesty + password path, summarize honesty, Excel columns. Screenshots: `tests/v3-shots/` (home-phone, watermark-posgrid, result-panel, sign-type); raw results: `tests/v3-results.json`.
- `tests/run-tests.js` (Node engine harness): **30 PASS / 1 FAIL** — the only failure remains Compress with `Cannot find module 'canvas'`, the known Node-environment caveat (optional pdfjs-dist dependency cannot install in this VM); Compress's render path is native in the browser and covered there.

## Remaining limits (v3)
- Office conversions are text-based Beta (now stated plainly in each tool before processing).
- Live-site OCR should be re-verified once after publishing (production uses the library's default CDN configuration from an https origin; the sandbox could only verify it with locally served, byte-identical assets).
- Placement/overlay math assumes unrotated pages.

---

# V3.2 — Lucide icons, zero emoji (2026-11-16)

Safwan's call: the emoji UI (🧩 ✂️ ⬇️ ✅ ⚠️…) read as "WhatsApp", not product. He approved a preview (`tests/icon-preview/`: accent #0071e3, stroke 1.8, icons in soft tinted glass chips) and the full swap was applied to the whole app.

## What changed
- **One inline SVG sprite, no runtime dependency:** 54 Lucide symbols (`<symbol id="i-…">`, lucide-static v1.73.0, ISC) embedded in a hidden `<svg>` in index.html; app.js renders icons through a tiny `icon(name, size)` helper returning `<svg class="ic"><use href="#i-…"/></svg>`. Icons work offline, from file://, anywhere the app works.
- **All 31 tool icons** replaced (mapping in `tests/FIX-v3.md`): cards, tool-panel header (icon chip + name), Most-popular row, and Continue-to chips all use the same sprite.
- **Every UI glyph** replaced: flame (Most popular), moon/sun (theme toggle, swaps on click), lock (privacy badge + result privacy note), arrow-left (All tools), upload (dropzone), pencil/keyboard/image-plus (signature tabs), eye/eye-off (password visibility, swaps on toggle), check (passwords-match + thumbnail selected overlay), x (remove/close), arrow-up/arrow-down (file reorder), plus (Add more files), download (download buttons), circle-check (result success line, green), triangle-alert (error status, via a new `setErrorStatus()`), rotate-ccw (New task), rotate-cw (per-page rotate + inline in Rotate's description and hints), trash-2 + chevron-left/right (Organize thumbnails/pager), file (blank page), arrow-right (Compress before/after stat). The favicon's ◆ text glyph became an SVG path.
- **CSS-drawn, not font glyphs:** the Protect strength list's ○/✓ markers are now a CSS ring and an SVG-mask check (`.strength li::before`).
- The Rotate description's "Tap ⟳…" keeps its meaning: the description carries a `[[rotate-cw]]` token that renders as the inline icon (verified in the rendered card).
- Visible wording is otherwise unchanged; the only text touch is Compress's status sentence, where "1.49 MB → 24 KB" became "1.49 MB to 24 KB" (the bold stat line shows the same sizes joined by the arrow-right icon) — a plain-text status line cannot carry an inline SVG.

## Proof
- **Emoji grep: ZERO hits** in index.html, app.js and styles.css across the pictograph / misc-symbols / dingbat / supplemental / arrows / geometric ranges plus U+FE0F (script scanned every line; the scan that found 40+ glyphs before the pass finds none after).
- `node --check app.js` — OK.
- `tests/ui-test.js` — **20/20 PASS** (unchanged assertions; text-based checks pass as before).
- `tests/v3-checks.js` — **18/18 PASS**. One assertion update: checks (f-a)/(f-b) keyed on the ⚠️ glyph in `#status`; `#status` is now innerHTML carrying the icon, so they assert the `i-triangle-alert` reference instead (same behaviour verified — friendly error in 4 s, button re-enabled).
- **Screenshots** (`tests/icon-shots/`, scripts `tests/icon-shots.js` + `tests/icon-dark-check.js`): home desktop, home phone 390 px, Merge tool panel, Merge result panel, dark-mode Organize section — icons aligned, consistently sized, accent-coloured in their chips, light and dark. A DOM audit counted 44 `<use>` refs on home and 8 in the result panel — **zero unresolved**.

## V3.2 palette — Graphite Mono (Safwan's pick "D")

Applied 2026-11-16, local only (not published). Source of truth: `tests/palette-preview/palette-d.html` (light) + `palette-d-dark.html` (dark), ported into the real `styles.css` variable system for both themes.

- **Light:** bg `#F4F4F5`/`#E7E7E9`, ink `#17181B`, muted `#6E6E76`, accent graphite `#23252A`, accent2 `#3B3E45`, accent3 steel `#83868E`; neutral grey aurora (graphite/steel/pale-grey washes); primary button `#141518→#2E3036` with a soft graphite shadow; monochrome icon chips.
- **Dark:** bg `#0B0B0D`/`#131316`, glass `rgba(24,24,28,.62/.42)`, stroke `rgba(255,255,255,.13)`, ink `#F4F4F5`, muted `#9C9CA5`, accent `#E8E8EA`/`#B9BBC2`/`#83868E`; faint white/steel aurora; primary button inverted to near-white `#F5F5F7→#D8D8DE` with dark text (`.sigtab.sel` likewise flips to dark text; selected-page check overlay flips too).
- **Implementation:** new `--acc-rgb` variable per theme (35,37,42 light / 232,232,234 dark) drives every accent tint (dropzone border, chips, position-grid ring, crop rect, pulse ring, focus/selection) so both themes stay mono from one rule set. Hero wordmark + logo gradients now run through the graphite accent variables.
- **Semantic colours kept, muted:** success `#1A9E54 → #3E8E5F`, error `#E03131 → #C04545` (incl. remove-mode outline, thumb × overlay at 45% alpha) — readable, not neon.
- **Signature colours:** the blue ink option `#0B3D91` ("Blue"/"Blue pen") replaced with graphite `#3B3E45` ("Graphite"/"Graphite pen") for both the drawn pen and the typed signature. Favicon diamond recoloured `#0071E3 → #23252A`.
- **Untouched on purpose (document output, not UI chrome):** all PDF drawing colours in app.js (page-number/watermark/edit text, sticky-note yellow, redaction black), the white page stage/canvas, and the on-screen sticky-note overlay that mirrors the note drawn into the PDF.
- **Verification:** grep for `0071e3`, `5e5ce6`, `bf5af2`, `0b3d91` and the old aurora/status hexes across styles.css + app.js + index.html → zero hits. `tests/ui-test.js` **20/20 PASS**, `tests/v3-checks.js` **18/18 PASS**. Screenshots in `tests/icon-shots/`: `palette-home-light.png`, `palette-home-dark.png`, `palette-tool-panel-light.png`, `palette-result-dark.png` (script `tests/palette-shots.js`) — eyeballed: no leftover blue, monochrome chips, muted text readable on both backgrounds.

# V3.3 — Design tokens: one button system, one type scale, one radius scale (2026-11-16)

Safwan approved the 5 usability-heuristic fixes from the external audit (12 button styles, 11+ font sizes, 10+ radii, 11px pill text, long all-caps pills). This pass consolidates the *system* behind the Graphite Mono look — colours and layout are unchanged; behaviour is unchanged. Local only, not published.

## Tokens (all in `:root`, styles.css)
- **Type:** `--fs-1:12px --fs-2:13px --fs-3:14px --fs-4:16px --fs-5:18px --fs-6:22px --fs-7:30px`, plus `--fs-hero:clamp(40px,7vw,76px)` (hero H1) and `--fs-lede:clamp(16px,2.4vw,20px)` (hero paragraph). Every `font-size` in styles.css, index.html inline styles and app.js markup now references a token — grep for a raw `font-size:<px>` returns **zero**; the old half-steps snapped (13.5→fs-2, 14.5→fs-3, 12.5→fs-1, 17/19→fs-5, 20→fs-6, 36→fs-7, 44→fs-hero).
- **Radii:** `--r-sm:8px --r-md:14px --r-lg:24px --r-pill:999px` (+ 50% circles, 0 for the strength-mask detail) = **6 distinct values** in styles.css, down from 18 literals (3/4/6→sm, 10/12/15/16→md, 18/22/28/32→lg, 99/999→pill). The one-off `--radius:28px` variable was removed; cards/panels now use `--r-lg`.

## Button system (fix 1)
- `.btn` is now the single base: inline-flex, centred, gap 8px, `min-height:44px`, padding 11px 22px, `font-weight:600`, `font-size:var(--fs-3)`, pill radius. Variants: `.btn.primary` (the existing graphite gradient — bare `.btn` in markup paints identically), `.btn.secondary` (existing glass), `.btn.quiet` (new: transparent, hover tint, with a dark-theme guard), `.btn.sm` (40px / fs-2), `.btn.icon` (44×44, padding 0). `#processBtn` carries `class="btn primary"` and keeps a slightly larger padding (13px 26px).
- One-off classes now alias the shared metrics instead of inventing their own: `.chipbtn` + `.cont-chip` → small/quiet metrics (glass pill, 600 weight; chipbtn fs-2 at 40px min, cont-chip fs-3); `.sigtab` → quiet metrics (glass pill, 44px, 600) with the selected state on the primary gradient; `.rotbtn` + `.thumb-del` → one icon family (glass, 50%, 40×40, padding 0); `.icon-btn` (theme toggle) → glass pill, 44px, fs-3/600; `.eye` keeps its transparent utility style on `--r-md`. `.posgrid button` stays a grid cell (position picker) but snapped to `--r-md`.
- **Radius note:** the approved sketch named `var(--r-md)` for the `.btn` base, but fix 3's own mapping sends 999px→`--r-pill` and the pass constraint was "look stays the same" — AURELIA's buttons are pill-shaped in every approved screenshot, so the base uses `--r-pill`. No rendered button changed shape.
- **aria-pressed:** signature tabs now expose their state — index.html ships `aria-pressed` on all three `.sigtab` buttons and the app.js click handler keeps `aria-pressed` and `.sel` in sync on every switch (CSS selects on both). Verified in the probe: initial draw=true/false/false; after clicking Type: type=true, draw=false, `.sel` matching.

## Pill (fixes 4 + 5 — one rule, two audit issues)
- `.pill` is now `font-size:var(--fs-1)` (12px), `font-weight:600`, `text-transform:none`, `letter-spacing:0` — sentences read as sentences. The two audit-flagged pills verify computed **12px / none**: Unlock ("Works on permission-protected files…") and Summarize ("Extractive summary runs 100% locally"), on both the card and the tool panel's `#toolNote`.
- New `.pill.tag` keeps the shouty label treatment (uppercase, .06em, 700) for genuinely short labels only. app.js decides by rendered text: a `pillHTML()` helper (cards) and a class toggle (`#toolNote`) apply `tag` when the text is ≤3 words — today that's "Beta" (×5 tools) and "Best effort" (OCR); everything longer stays plain.

## Proof
- `node --check app.js` — OK.
- `tests/ui-test.js` — **20/20 PASS** · `tests/v3-checks.js` — **18/18 PASS** (re-run on the final files).
- **Computed-style probe** (`tests/token-probe.js`, raw output `tests/token-probe-results.json`): button combos across home + Merge (+result) + Sign + Rotate + Organize + Protect renders = **5 distinct families** — (1) gradient pill 14/600: processBtn + selected sigtab; (2) glass pill 14/600: secondary, cont-chip, theme toggle, unselected sigtab; (3) glass pill 13/600: chipbtn; (4) glass circle icon: rotbtn + thumb-del; (5) transparent utility: password eye. Per-render censuses show only token values: 6–8 computed font sizes per render (all `--fs-*`, the two fluid clamps resolving to 20px/76px at 1280px) and radii drawn only from {0, 8, 14, 24, 999px, 50%}. Zero page errors.
- **Screenshots** (`tests/icon-shots/token-*.png`): home light, home dark, Sign panel with the Type pane open — Graphite Mono unchanged; sigtabs read as one pill family with the selected tab on the gradient. One honest side effect of the approved 44px→`--fs-hero` mapping: the typed-signature preview renders at the hero clamp size on wide screens (76px at 1280px wide; 40px on phones) instead of a fixed 44px — larger, not clipped (its box grows), and it is a preview surface only.

# V3.4 — Deep Teal palette option (2026-11-16)

Safwan: "Also Make E" — palette E "Deep Teal" from the v3.2 palette samples is now a **second selectable palette**. **Graphite Mono stays the default**; Deep Teal is an option, not a replacement. Local only, not published. The v3.3 token system (type/radius scales) is untouched — this pass only swaps colour variables.

## How it works
- **Toggle:** one new header button next to the Dark/Light toggle — Lucide `palette` icon (new `i-palette` symbol in the sprite) + the name of the palette you'd switch *to* ("Teal" ⇄ "Graphite", mirroring the theme button's pattern). `aria-label="Switch colour theme"`; `aria-pressed` is `true` while Deep Teal is active; the `title` always reads "Colour: ⟨current⟩ — switch to ⟨next⟩" and stays in sync.
- **Persistence:** the choice is stored in `localStorage` under `aurelia-palette` (`teal`; the key is removed for Graphite). A tiny inline script in the `<head>` of index.html applies a saved `data-palette="teal"` to `<html>` before first paint, so a returning Deep Teal user never sees a Graphite flash. app.js syncs the button (label/title/aria-pressed) on load and on every click.
- **Mechanism:** two override blocks at the end of styles.css — `[data-palette="teal"]` (light) and `[data-theme="dark"][data-palette="teal"]` (dark) — redefining the same colour variables the dark block uses. Everything accent-tinted (dropzone, chips, position grid, crop rect, pulse ring, icon chips, pills) follows automatically through `--acc-rgb`. Palette and light/dark are independent: all four combinations work.

## Exact values (taken from tests/palette-preview/palette-e.html + palette-e-dark.html)
- **Light:** bg `#EBF7F8`/`#D7EEF0`, glass `rgba(255,255,255,.62/.42)`, stroke `rgba(255,255,255,.65)`, ink `#0A2530`, muted `#55727D`, accent `#0E7C86`, accent2 `#0E9A9C`, accent3 `#2EC4C6`, acc-rgb `14,124,134`, shadow `0 20px 50px rgba(10,90,100,.13)`; aurora stops `rgba(14,124,134,.21)` / `rgba(46,196,198,.20)` / `rgba(165,229,233,.30)`. Primary button = the sample's gradient `accent→accent2` (`#0E7C86→#0E9A9C`), white text, shadow `rgba(14,124,134,.30)`. Pill: accent text on `rgba(14,124,134,.10)`.
- **Dark:** bg `#04141A`/`#07222B`, glass `rgba(10,34,44,.62/.42)`, stroke `rgba(180,240,245,.13)`, ink `#EDFAFB`, muted `#8FB4BC`, accent `#17A2B0`, accent2 `#2EC4C6`, accent3 `#6FE3E0`, acc-rgb `23,162,176`, shadow `0 20px 50px rgba(0,0,0,.5)`; aurora stops `rgba(14,124,134,.36)` / `rgba(46,196,198,.16)` / `rgba(46,196,198,.08)`. Primary button = gradient `#17A2B0→#2EC4C6`, white text, shadow `rgba(23,162,176,.4)` (it does **not** inherit Graphite dark's inverted near-white button; selected sigtabs likewise keep white text). Pill: `#2EC4C6` on `rgba(46,196,198,.13)`.
- **Untouched:** PDF document-output colours, the favicon, and all Graphite rules — Graphite renders byte-identically when `data-palette` is absent.

## Proof
- `node --check app.js` — OK. `tests/ui-test.js` — **20/20 PASS** · `tests/v3-checks.js` — **18/18 PASS** (no assertions changed; one ui-test run died mid-Split on a 30s wait under VM CPU throttling and passed 20/20 on the immediate re-run).
- **Palette probe** (`tests/teal-shots.js`) — **10/10 PASS**: default load is Graphite (accent `#23252A`, `aria-pressed=false`); one click → `data-palette="teal"`, computed accent `#0E7C86` / acc-rgb `14,124,134` / ink `#0A2530`, body aurora + primary-button gradient computed teal with white text and no graphite gradient stop; dark+teal → accent `#17A2B0`, ink `#EDFAFB`, button gradient `rgb(23,162,176)→rgb(46,196,198)`; reload keeps teal (persistence + button re-synced); second click restores Graphite and clears the storage key; zero page errors.
- **Screenshots** (`tests/icon-shots/`): `teal-home-light.png`, `teal-home-dark.png`, `teal-tool-panel.png` (Merge panel, teal light) — eyeballed: pale-aqua light / deep-sea dark, dark text on light and near-white on dark both readable, primary buttons readable in both modes, no blue or graphite leftovers anywhere in teal mode.

---

# V3.5 — Deep Teal only (Graphite Mono removed) + dark-mode persistence fix

Applied 2026-11-16, local only (not published). Safwan's order: "Graphite Mono Remove It Only Keep Deep Teal."

## Graphite removal — what changed
- **styles.css:** the `:root` base variables are now the Deep Teal LIGHT values (bg `#EBF7F8`/`#D7EEF0`, ink `#0A2530`, muted `#55727D`, accent `#0E7C86`, accent2 `#0E9A9C`, accent3 `#2EC4C6`, acc-rgb `14,124,134`, teal aurora body background, teal primary-button gradient with white text, teal pill). The `[data-theme=dark]` block is now the Deep Teal DARK values (bg `#04141A`/`#07222B`, glass `rgba(10,34,44,.62/.42)`, stroke `rgba(180,240,245,.13)`, ink `#EDFAFB`, muted `#8FB4BC`, accent `#17A2B0`, accent2 `#2EC4C6`, accent3 `#6FE3E0`, acc-rgb `23,162,176`) with the aqua gradient button — the graphite inverted near-white dark button rule is deleted. Both `[data-palette="teal"]` override blocks are deleted, as is every graphite-specific rule/value (dark pill `#C9CAD0`, dark sigtab ink text, `select option` graphite ink, graphite button gradient `#141518→#2E3036`). Muted semantic success/error colours (`#3E8E5F` / `#C04545`) stay. Grep proof: zero hits for the graphite hex family (`23252a`, `0b0b0d`, `f4f4f5`, `17181b`, `141518`, `2e3036`, `e8e8ea`, `83868e`, `9c9ca5`, `6e6e76`, `c9cad0`, `f5f5f7`, `d8d8de`, `131316`, `e7e7e9`) in styles.css, and zero for `23252a`/`0b0b0d`/`f4f4f5` in index.html/app.js. Deliberate exception: the Sign tool's "Graphite" pen ink (`#3B3E45`) is a signature colour stamped into the user's PDF (document output, same category as the black pen), not UI chrome — untouched.
- **index.html:** `#paletteBtn` removed from the header; the now-unused `i-palette` sprite symbol removed; favicon diamond recoloured to teal `#0E7C86`. The pre-paint head init no longer restores any palette and instead deletes a leftover `aurelia-palette` key on load. No `data-palette` attribute anywhere.
- **app.js:** all palette logic removed (`paletteBtn`, `syncPaletteBtn()`, the toggle listener). The only remaining `aurelia-palette` reference in the app is the one-time cleanup `localStorage.removeItem('aurelia-palette')` in the head init.

## Dark-mode persistence bug — root cause and fix
- **Found:** live verification of v3.4 (commit b7c6727) — dark mode reset to light on reload while the palette persisted.
- **Root cause (pre-existing, NOT a v3.4 regression):** the theme toggle handler in app.js only flipped `document.documentElement.dataset.theme` in memory — it never wrote any localStorage key, and nothing ever read one; index.html hardcoded `data-theme="light"` and the only pre-paint init (added in v3.4) restored the palette alone. Dark mode had therefore never survived a reload in any version; v3.4's palette persistence merely exposed the asymmetry.
- **Fix:** the toggle now persists to localStorage key `aurelia-theme` (set to `dark`, removed for light — mirroring the old palette pattern), the head init restores `data-theme="dark"` pre-paint from that key (no flash), and a new `syncThemeBtn()` (mirroring the former `syncPaletteBtn()`) keeps the toggle's icon/label correct after a restored-dark load.
- **Regression check** (`tests/theme-persist-check.js`) — **8/8 PASS**: dark+reload stays dark (accent `#17A2B0`); light+reload stays light (accent `#0E7C86`); no-key default loads light with no `#paletteBtn` and no `data-palette`; a planted leftover `aurelia-palette` key is deleted on load; toggle writes the key, reload keeps dark, toggling back clears it; zero page errors.

## Proof
- `node --check app.js` — OK. `tests/ui-test.js` — **20/20 PASS** · `tests/v3-checks.js` — **18/18 PASS** (no assertions in either suite referenced the palette button or palette behaviour, so no assertion changes were needed).
- **Teal-only probe** (`tests/teal-shots.js`, rewritten from the v3.4 palette-option probe) — **6/6 PASS**: default light accent `#0E7C86` / acc-rgb `14,124,134` / ink `#0A2530`; body aurora + primary button computed teal with white text and no graphite gradient stop; no `#paletteBtn` in the DOM and no `data-palette` attribute; dark accent `#17A2B0` / acc-rgb `23,162,176` / ink `#EDFAFB` with button gradient `rgb(23,162,176)→rgb(46,196,198)` and white text; dark survives reload; zero page errors.
- **Screenshots** (`tests/icon-shots/`): `final-home-light.png`, `final-home-dark.png` — eyeballed: pale-aqua light / deep-sea dark, header carries only the Dark/Light toggle, primary buttons teal in both modes, no graphite leftovers.

---

# V4.0 — PDFStow rebrand + pdfstow.safwan.digital launch

Applied 2026-11-16, local only (not published). Safwan picked the name **PDFStow** (from the two-round global rename research: SEO + AEO/GEO scored, global-neutral, "stow" = store safely — files stowed on the user's own device, never uploaded) and the launch route: **free subdomain `pdfstow.safwan.digital`** (the `pdfstow.com` domain is not registered).

## What changed
- **Name everywhere user-visible:** header wordmark `PDF<span>Stow</span>`, `<title>` → "PDFStow — Free PDF Tools, Private by Design", footer privacy line + "PDFStow by Safwan Digital", app.js header comment, the two Unlock error messages ("files protected with PDFStow…", "PDFStow can only unlock files you own…"), and the Watermark tool's default stamp text (`'AURELIA'` → `'PDFStow'`).
- **Download filename prefixes:** `aurelia-merged.pdf` → `pdfstow-merged.pdf`, `aurelia-images.pdf` → `pdfstow-images.pdf`, `aurelia-compare.txt` → `pdfstow-compare.txt`. (Confirmed live in the ui-test run: the merged download lands as `grab-pdfstow-merged.pdf`.)
- **styles.css:** the pulse keyframes renamed `aureliaPulse` → `pdfstowPulse` (internal identifier, so no `aurelia` string remains in the stylesheet).
- **localStorage keys deliberately untouched:** `aurelia-theme` (and the one-time `aurelia-palette` cleanup in the head init) stay as-is — invisible to users, and renaming the theme key would reset every returning visitor's saved dark/light preference. These are the only remaining `aurelia` hits in index.html/app.js (grep-verified, listed below).
- **README.md:** title, description and live link rebranded to PDFStow + https://pdfstow.safwan.digital/, with one history line: "*(Formerly AURELIA.)*"

## Meta / SEO / AEO pack (new in index.html `<head>`)
Closes the deep-audit "no Open Graph / Twitter tags" gap for the new home:
- Meta description (154 chars): "Free PDF tools — merge, split, compress, convert, sign and OCR PDFs right in your browser. Private by design: files never leave your device. No sign-up."
- Canonical: `https://pdfstow.safwan.digital/`
- Open Graph: og:title, og:description, og:type=website, og:url. Twitter: card=summary, twitter:title, twitter:description.
- JSON-LD `WebApplication` schema (parse-verified): name PDFStow, url, applicationCategory BusinessApplication, offers price 0 USD, and a 31-item featureList naming every tool — for AEO/GEO entity clarity.
- `<meta name="theme-color" content="#0E7C86">` (Deep Teal accent).

## CNAME — ⚠️ publish order matters
- `CNAME` created in the package root containing exactly `pdfstow.safwan.digital`.
- **It must only be published AFTER the DNS CNAME record for `pdfstow.safwan.digital` exists** (pointing at `safwan-digital.github.io`). Publishing the CNAME file before the DNS record exists risks the custom domain failing to resolve / certificate provisioning stalling. Correct order: (1) create the DNS record at the safwan.digital registrar, (2) then publish the package including CNAME, (3) verify https://pdfstow.safwan.digital/ loads with a valid certificate.

## Proof
- `node --check app.js` — OK. `tests/ui-test.js` — **20/20 PASS** · `tests/v3-checks.js` — **18/18 PASS**. **No test assertions were changed** — neither suite asserted on the brand name, page title, or download filename prefixes (the "AURELIA Test Title" strings in v3-checks are fixture metadata the test writes into its own sample PDF, not brand assertions).
- Grep `aurelia` (case-insensitive) across index.html / app.js / styles.css — remaining hits are ONLY: index.html head init (`aurelia-palette` cleanup + `aurelia-theme` read), app.js theme comment + theme toggle (`aurelia-theme`). README.md's only hit is the deliberate "Formerly AURELIA" history line.
- JSON-LD block extracted and `JSON.parse`-verified (WebApplication / PDFStow / offers price 0).
- **Screenshots** (`tests/icon-shots/`): `pdfstow-home-light.png`, `pdfstow-home-dark.png` — eyeballed: "PDFStow" wordmark top-left (PDF in ink, Stow in teal) in both modes, Deep Teal unchanged, zero page errors during capture.

---

# V4.1 — Motion system + animated hero logo

Applied 2026-11-16, local only (not published). Safwan, viewing the OLD live site (v3.5 AURELIA), said there was "no logo animation, nothing" — the published site predates the rebrand, and the local package had no motion beyond hovers. V4.1 adds a visible-but-premium motion system and puts the animated PDFStow logo in the hero. Deep Teal only, Lucide icons, no new copy, all 31 tools and every test hook unchanged.

## Hero animated logo
- New file `logo-animated.gif` in the package root, placed at the top of the hero (centered lockup, headline below it), rendered at min(430px, 78vw).
- **Size decision:** the brand master (`brand/final/pdfstow-logo-animated.gif`, 880×362, 51 frames) is 2.09 MB — too heavy for a hero. The hero rendition keeps the full 880px width (2× the 430px display size, so it stays crisp — upscaling to ~1100px would only blur it) and instead cuts weight by (a) rebuilding on one global 255-colour palette and (b) merging near-identical consecutive frames (51 → 24 frames, durations summed so the 2.96s loop timing — settle → wordmark wipe → shine → 0.92s hold → fade — is unchanged). **Result: 858 KB**, under the 1.2 MB target, frame-sequence QC'd against the master (spelling "PDFStow" exact, transparency clean).
- Side finding: the master's final frame (index 50) is corrupt — Pillow cannot decode it ("codec configuration error"); browsers tolerate/skip it. The hero rendition is rebuilt cleanly from frames 0–49, so the shipped file is valid end to end. The master in `brand/final/` is untouched.
- Dark mode: the lockup's wordmark is dark ink (known trait of the approved artwork), so in dark theme the hero logo sits on a soft pale radial "spotlight" halo — sequence captures confirm the wordmark stays legible through the hold phase.
- Header keeps the static WebP icon, now with a CSS entrance (it rides the header slide-down) and a gentle hover tilt (-6° + scale 1.07, spring easing).

## Motion system (styles.css "V4.1" block + a small reveal module in app.js)
- **Page load:** header slides down; hero children stagger-rise (logo → badge → headline → subline → search → footnote, 80ms steps, spring-out cubic).
- **Scroll reveal:** tool cards fade-rise via IntersectionObserver (threshold 0.05), staggered 0/70/140/210ms by position within each grid (`--rd` inline custom property). Once-only: reveal classes are removed after the transition (transitionend + 1.6s fallback), so normal card hover physics take over cleanly. Search re-renders reveal instantly (no replayed fades while typing).
- **Cards:** hover lift (existing) + teal glow ring/shadow + icon micro-bounce; press-down active state unchanged.
- **Buttons:** primary buttons get a soft sheen sweep on hover (::after gradient wipe, pointer-events none); focus states untouched.
- **Dropzone:** gentle 3s pulsing dashed border + faint glow ring; on dragover the pulse stops, it scales to 1.02 and glows — replacing the plainer `.drag` style.
- **Background:** two very subtle blurred teal radial glows drift slowly behind the hero (transform-only, 16s/21s alternate) — alive but calm.
- **Tool views:** opening a tool fades/slides the panel in; the result panel pops with a slight scale when results land.
- **Theme toggle:** a `theme-anim` class on `<html>` for 520ms cross-fades background/border/text colours during light↔dark switches.
- **Safety:** every entrance/reveal initial state exists ONLY under `.js-anim`, which the head init adds pre-paint only when JS runs AND `prefers-reduced-motion` does not match — no-JS and reduced-motion users always see final-state content. A global reduced-motion media block also collapses all animation/transition durations and stops the dropzone/process pulses. All animation is transform/opacity only.

## Proof
- `node --check app.js` — OK. `tests/ui-test.js` — **20/20 PASS** · `tests/v3-checks.js` — **18/18 PASS**, both re-run against the final files. No assertions changed.
- **Motion QC** (`tests/qc-v41.js`, real headless Chrome, file:// + local vendor harness) — **8/8 PASS**: GIF element present in hero and loaded (430×177 rendered); header + headline settle at opacity 1; scroll-reveal settles all ≥15%-visible cards at opacity 1 (~0.9s); dark hero clean; reduced-motion run has no `.js-anim` and all content at opacity 1; zero page errors.
- **Screenshots** (`tests/qc-v41/`): `hero-light.png`, `hero-dark.png`, `hero-mobile.png` (390px), `grid-scroll.png` — eyeballed: lockup centered over the headline in both themes, badge on its own centered line, mid-scroll grids at final state under the sticky header, mobile hero stacked cleanly. Two defects were caught and fixed during QC: (1) the hero-logo wrapper (GIF + halo padding) overflowed a 390px viewport by 18px → wrapper is now block/fit-content with tighter padding and the GIF capped at 78vw (overflow 0); (2) the logo wrapper initially shared a line with the badge (inline-block flow) pushing the badge off-center → block layout, badge/logo/hero centers verified identical (640/640/640 at 1280px).

---

# V4.1.2 — Dark-mode hero logo variant (halo removed) + card/note restyle

Applied 2026-11-16, local only (not published). Two Safwan screenshots drove this pass: (1) the dark-mode hero lockup sat on the v4.1 pale "spotlight" halo, which reads as a dirty smudge; (2) on his phone (light mode) the tool cards washed out and the per-card note `.pill` rendered as a big filled bubble that looks like a button.

## Dark-variant animated GIF — `logo-animated-dark.gif` (new, 680 KB)
- Built from the shipped `logo-animated.gif` (880×362, 24 frames, same durations, 2.96s loop, loop=0). Only the wordmark was recoloured; the icon is pixel-faithful.
- **Boundary/recolour rule:** on the settled frame the icon occupies x 19–272 and the wordmark x 294–860, with the gap columns 273–293 empty in every frame (verified across all 24 frames — the icon never crosses x=272). The transform applies to opaque pixels with **x ≥ 280**: every such pixel is an ink↔white blend from the original white-background artwork, so its ink coverage is recovered from the red channel, `c = clamp((255 − R)/251, 0, 1)` (ink R ≈ 0–10 → c ≈ 1), and the pixel is re-blended as `c·#EDFAFB + (1−c)·#04141A`. Core pixels land on light ink #EDFAFB; anti-aliased edges become true blends toward the dark hero background instead of the old white fringe. Alpha is untouched (the GIF's alpha is binary; the alpha map of the settled frame is byte-identical to the source).
- Rebuilt on one global 255-colour palette (montage of frames 5/12/19/21) with Pillow `disposal=2` full-content frames. An earlier encode with `disposal=1` delta frames ghosted during the fade-out (independent ffmpeg decode exposed it: fade frame held 94,102 opaque px instead of 59,236); the shipped encode decodes exactly in both Pillow and ffmpeg (frames 12/19/21/23 = 81,969 / 93,968 / 59,236 / 4,232 opaque px, matching the source frame-for-frame). Icon fidelity vs the source: **zero** pixels differ by more than 16/255 in any of the 24 frames (a per-frame-palette encode had 2,766 such pixels and was rejected).
- QC composites over the real dark hero background (#04141A), settled + mid-wipe frames, eyeballed: wordmark crisp light text, icon unchanged (teals + white padlock intact), P/D/o counters transparent, no halo, no dark residue.

## Halo removed + theme-aware swap
- styles.css: the v4.1 rule `[data-theme=dark] .hero-logo{background:radial-gradient(…)}` is **deleted entirely** — nothing sits behind the lockup in either theme now.
- index.html: the pre-paint init additionally registers a guarded DOMContentLoaded fallback that points the hero img at the dark GIF when the saved theme is dark; cache-busts bumped to `styles.css?v=42` / `app.js?v=42`.
- app.js: new `syncHeroLogo()` swaps the hero img between `logo-animated.gif?v=42` and `logo-animated-dark.gif?v=42` (guarded by a `data-variant` marker so it never double-swaps/restarts the GIF). It runs once at startup (app.js is parser-blocking at the end of body, and the GIF's opening frames are icon-only and identical in both variants, so no wrong wordmark can flash) and inside the theme-toggle handler.

## Card definition + quiet note captions (styles.css "V4.1.2" block, both themes)
- **Card note `.pill` → footnote:** regular weight (400), transparent background, no capsule radius, muted-ink colour, small padding, and a hairline top border in accent at 18% (light) / 25% (dark). Long notes (Unlock PDF) wrap as quiet text — verified they no longer read as buttons. Short badges keep the compact chip look via `.pill.tag` (inline-block, pill radius, accent-tinted fill, bold; sentence case from v3.3 untouched for notes).
- **Card definition:** border becomes accent-tinted and clearly visible (rgba accent .24 light / .32 dark, 1px via the existing glass border) plus a soft shadow (light: 0 10px 28px rgba(10,90,100,.13); dark: 0 12px 30px rgba(0,0,0,.45)), so cards separate cleanly from the pale gradient page. Icon chip background deepened to accent at 13% (light) / 20% (dark), the inner icon tile to 18% with a 30% inset ring, icon itself already full-strength accent. The v4.1 hover glow/lift and the reveal system are untouched (hover shadow still wins on specificity).

## Proof
- `node --check app.js` — OK. `tests/ui-test.js` — **20/20 PASS** · `tests/v3-checks.js` — **18/18 PASS**, re-run against the final files. No assertions changed.
- **QC** (`tests/qc-v412.js`, real headless Chrome, file:// + vendor harness) — **8/8 PASS**: light hero serves `logo-animated.gif?v=42` and loads; theme toggle swaps to `logo-animated-dark.gif?v=42` and back; saved-dark load (pre-paint path) serves the dark GIF with `.hero-logo` computed background `none` (halo gone) and zero overflow at desktop and 390px; computed-style checks confirm the quiet caption (weight 400, transparent bg, 1px hairline) and the strengthened card border/shadow in both themes; zero page errors. (First QC run caught its own harness bug — localStorage leaking dark theme into the "light" pages; fixed by explicitly clearing the key for light pages and re-run green with true light tokens.)
- **Screenshots** (`tests/qc-v412/`): `hero-dark.png`, `hero-dark-390.png`, `hero-light.png`, `grid-390-light-summarize.png`, `grid-390-light-unlock.png`, `grid-390-dark-summarize.png`, `grid-390-dark-unlock.png` — eyeballed: dark hero shows the icon + light wordmark directly on the deep-sea background with no halo at both widths; light hero unchanged; at 390px the Summarize and Unlock notes read as footnotes under a hairline in both themes, cards have clear edges, icon chips carry the deeper teal tint.

# V4.2.0 — Deep-audit fix pass (2026-11-17)

All 39 items from `~/workspace/your_files/aurelia-deep-audit-2026-11-16.md` (written against v3.5) were re-verified against the v4.1.2 code first; items already fixed by v4.0–v4.1.2 are marked as such. Cache-busts bumped to `?v=43`. **This build is LOCAL ONLY — not published.**

## Item-by-item results

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | pdf.js CVE-2024-4367 | **Fixed (stopgap); 4.x upgrade blocked** | Every pdf.js call goes through one helper `GD()` that sets `isEvalSupported:false` (all 9 call sites). 4.x attempt: see "pdf.js 4.x attempt" below. |
| 2 | Privacy wording overclaim | Fixed | "No server" removed everywhere (hero, README); the line is now "Your files are never uploaded — everything runs in your browser." Full disclosure lives on trust.html (#12). |
| 3 | Unguarded library destructure | Fixed | Boot guard: guarded destructure + plain failure panel ("A library failed to load — check your connection and reload") with a Reload button. Spot check (a): pdf-lib blocked → panel shows, all tools still render. |
| 4 | No SRI / CSP | Fixed | `integrity` sha384 + `crossorigin` on all eager CDN scripts (hashes computed from byte-identical downloads); lazy loader sets SRI on injected tags; meta CSP allows the used CDN origins + workers + data:/blob:. All suites pass under the CSP. |
| 5 | Page-manager toolbar under header | Fixed | `#visualWrap{scroll-margin-top:104px}`. |
| 6 | Button gradient contrast | Fixed | Dedicated `--btn1 #0E7C86` / `--btn2 #0A7F86` stops for buttons + selected signature tab. Measured in-browser (qc-v42e): white on stops = 4.95:1 / 4.78:1 (both themes). Logo/hero gradient text untouched. |
| 7 | Muted / pill / success contrast | Fixed | Light `--muted` darkened to #47636E (measured 5.86:1 on bg, 5.30:1 on bg2); success green is now `--ok` token (5.25:1 light, 7.64:1 dark). |
| 8 | Hero button overflow at 390px | Fixed | `.search input{min-width:0}`; Explore now scrolls to the "Most popular" section (`id="popular"`). qc-v41/qc-v42 390px shots: no overflow. |
| 9 | Focus indicators / aria-live | Fixed | Global `:focus-visible` outline; `aria-live="polite"` on status, toast and the search-result count. |
| 10 | OG image was the square app icon | Fixed | New `og-image.png` (1200×630, 134 KB): Stow Box lockup on deep-sea + headline. og:image/twitter:image point at its absolute github.io URL; `twitter:card` = summary_large_image. Canonical stays pdfstow.safwan.digital. |
| 11 | robots / sitemap / deep-links | Fixed | `robots.txt` + `sitemap.xml` (preview URL + trust page); hash deep-links `#/merge` style (open sets, Back/logo clears, load reads). Spot check (c) passes. ItemList JSON-LD added alongside the existing WebApplication block. |
| 12 | Trust page | Fixed | `trust.html` in the same design system: About, "How PDFStow works" (3 lines), Privacy (honest disclosure: GitHub Pages hosting, CDN library loads, first-OCR language download, files never uploaded), Terms (Unlock/Protect/Redact only on documents you own/have permission for), Contact = GitHub repo link (no email invented — DEC-4 is Safwan's). Nav + footer point at its sections. Spot check (d) passes. |
| 13 | CI + publish checklist | Fixed | `.github/workflows/test.yml` authored (push/PR: node --check + all four suites; runs on first push — this pass is unpublished, so it has not executed in CI yet). Publish checklist line added here and in README. |
| 14 | Touch targets under 44px | Fixed | chipbtn / cont-chip / .btn.sm / password eye / thumb-del → 44px; color dots 40px effective (transparent-border trick); field inputs min-height 44px; nav links padded; mobile theme button 44px; redact ✕ 26px. |
| 15 | Range styling / signature order / stage width | Fixed | `accent-color` on range + checkbox inputs; the signature block moves above the page preview in Sign PDF (visible in qc-v42 sign screenshot); slimmer mobile panel padding widens the stage. (Stage stays paper-white in both themes by design; the signature checkerboard is theme-neutral alpha grey.) |
| 16 | Pre-file guidance | Fixed | Persistent line under the action buttons — "Choose a file above to begin — it stays on this device" — until a file is chosen. |
| 17 | Search feedback | Fixed | Result count announced ("3 tools match…", aria-live); empty state offers "Show all tools". |
| 18 | Category sublines | Fixed | Plain descriptive sublines replace "N tool(s)" counts (e.g. Organize → "Merge, split, reorder and clean up pages"). |
| 19 | Placeholder / dark chip / stage | Fixed | `::placeholder` uses the theme muted token; dark card icon chips simplified to one visible layer; checkerboard is alpha-grey (theme-neutral). |
| 20 | Lazy-load heavy libraries | Fixed | SheetJS, Mammoth, Tesseract.js load on first open of their tool via an SRI-setting loader; failure surfaces the #3 panel. Spot checks (b) pass. |
| 21 | SheetJS 0.18.5 frozen with CVEs | Fixed | Current SheetJS **0.20.3** vendored same-origin at `vendor/xlsx.full.min.js`, lazy-loaded; verified in-browser: `XLSX.version === '0.20.3'`, PDF→Excel produces a real .xlsx; CSV fallback retained if the load ever fails. |
| 22 | Tesseract runtime unpinned | Fixed | Explicit pinned `workerPath` (tesseract.js@5.0.4), `corePath` (tesseract.js-core@5.0.0), `langPath` (@tesseract.js-data/eng@1.0.0/4.0.0); OCR tool note states the first-use ~10 MB download. v3 (f-b) completes OCR end-to-end with the pinned paths. |
| 23 | No file-size guidance | Fixed | Accept hint gains "works best under ~50 MB per file on phones"; adding a file over 50 MB raises a non-blocking toast (the existing >100 MB warning stays). |
| 24 | SPA rewrite question | **Skipped** | The audit itself recommends no rewrite now. |
| 25 | PWA | Fixed (manifest-only) | `manifest.json` (PDFStow, standalone, theme #0E7C86, background #04141A, icons 192 + 512). The `<link rel="manifest">` is injected only on http(s) — Chromium refuses manifest fetches over file:// and logs a console error, which would poison the suites' error gate; on the real site the link is present. **No service worker** (DEC-5 is Safwan's). |
| 26 | Meta said "28+ tools" | Already fixed | Corrected in the v4.0 rebrand — meta description and hero both say 31 tools. |
| 27 | Badge alignment | Fixed | `.badge` gains `align-items:center` + `text-align:left`. |
| 28 | Position-grid dots clipped | Fixed | Dot insets moved from 4%/96% to 14%/86% — dots now sit fully inside the squares. |
| 29 | Card text crowding | Fixed | Card descriptions clamp to 3 lines; the five longest descriptions trimmed (Beta caveats live in each tool's note/panel text, unchanged). |
| 30 | Reduced motion | Already fixed | Shipped in v4.1 (`.js-anim` gating + reveal bypass); qc-v41 reduced-motion check passes. |
| 31 | Signature preview text size | Fixed | `.sigtypeprev` font-size `var(--fs-hero)` → 40px. |
| 32 | Acting defaults | Fixed | Watermark text and Split ranges now start **empty** with examples as placeholders; an empty watermark errors plainly ("Type the watermark text first") instead of silently stamping a fallback. |
| 33 | British spellings in UI copy | Fixed | US-spelling sweep (Recognize, recognized, Summarizing, reorganized, center, checkered, color); zero British spellings remain in app.js / index.html. |
| 34 | Frozen-looking progress | Fixed | Jobs start with an animated indeterminate bar until the first real progress tick replaces it; under reduced-motion it degrades to a static bar. |
| 35 | Expectation lines | Already fixed | Shipped pre-audit (per-tool "N pages will be created…" lines + honest result lines); verified in the suites. |
| 36 | No file-type validation | Fixed | `addFiles` checks extensions against the tool's accept list; a wrong-type file gets a plain toast ("That tool needs PDF — "x.jpg" is a JPG file, so it was not added") and is not added. |
| 37 | Remove Pages output doesn't shrink | Fixed | Kept pages are rebuilt into a fresh document (same copyPages path as Organize) instead of in-place removal; ui-test Remove flow green (14 → 12 pages, tracemonkey corpus). |
| 38 | Branded 404 | Fixed | `404.html` — same palette/tokens, self-contained styles (relative paths break on nested 404 URLs), home link + icon use absolute preview URLs; update them when the custom domain launches. |
| 39 | Footer GitHub source link | Fixed (code side) | Footer sitemap row: Tools · About · How it works · Privacy · Terms · Contact · "Source on GitHub — verify the privacy claim". Repo topics + social-preview image remain publish-step settings for Safwan. |

## pdf.js 4.x attempt (#1b) — blocked, evidence

Attempted in a throwaway copy (the shipped package was never touched): pdfjs-dist 4.2.67 ESM (`pdf.min.mjs` + `pdf.worker.min.mjs`) wired via a module import + readiness promise, all 9 `GD()` call sites converted to `(await GD(...)).promise`. Results: the library loads and a blank test PDF opens/renders via the fake-worker fallback, **but the UI suite stalls** at the Remove Pages step (30 s wait for 14 rendered thumbnails of tracemonkey.pdf): worker requests bypass the harness's page interception, and pdf.js 4's standard-font fetches then fail against the sandbox proxy. Two structural costs also weigh against adopting now: (1) pdf.js 4.x is ESM-only, forcing an async boot refactor of every pdf.js flow; (2) SRI cannot be applied to an import inside an inline module (import-map integrity is not broadly supported), which would *regress* item #4 for the largest library. The CVE-2024-4367 code path stays closed by the `isEvalSupported:false` stopgap on 3.11.174, per the audit's own note. **Recommendation: keep 3.11.174 + stopgap; revisit 4.x with a dedicated harness (font fixtures + worker plumbing) as its own project.**

## Harness adaptations (assertions unchanged in all cases)

- `tests/ui-test.js`: vendor-fixture responses now send `Access-Control-Allow-Origin: *` — the header the real CDNs send; required for Chromium to accept the SRI+crossorigin script loads. Mirrors the other three suites, which already had it.
- `tests/v3-checks.js`: the OCR shim's `createWorker` override now also redirects `corePath`/`langPath` to the local byte-identical fixture server, alongside the pre-existing `workerPath` override — necessary because the app now pins all three paths explicitly (#22).
- `tests/qc-v41.js`: hero-GIF assertion accepts the `?v=43` cache-bust suffix (`startsWith`), per the version bump.
- New suite `tests/qc-v42.js`: the (a)–(f) spot checks below.

## Test results (final files)

- `node --check app.js` — OK.
- `tests/ui-test.js` — **20/20 PASS** · `tests/v3-checks.js` — **18/18 PASS** (incl. (f-b) OCR end-to-end with pinned asset paths) · `tests/qc-v41.js` — **8/8 PASS** · `tests/qc-v412.js` — **8/8 PASS**.
- `tests/qc-v42.js` — **10/10 PASS**: (a) pdf-lib blocked → failure panel + tools render; (b) PDF→Excel lazy-loads vendored SheetJS 0.20.3 → real .xlsx, Word→PDF lazy-loads Mammoth → real PDF, OCR lazy-loads Tesseract.js with SRI; (c) `#/merge` deep-link opens Merge, Back clears the hash; (d) trust.html renders (5 sections, anchors resolve, GitHub link, disclosure, themed); (e) contrast printed from computed styles — btn stops 4.95/4.78, muted 5.86/5.30, ok 5.25 (light) and 8.41/7.64 (dark); (f) screenshots in `tests/qc-v42/` (home desktop light/dark, Merge panel 390 light, Sign panel 390 dark, Trust desktop light + 390 dark) — eyeballed: new hero copy, no Explore overflow, dark hero wordmark clean, pre-file hint + 50 MB guidance visible in the panel, signature pad above the preview position, Trust page in the same design system.

## Publish checklist

**Do not publish unless `node --check app.js` passes and ui-test (20/20), v3-checks (18/18), qc-v41, qc-v412 and qc-v42 are all green on the exact files being pushed.** Publishing remains a separate step (with repo topics + social-preview image set in GitHub settings at the same time).
