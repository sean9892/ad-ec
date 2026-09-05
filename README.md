# ad-ec

Antimatter Dimensions Eternity Challenge Guide: a static, single-page companion covering early Eternity through EC12x5.

## Use the guide

- Read one objective at a time. Scroll or swipe to browse nearby objectives; the view snaps into place with a card centered in the available space.
- Jump to any of the 164 objectives in the left sidebar. On smaller screens, open the objective list from the top-left menu.
- Mark individual objectives as achieved and undo any completion. Marking one objective never changes other objectives.
- Progress and the current position are saved in this browser with `localStorage`. No account or backend is needed. Clearing browser data clears progress; storage restrictions fall back to the current session.
- Use the arrow buttons, or focus the card region and use Arrow Up/Down, Page Up/Down, Home, or End. Reduced-motion preferences are respected.
- Open **Copyright Info** in the top-right for attribution and the original spreadsheet.
- Each card has a short instruction and resource badges displaying only a value and unit, such as `e120,000 AM` or `8 EP`. **Guide details** keeps the full source notes available. Badge backgrounds use AM red (`#EA4335`), IP orange (`#FF6D01`), EP magenta (`#D105C3`), and the requested TT cyan (`#46BDC6`). AM/IP/EP colors come from **Eternity Start!B24**; TT is an explicit cyan override. Text is white on EP and black on AM/IP/TT for readable contrast. Badges have no goal, reward, purchase, or other qualifier labels.

## Development and static hosting

Requires Node.js 22.18+ (Node 24 recommended) and npm.

```sh
npm ci
npm run dev
npm test
npm run build
```

Deploy the generated `dist/` directory to any static host. Vite uses a relative asset base (`./`), so the same build works at the domain root or under a repository path such as `/ad-ec/`. There are no server routes, secrets, or runtime services. `npm run preview` serves the production build locally.

## GitHub Pages deployment

