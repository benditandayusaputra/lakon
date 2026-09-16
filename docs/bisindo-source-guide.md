# BISINDO source guide for Lakon

Adapted from `../../docs/BISINDO_AGENT_GUIDE.md` (general version) to
Lakon's reality. Baseline rules already covered in `CLAUDE.md` and
`coffee-shop-content-plan.md` are not repeated here — this document only
adds: verified source rankings, status mapping, and product-name policy.

Last verified: 1 Sep 2026.

## Source rankings (verification results, not claims)

### Tier A — authoritative

| Source                                                                                                    | Verification status                                                                                                              | Role for Lakon                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pusbisindo (pusbisindo.org, official YouTube/FB/TikTok channels)                                          | Online dictionary on the site is **empty** as of 1 Sep 2026; its social media channels are active and contain Deaf signer videos | Validation path (contact: pusat@pusbisindo.org / WA on the site) + clip source from its official social media; top priority for the Jakarta variant |
| Balai Bahasa Prov. Jawa Timur — Video Kosaisyarat (<https://balaibahasajatim.kemendikdasmen.go.id/video>) | Real and verified (MediaPipe scan while playing): one word per MP4, ±2s silence → sign → silence pattern                         | Ready-to-import clip source, **East Java variant** — see variant policy                                                                             |

Balai Bahasa Jatim does NOT have: halo, kopi, pesan, mau, berapa, bayar,
terima kasih. What's relevant and available: SATU–SEMBILAN, MINUM, PANAS,
DINGIN, BESAR, KECIL, MANIS, PAHIT.

### Tier B — credible Deaf community (Jakarta context)

Kopi Tuli (Duren Tiga), Sunyi Coffee, Silang.id, clearly identified Deaf
creators. Useful for cafe transaction vocabulary not covered by Tier A.
Must check: the signer is Deaf, the variant is Jakarta.

### Tier C — comparison only

Apps/academic datasets. Never the sole basis for a form.

## Variant policy

Lakon's target remains BISINDO Jakarta. Project owner decision (1 Sep
2026): the East Java variant from Balai Bahasa Jatim **may be used as a
draft** as long as `notes` explicitly records the variant (example:
`varian: Jawa Timur (Balai Bahasa Jatim), ganti bila ada sumber Jakarta`).
Never mix variants without a note like that.

## Status mapping to the Lakon schema

The general guide uses its own statuses; in Lakon they all map to
`review.status` + `notes`:

- `verified_source_available` → file created, `review.status: "draft"`,
  provenance in `notes`. (Only a human validator may set `approved`.)
- `needs_validation` / `static_reference_only` /
  `needs_dynamic_letter_validation` → **no file is created at all**. Signs
  without an adequate video source do not go into `content/signs/`.
- `rejected_sibi` → reject the source; SIBI and sources not clearly
  BISINDO/SIBI are not used.

## Product names & foreign terms (americano etc.)

Product names without a validated dedicated sign → BISINDO alphabet
fingerspelling, not invented movement. Consequence for Lakon: needs 26
letter-sign files (many two-handed) before an "order americano" scenario
can exist. Project owner decision: this is a **phase after** the 6
kedai-kopi words are done. The alphabet source will still be subject to
the tiers above.

## Checklist before saving a draft in sign-editor

Derived from the general guide's checklist, mapped to Lakon parameters:

- Explicit BISINDO source (not SIBI), signer/organization identified.
- `structure` matches the source (one/two hands; symmetric/asymmetric).
- Handshape per phase matches (edit finger angles if none of the 18
  candidates looks similar).
- Anchor + offset, palm orientation, and path match the video.
- Repeated movement, start/end position observed.
- `gloss` (id+en) correct; `notes` contains channel, URL, signer name,
  variant, date accessed.
- In doubt → don't save. A little but correct beats a lot but guessed.
