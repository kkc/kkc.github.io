# Markdown audit — 2026-10-30

Scope: all 61 current article sources and their built HTML, including the 60 entries in `migration-manifest.json`. This is a formatting audit, not a review of the technical accuracy of example code or a full external hyperlink audit.

## Fixed

- `2019-02-25-install-prometheus-on-EKS.md`: aligned both shell blocks and the intervening paragraph with their numbered list item. Previously the inconsistent indentation caused later fences to be misinterpreted and swallowed the final sections into code.
- `2021-09-24-paper-study-the-tail-at-scale.md`: replaced three unsupported `![](URL =600x)` images with HTML images retaining width 600; removed spaces inside a broken bold span.

## Recovered original image

- Thanos `docs/img/arch.jpg` was removed in upstream commit `20ecc2cc9271f6506f09301f5b9cfb75a8c72f61`. Recovered the original from parent `7dc2f3de5f766beafc5b3f77959f1b2cca0a3c2e` (HTTP 200, image/jpeg), saved it as `public/2019/02/10/prometheus-operator-with-thanos/arch.jpg`, and updated the article to use that local copy.

## Remaining external image failures

GET requests on 2026-10-30 returned HTTP 404 for these images (three remain unresolved after restoring Thanos). Original URLs are retained until the corresponding original image or a verified equivalent can be recovered.

| Article source | Image URL |
| --- | --- |
| `2018-03-14-AWS-VPN-with-RouterBoard.md` | https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/images/VPN_Basic_Diagram.png |
| `2019-05-02-ultimate-note-for-tweaking-fluentd-aggregator.md` | https://docs.fluentd.org/images/fluentd_ha.png |
| `2019-05-02-ultimate-note-for-tweaking-fluentd-aggregator.md` | https://docs.fluentd.org/images/fluentd-v0.14-plugin-api-overview.png |

17 distinct external image URLs were requested, including the three repaired image tags. The other 13 returned HTTP 200 with image content types. HTTP success does not prove that an image has not been replaced by its host.

## Validation

- `npm run build` and `npm run verify` passed (170 pages, 60 preserved legacy URLs).
- `node scripts/audit-markdown.mjs` passed for 61 articles after repairs.
- The audit checks code fences, mismatched table delimiters/columns, raw image/bold markup, missing local images, and final article sections accidentally appearing inside code.
- Verified the EKS final headings render outside code and the Tail at Scale images render as three width-600 image elements.

The reusable audit runs against the current `dist`, so build first. External image network checks are a separate manual step. The repaired articles and recovered Thanos image are included in the subsequent GitHub Pages deployment.
