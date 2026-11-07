# Experience Archives assets

These are downloaded symbol files, not locally redrawn approximations. The live display loads only the symbols it uses. Symbol geometry is preserved; presentation colors for outline symbols are applied through the sourced SVG symbols and a cached canvas tint.

## Tabler outline icons

Source: [Tabler Icons, version 3.48.0](https://github.com/tabler/tabler-icons/tree/v3.48.0/icons/outline).

Copyright © 2020–2026 Paweł Kuna and Tabler Icons contributors. MIT license; the full notice is in [LICENSE-tabler.txt](LICENSE-tabler.txt).

Used symbols: `users`, `briefcase`, `trophy`, `calendar-month`, `book-2`, `settings`, `coins`, `shield-star`, `checkbox`, `microphone`, `broadcast` and `award`.

The source set also includes `laurel-wreath`, `chevron-right`, `chevron-down`, `school`, and `arrows-maximize`. They are not loaded by the live display. No fake expansion/fullscreen controls were added solely to resemble the reference.

## World Scout Emblem

Source: [WOSM 2024.svg on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:WOSM_2024.svg), attributed there to the World Organization of the Scout Movement, with contributions recorded in the file history. Licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

The local SVG is retained unchanged. The display uses a transparent 512px PNG rasterized from it, preserving its original purple and white emblem. It is used as a Scouting symbol beside the existing President’s Scout Award record; it is not presented as a replica of Sri Lanka’s President’s Scout Award badge.

## Ananda College crest

Downloaded unchanged from [Ananda College, Colombo?s official site](https://anandacollege.edu.lk/Assets/Images/logo.png). The original maroon and gold PNG identifies the existing School Colours record, as requested. Copyright remains with Ananda College; this institutional identifier is not part of the MIT-licensed icon set.

## Existing University of Colombo crest

`character-assets/university-of-colombo.png` was already part of this portfolio and remains unchanged. It identifies the university leadership records; the left summary panel uses a neutral leadership icon. It is an actual crest, not a generated campus photograph or a fictional logo.

## Provenance

[sources.json](sources.json) records each downloaded file’s exact URL, attribution, license, byte size and SHA-256. All SVGs are served locally; there is no runtime CDN dependency. `verification/lab/fetch-archive-assets.py` records the acquisition process.

## Organization logos

The archive records now use the original PAFFREL, Hemas, Rupavahini, AIESEC, and Welfare Benefits Board logos from their official sites. The existing University of Colombo and Ananda College crests identify the relevant leadership entries. Marks keep their original colors and aspect ratios in both HTML cards and the physical canvas display. All displayed record logos are transparent PNGs, without CSS or canvas backplates.

`mahara-youth.png` is the club-specific gold phoenix emblem, extracted from the [Leo Club of Mahara Youth LinkedIn cover](https://www.linkedin.com/company/leo-club-of-mahara-youth). It is used for the Assistant Treasurer entry. The surrounding cover artwork was cropped, then its edge-connected white background was removed. The emblem was not redrawn or recolored.

[organization-sources.json](organization-sources.json) records the official download URLs, hashes, and the Mahara Youth crop. The Welfare Benefits Board PNG also has its edge-connected white background removed, preserving enclosed white emblem details. Original source hashes and processed asset hashes are recorded. Logos remain the property of their respective organizations and are used to identify existing portfolio records.

All record logos and crests use matching 64 x 64 frames with 6px inner padding. HTML uses `object-fit: contain`; the physical canvas computes a single scale factor for both axes. PAFFREL uses the original `logoline-2022.png` header mark from its official site, replacing the wider footer variant.
