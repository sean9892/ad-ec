# ad-ec

Antimatter Dimensions Eternity Challenge Guide: a static, single-page companion covering early Eternity through EC12x5.

## Use the guide

- Read one objective at a time. Scroll or swipe to browse nearby objectives; the view snaps into place with a card centered in the available space.
- Jump to any of the 164 objectives in the left sidebar. On smaller screens, open the objective list from the top-left menu.
- Mark individual objectives as achieved and undo any completion. Marking one objective never changes other objectives.
- Progress and the current position are saved in this browser with `localStorage`. No account or backend is needed. Clearing browser data clears progress; storage restrictions fall back to the current session.
- Use the arrow buttons, or focus the card region and use Arrow Up/Down, Page Up/Down, Home, or End. Reduced-motion preferences are respected.
- Open **Copyright Info** in the top-right for attribution and the original spreadsheet.

## Development and static hosting

Requires Node.js 22.18+ (Node 24 recommended) and npm.

```sh
npm ci
npm run dev
npm test
npm run build
```

Deploy the generated `dist/` directory to any static host. Vite uses a relative asset base (`./`), so the same build works at the domain root or under a repository path such as `/ad-ec/`. There are no server routes, secrets, or runtime services. `npm run preview` serves the production build locally.

## Requested shadcn preset

The app uses preset **`b37arxUUC`**: Base UI, Nova style, mauve base, fuchsia theme, indigo chart colors, Inter font, Lucide icons, default radius, subtle menu accent, and default menu color. The decoded settings are recorded in `shadcn-preset.json` and `components.json` records the component configuration.

The requested initialization command was attempted:

```sh
npx shadcn@4.21.0 init --preset b37arxUUC --template vite --name ad-ec --no-monorepo --yes
```

The registry initialization endpoint was unavailable in the build environment. The preset was decoded with the official CLI and applied using the official [Base UI component sources](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/bases/base/ui), [Nova stylesheet](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles/style-nova.css), and [theme tokens](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/themes.ts). The vendored components retain their Base UI accessibility behavior. `src/preset-nova.css` contains the relevant unmodified Nova style sections; `src/preset-theme.css` combines the preset's mauve, fuchsia, and indigo tokens. Local product styles compose these in `src/index.css`. Inter is bundled locally without a font CDN.

## Source and data maintenance

Based on the [Antimatter Dimensions – Eternity and Eternity Challenges spreadsheet](https://docs.google.com/spreadsheets/d/1NrYADsW4s7wRYTE91Z0EFHbXcHaswuuMzG9a2WyGG0A/edit?gid=1524747248#gid=1524747248), supplied as `Antimatter Dimensions - Eternity and Eternity Challenges (1).xlsx`. Guide credit: Ninjatsu and the Antimatter Dimensions community. This project is an unofficial companion; the original guide and game remain the work of their respective creators.

`src/data/objectives.json` contains 56 early-Eternity objectives and 108 planner objectives, including all 60 challenge completions and the farming steps between them. Each record retains its source sheet and row. Early-Eternity prose is given a concise objective title; explanatory rows and the FAQ are not standalone objectives. The EC8 trick explanation is attached to its setup objective. Challenge order is checked against the workbook's **EC Order** sheet, and IP goals come from **Picturemap v2.6**. Original recommendations and optional thresholds are retained, including differences between an intermediate farming target and a later recommendation. The workbook is not modified or needed at runtime.

To regenerate the checked-in data from the supplied workbook using Python's standard library:

```sh
python3 scripts/extract-objectives.py '/path/to/Antimatter Dimensions - Eternity and Eternity Challenges (1).xlsx' src/data/objectives.json
npm test
```

Completion keys use stable source sheet/row IDs rather than display titles or array positions. Tests cover malformed storage, deduplication, removed IDs, completion/undo, reload round trips, unique objective IDs, and the complete challenge set. Production builds type-check the app. Automated browser interaction tests have not been run.

The shadcn component license is included in `LICENSE-shadcn.md`.
