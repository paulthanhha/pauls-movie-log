# Afterglow — personal film journal

Buildless, portable app. Serve `dist/` over HTTP or deploy on any static host. No installation or build step. Root-relative URLs assume a domain root; GitHub Pages needs an account site or custom domain.

## Data ownership

Initially saves in browser localStorage, which is not an independent backup. Export Markdown ZIPs or connect your GitHub repository in Data & connections. Film data is not automatically transferred to the app source repository.

GitHub needs an existing repository/branch and a fine-grained token scoped to it with Contents read/write. Enter token in the app, never in chat or source. Token stays in tab memory and is sent only to api.github.com. Reload requires reconnecting. Only repository preferences persist. Connect reads; Sync all writes. Overlapping IDs require choosing remote or local versions. SHA checks detect conflicts. Sequential writes can partially succeed; UI reports the count. Avoid concurrent editing during sync. Deletion removes remote Markdown before local record; Git history retains older versions. Posters are retained. Clear demo only removes local demo records.

## Markdown schema v1

One UTF-8 file per film: content/films/<stable-id>.md. Frontmatter uses JSON-compatible YAML values; body is review. Importer supports this schema, not arbitrary third-party YAML.

Fields: schemaVersion, id, title, originalTitle, year, genres, country, runtime, director, screenplay, cinematography, music, cast, ratings, watches, spoilers, favorite, demo, updatedAt, poster.

Ratings: story, visuals, performances, impact; each 0–5 in 0.5 steps, null = unrated. Overall requires all four, uses arithmetic mean rounded to one decimal for display only. Badges: >=4.5 Cinematic Gem; >=4 Memorable; >=3 Enjoyable; >=2 Mixed Feelings; else Not for Me. Favorite is independent.

Watches: array of {date: YYYY-MM-DD, venue: string}; empty date allowed. Entry dates use Vietnam timezone; updatedAt uses ISO timestamp.

Uploaded posters resized to max 650 px width WebP. ZIP export and GitHub sync store assets/posters/<id>.webp and relative references. External poster URLs remain external. To restore, import .md files then extracted poster folder. Reviews display as escaped text with line breaks; Markdown source is preserved in files.

Demo data from user reference images is illustrative and unverified. No dates or reviews fabricated. Stats exclude demos.

## Validation

node --check dist/app.js
node tests.cjs

Browser QA unavailable in this environment because preview relay is missing.

## Film selection and layout

The default view opens the first film as a centered sheet: poster, title, rating panel, film metadata, optional review and collapsible watch history. Desktop uses a fixed right poster shelf with selected-film highlight and search. At widths up to 700 px, selection moves to a horizontally scrolling bottom shelf. Library and favorites remain available through navigation. Per-film scores use blue (4.5–5), green (3.5–4), orange (2.5–3), and coral (0–2). Overall uses the stored arithmetic mean. No data schema changes in this redesign.

## Form and rating update

The editor now uses whole-number scores 1–5 (or unrated). Colors: 1 #EF4444, 2 #F97316, 3 #F59E0B, 4 #10B981, 5 #0088FF. Overall is the mean of four scores. Color and label use nearest integer, with ties rounded up. Labels: Flop, Barely Watchable, Entertaining, Worth-watching, Cinematic Gem. Gem sparkles respect reduced motion preferences.

Genre input uses reusable multi-select tags, includes a standard catalog, and supports custom tags. Labels trim/collapse whitespace and deduplicate case-insensitively. Selected tags persist inside each movie Markdown file and are rediscovered after import or GitHub connection. Newly created unused tags also remain in the local catalog. Original title and watched-at controls are removed. Legacy originalTitle, watch venue, and fractional scores remain readable in existing files to avoid destroying old data; editing ratings uses the new 1–5 integer scale. Poster upload and URL are inline in one row.

## Compact overview

Desktop detail pages now arrange poster and watched date on the left, film title/year/runtime/country/genre and ratings on the right, and credits plus a short review side by side below. Sizing adapts to viewport height to fit ordinary film records on laptop screens without page scrolling. Full reviews and watch history use separate dialogs; review previews are limited to six lines and credits have an explicit full-details dialog for unusually long records. Page overflow is never clipped, so very small screens, zoomed text or unusually large records can still scroll. On mobile, poster/title share the top row, ratings use the full next row, and details follow below. Desktop editor uses two columns with all crew fields open by default. No data format changes.

