# Jonah Haftarah Trainer

A trainer for **Jonah 1:1–10**, patterned after [ariahaftorah](https://github.com/esemmelman/ariahaftorah).

Select Hebrew words within a verse to create a highlighted phrase. Click a highlight to record or replace its audio. Hover to listen, or click a verse number to play its recorded phrases in order. The Trope button hides or shows cantillation while retaining vowels.

Phrase groups and audio are shared in the existing `bnaimitzvah` Supabase project, using dedicated `jonah_haftorah_1_1_10` tables and the `jonah-haftorah-1-1-10-group-recordings-v1` bucket. Like Aria, this is a shared, no-login classroom tool: visitors can edit phrases and recordings. It initially has no recordings; record the desired melody in the app. Public browser keys are intentionally included; no secret or service-role key is used.

Run `npm ci`, then `npm start`, and open http://localhost:4173. Microphone recording requires localhost or HTTPS. Run `npm test` for browser checks (install Chromium with `npx playwright install chromium` first).

`supabase-schema.sql` documents the applied remote migration `create_jonah_haftorah_1_1_10`. Do not rerun it on an already provisioned database.

## Text attribution

Hebrew: *Miqra according to the Masorah*, via [Sefaria, Jonah 1:1–10](https://www.sefaria.org/Jonah.1.1-10), [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/). Formatting tags were removed and whitespace normalized; text is retained with vowels and trope. `verses.json` records the source and passage.