One-time setup: open **Settings → Pages** in this repository and set **Build and deployment → Source** to **GitHub Actions**. See [GitHub's Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

After merging this workflow, every push to `main` automatically installs dependencies, runs the tests, builds `dist/`, and deploys that build to GitHub Pages. Pull requests run validation and upload a review artifact without deploying. You can also run **Validate and deploy static site** manually from the Actions tab with `main` selected.

The default site address is [sean9892.github.io/ad-ec](https://sean9892.github.io/ad-ec/). The deployment job also reports the actual URL through the `github-pages` environment. No personal access token or custom secret is needed. If an existing `github-pages` environment has branch restrictions, allow deployments from `main`.

The existing relative Vite asset base supports the repository subpath, including fonts and lazy-loaded Mermaid modules. Only `dist/` is published; no source checkout or Sites configuration is uploaded. Progress saved on the previous host stays in that browser origin and does not transfer to the GitHub Pages address.

## Requested shadcn preset

The app uses preset **`b37arxUUC`**: Base UI, Nova style, mauve base, fuchsia theme, indigo chart colors, Inter font, Lucide icons, default radius, subtle menu accent, and default menu color. The decoded settings are recorded in `shadcn-preset.json` and `components.json` records the component configuration.

The requested initialization command was attempted:

```sh
npx shadcn@4.21.0 init --preset b37arxUUC --template vite --name ad-ec --no-monorepo --yes
```

The registry initialization endpoint was unavailable in the build environment. The preset was decoded with the official CLI and applied using the official [Base UI component sources](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/bases/base/ui), [Nova stylesheet](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles/style-nova.css), and [theme tokens](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/themes.ts). The vendored components retain their Base UI accessibility behavior. `src/preset-nova.css` contains the relevant unmodified Nova style sections; `src/preset-theme.css` combines the preset's mauve, fuchsia, and indigo tokens. Local product styles compose these in `src/index.css`. Inter is bundled locally without a font CDN.

## Source and data maintenance

Based on the [Antimatter Dimensions – Eternity and Eternity Challenges spreadsheet](https://docs.google.com/spreadsheets/d/1NrYADsW4s7wRYTE91Z0EFHbXcHaswuuMzG9a2WyGG0A/edit?gid=1524747248#gid=1524747248), supplied as `Antimatter Dimensions - Eternity and Eternity Challenges (1).xlsx`. Guide credit: Ninjatsu and the Antimatter Dimensions community. This project is an unofficial companion; the original guide and game remain the work of their respective creators.

`src/data/objectives.json` contains 56 early-Eternity objectives and 108 planner objectives, including all 60 challenge completions and the farming steps between them. Each record retains its source sheet and row. `scripts/objective-copy.json` supplies concise card copy and plain resource values; the extractor generates the simpler farming and challenge summaries. Original descriptions remain under **Guide details**, including optional thresholds and differences between an intermediate farming target and a later recommendation. Numeric AM/IP/EP/TT quantities also render as badges in expanded notes and the sidebar; multipliers and farming rates remain text. Explanatory rows and the FAQ are not standalone objectives. The EC8 trick explanation is attached to its setup objective. Challenge order is checked against **EC Order**, and IP goals come from **Picturemap v2.6**. The workbook is not modified or needed at runtime.

To regenerate the checked-in data from the supplied workbook using Python's standard library:

```sh
python3 scripts/extract-objectives.py '/path/to/Antimatter Dimensions - Eternity and Eternity Challenges (1).xlsx' src/data/objectives.json
npm test
```

Completion keys use stable source sheet/row IDs rather than display titles or array positions. Tests cover malformed storage, deduplication, removed IDs, completion/undo, reload round trips, unique objective IDs, and the complete challenge set. Production builds type-check the app. Automated browser interaction tests have not been run.

The shadcn component license is included in `LICENSE-shadcn.md`.

## Time Study trees and navigation

Sidebar sections collapse independently; desktop and mobile share section state. Eternity Start trees open by default and show the end-of-objective snapshot, with the full tree visible and unbought studies gray. Challenge trees start collapsed. Mermaid loads when an active card needs a diagram, in a separate viewport supporting mouse/touch drag-to-pan, scrolling, and keyboard navigation.

`src/data/early-studies.json` records all 56 early snapshots, including incremental purchases and respec removals. Row 56 uses the guide's recommended Active alternative. Multi-stage objectives show their final setup; intermediate steps remain in Guide details. This curated data is independent of workbook extraction.

Resource badges identify Antimatter, Infinity, or Time paths; Activeness badges identify Active, Passive, or Idle. Multiple selected paths get separate badges. None means no path selected. Colors follow the game's standard theme. EC10 is shown as the completion gate to row 19.

References: [Steam screenshots](https://store.steampowered.com/app/1399720/Antimatter_Dimensions/) for vertical branching layout, [official study connections](https://github.com/IvarK/AntimatterDimensionsSourceCode/blob/5409e320cecef96a917cca1dfb68f1f183e499ca/src/core/time-studies/time-study-connections.js) for topology, and [official study colors](https://github.com/IvarK/AntimatterDimensionsSourceCode/blob/5409e320cecef96a917cca1dfb68f1f183e499ca/public/stylesheets/time-studies.css).

Validation: `npm test` includes Mermaid rendering in jsdom to verify fixed node coordinates, gray/bought colors, connector styling, and identical viewport bounds across setups. jsdom supplies only final SVG bounds; node placement uses the production layout renderer. Browser interaction testing was not performed.

The Mermaid `time-study-grid` layout uses the game's normal, pre-Reality [row and column definitions](https://github.com/IvarK/AntimatterDimensionsSourceCode/blob/5409e320cecef96a917cca1dfb68f1f183e499ca/src/components/tabs/time-studies/time-study-tree-layout.js). It preserves reserved challenge slots, the eight-node TS221–228 row, normal/wide node proportions, and straight connectors. Node coordinates and sizes never depend on purchases, label measurements, or viewport width. Pan position is retained while moving between objectives.