## Reading width and reviewer identity

Main desktop reading area is capped at 900 px (930 px on large screens) with wider outer whitespace. Film shelf is 228 px on desktop, 250 px on large screens, and 200 px on smaller laptops. Supporting metadata, tags, sidebar film names and form labels use larger typography.

A blank/whitespace-only review generates no comment markup or placeholder. Written reviews use a Reviewed By avatar/name header and quoted text. Spoiler comments remain gated. Configure one app-wide persona in Settings > Your character, with optional name and uploaded avatar or URL. Uploaded avatars are resized to max 160 px width. The persona persists locally and is embedded in each exported/synced movie Markdown as a reviewer object {name, avatar}; imported reviewer metadata is used when no local persona has been configured. A configured local persona overrides all displayed authors. No fabricated comments or authors are added.

## Instagram PNG export

Each film toolbar has Export PNG. Its preview uses a dedicated 1080 × 1350 (4:5) canvas layout: centered poster/title, color-coded average and four criteria, optional credits, watched date and author/comment. UI navigation and edit buttons are excluded. Cinematic Gem sparkles are static in PNG.

Toggle poster, credits, watched date and comment before download. Empty comments are unavailable; spoiler comments are initially excluded and can be enabled explicitly. Long comments or credits automatically continue on additional cards without truncating text. Download each PNG separately or all PNGs in a ZIP.

Export is rendered locally with Canvas 2D, using bundled Noto Sans regular/bold for Vietnamese support. Font license is in dist/assets/fonts/LICENSE-Noto.txt. Poster and avatar URLs require CORS permission; unavailable external posters disable downloading until replaced with a locally uploaded image or excluded. The override affects only the current export. Unavailable avatars use initials, with a visible notice.

Validation: node --check dist/share.js; node share-tests.cjs (requires @napi-rs/canvas). Native rendering checks PNG signatures/dimensions, normal cards, short/long comments, long credits, field toggles and long-word preservation. Example PNGs were visually inspected. Browser preview infrastructure remains unavailable, so the live click/download flow has not been exercised in the browser.

## SF Pro system font and smaller export metadata

App and PNG now share an Apple system-first font stack: -apple-system, BlinkMacSystemFont, SF Pro Text, SF Pro Display, SF Pro. On Apple devices this uses the installed system font; locally installed SF Pro can also be selected on other systems. No SF Pro font files are bundled or uploaded. Devices without it fall back to the bundled Noto Sans, then Helvetica Neue/Arial/sans-serif. PNG rendering runs in the visitor's browser, so a Mac export uses its own font environment. The native Linux rendering test validates fallback/layout, not SF Pro glyph shapes.

PNG metadata values: 20 px (previously 24), labels: 18 px (previously 22), quick facts: 18 px (previously 22), main comment: 23 px (previously 26). Rating labels are 23 px and rating values 22 px; film title and overall score sizes remain unchanged. Wrapping, row heights and continuation cards use the revised metrics.

## Centered export composition

PNG export now uses a 780 px centered rating/title region, 740 px metadata region and 680 px comment measure within the unchanged 1080 × 1350 canvas. Rating components remain left/right aligned inside the narrower centered panel. Avatar plus Reviewed By/name are centered as a group; every comment line is centered. This also applies to continuation cards. Each rendered content group is vertically centered within the safe area before adding a centered footer. Empty optional sections still do not render; app layout and film data are unchanged.

## Reviewer/comment row and rating tint

The PNG comment section is a 680 px centered row: a 224 px reviewer identity column (avatar + left-aligned Reviewed By/name), a 24 px gap, and a 432 px left-aligned comment column. Identity and comment begin alongside one another. Long comments retain this arrangement on continuation pages. Individual text lines are not centered. Blank reviews remain absent.

The rating card now uses a very light gradient and diffuse shadow in the overall score's existing mapped color, with a matching pale border. The same subtle treatment applies to the app's rating card. Score values, thresholds, fonts and data are unchanged.

## Collection grouping and date filters

Collection view supports no grouping, grouping by watched month (newest first), or grouping by rounded overall rank in the order Cinematic Gem → Worth-watching → Entertaining → Barely Watchable → Flop. Unrated entries follow ranked groups; films without a valid viewing date follow dated month groups. The selected grouping mode persists on this browser.

Month/year filters refer to watched dates, not release dates. A film matches if at least one single viewing date satisfies both date filters. Each film appears only once; the card and month group use the latest matching viewing date (or latest date overall when unfiltered). Search, genre, unrated and date filters compose. Clear filters retains the selected grouping mode. Empty groups are omitted.

Favorites navigation, filter, hearts and editor checkbox are removed. Existing favorite metadata is preserved for backward compatibility without a separate favorites UI; rating groups express the user's preference.

## Descending grouping, animated classifications and demo rank pack

Rank groups now run Cinematic Gem → Worth-watching → Entertaining → Barely Watchable → Flop; unrated remains last. Month groups remain newest first, with undated last. Within either grouping, films sort by exact overall score descending, then matching watch date descending. The sort menu reflects and locks this order while grouped, restoring the previous ungrouped sort when grouping is disabled.

All rated classification badges and rank group headings get a small color-matched sparkle and gentle glow; Cinematic Gem retains its original larger sparkles. Reduced-motion settings disable animations. PNGs use static sparkles.

Three fictional demos are added: The Last Signal (1), Midnight Detour (2), A Quiet Horizon (4), with abstract demo posters, fictional credits/comments and viewing dates spanning months and years. They are explicitly flagged demo and excluded from real-film statistics. On existing browsers the pack is inserted once, never replacing existing IDs or edits, and does not reappear after deletion. Settings can restore missing demo entries without overwriting edited ones. Existing sample films remain intact.

## Satisfaction-specific rating effects

Detail classification badges and collection rank headings use distinct expressions: 5 has three staggered sparkling stars and soft blue glow, 4 has a brief sheen with a small light symbol, 3 has a single gently bouncing dot, 2 has three slowly appearing dots, and 1 has an outlined sad face with a short downward sigh. Cycles last roughly 5–6 seconds with long rests and no rapid flashing. Reduced-motion settings disable these animations. PNG exports draw matching static vector symbols. Rank labels, score boundaries, colors, ordering and stored movie data are unchanged.

## User reference artwork (current rating symbols)

The user's reference supersedes the previous face/dot/ellipsis icon set. 5 uses three rounded four-point stars, 4 uses two stars, 3 uses two lightning bolts, 2 uses a hand-drawn spiral and 1 uses three upward sigh waves. Filled pale capsules match the score color. Symbols overlap the upper right of the capsule; label text stays stationary.

App symbols are inline SVG from shared RANK_ARTWORK path data, with distinct low-frequency animations: staggered strong twinkles (5), gentler slower twinkles (4), brief sequential energy pulses (3), a small back-and-forth spiral rotation (2), and staggered rising/fading waves (1). PNG uses the identical paths via Canvas Path2D in a static pose. Reduced-motion preference makes every symbol static. Both detail badges and collection rank headings use this artwork; stored data and rating logic are unchanged.

Latest badge revision: ranks 1–3 have no decorative symbols. Cinematic Gem stars use the same icon bounds as Worth-watching in detail, collection and PNG. All five rank labels have colored metallic lettering; the app has a slow highlight sweep, reduced motion uses a static finish, and PNG renders static metal highlights.

Star clearance revision: rank 4/5 star clusters reduced to 30px (24px mobile), 24px in collection headings (22px mobile), and 30px in PNG. Artwork sits fully above the badge with clearance for peak twinkle, avoiding label overlap.

Stars now sit immediately at the upper-right of the numeric overall score, only for ranks 4/5. Removed all classification-label stars, including collection headings. PNG positions stars using measured score-text width.

Collection visual refresh: white detail-matched canvas, generous margins, four-column desktop poster gallery, understated underlined filters and grouping controls, ratings beside titles, no add-film placeholder tile, responsive two-column mobile layout. Existing search/filter/group interactions are retained.

Renamed UI, browser title and PNG brand to Paul's Movie Log; removed decorative subtitles, eyebrow text, collection tagline/order hint and minor demo notes. Credit names and Cast now share the same responsive font-size variables. Existing browser storage keys stay unchanged to preserve saved data.
