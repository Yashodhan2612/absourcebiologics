#!/usr/bin/env bash
#
# Fetch the real brand, facility, product and certification assets from the
# live WordPress site into public/assets/.
#
#   bash scripts/fetch-assets.sh
#   pnpm optimise-assets       # AVIF + WebP at 1x/2x via sharp
#
# Originals are preserved in public/assets/_source/ (gitignored).
# URLs that 404 are skipped and reported in the summary at the end — the live
# site's client-logo numbering is not contiguous, so some misses are expected
# and are not failures.
#
# PORTABILITY: this script must run on macOS, whose /bin/bash is still 3.2.
# That means NO associative arrays and NO `declare -A`. Pairs are passed as
# "url<space>dest" lines through a here-doc instead. If you add assets, keep
# that shape — an earlier revision used `declare -A` and silently aborted
# two thirds of the way through the manifest on every Mac.

set -uo pipefail

BASE="https://absourcebiologics.com/wp-content/uploads"
OUT="public/assets"
SRC="$OUT/_source"

ok=0
missed=0
MISSING=""

fetch() {
  url="$1"
  dest="$2"
  mkdir -p "$(dirname "$SRC/$dest")"
  if curl -fsSL --max-time 45 "$url" -o "$SRC/$dest" 2>/dev/null; then
    mkdir -p "$(dirname "$OUT/$dest")"
    cp "$SRC/$dest" "$OUT/$dest"
    printf '  ok    %s\n' "$dest"
    ok=$((ok + 1))
  else
    rm -f "$SRC/$dest"
    printf '  miss  %s\n' "$dest"
    MISSING="$MISSING  $url
"
    missed=$((missed + 1))
  fi
}

# Reads "url dest" pairs from stdin, skipping blank lines and # comments.
fetch_list() {
  while read -r url dest; do
    case "$url" in "" | \#*) continue ;; esac
    fetch "$url" "$dest"
  done
}

echo "Brand"
fetch_list <<EOF
$BASE/2020/12/Artboard-1.png            brand/logo.png
$BASE/2020/12/Artboard-1-1-300x300.png  brand/mark.png
EOF

echo "Facility"
fetch_list <<EOF
$BASE/2020/12/Picture3.jpg                                    facility/qc-lab.jpg
$BASE/2020/12/Picture2-1024x643.jpg                           facility/fermentation.jpg
$BASE/2021/08/DSC00556-Copy-1024x683.jpg                      facility/plant-01.jpg
$BASE/2022/06/IMG-20220621-WA0085-e1731388862439-1024x691.jpg facility/plant-02.jpg
EOF

# Leadership portraits are NOT fetched here. They need cropping — the sources
# are 3:2 landscape and the page shows 3:4 portraits — and running that crop is
# what keeps the page from upscaling them. See scripts/prepare-portraits.mjs,
# which downloads and crops in one step:
#
#   node scripts/prepare-portraits.mjs
#
# Fetching them here as well would overwrite the crops with full frames.

# The thirteen DVS sachets. Filenames on the live site are the strain codes.
echo "DVS culture sachets"
fetch_list <<EOF
$BASE/2022/06/CU01-768x1024.jpg products/cultures/abdahi.jpg
$BASE/2022/06/LF01-768x1024.jpg products/cultures/abdahi-low-fat.jpg
$BASE/2022/06/YC01-768x1024.jpg products/cultures/abyogurt.jpg
$BASE/2022/06/BU01-768x1024.jpg products/cultures/abchach.jpg
$BASE/2022/06/LB01-768x1024.jpg products/cultures/ablaban.jpg
$BASE/2022/06/CH01-768x1024.jpg products/cultures/abcheese.jpg
$BASE/2022/06/LA01-768x1024.jpg products/cultures/ablassi.jpg
$BASE/2022/06/MD01-768x1024.jpg products/cultures/abmishti.jpg
$BASE/2022/06/SH01-768x1024.jpg products/cultures/abshri.jpg
$BASE/2022/06/CR01-768x1024.jpg products/cultures/abcream.jpg
$BASE/2022/06/PB01-768x1024.jpg products/cultures/abprobio.jpg
$BASE/2022/06/KF01-768x1024.jpg products/cultures/abkefir.jpg
$BASE/2022/06/BS01-768x1024.jpg products/cultures/abbio-shield.jpg
EOF

echo "Dairy ingredients"
fetch_list <<EOF
$BASE/2024/11/bind-589x1024.png    products/ingredients/abbind.png
$BASE/2024/11/pro-1-589x1024.png   products/ingredients/abpro.png
$BASE/2024/11/renno-589x1024.png   products/ingredients/abrenno.png
$BASE/2024/11/merge-1-589x1024.png products/ingredients/abmerge.png
$BASE/2021/08/bindmax-Copy.png     products/ingredients/abbindmax.png
$BASE/2021/08/blend-Copy.png       products/ingredients/abblend.png
$BASE/2021/06/hipro1.png           products/ingredients/abhipro.png
EOF

echo "Taste maker"
fetch_list <<EOF
$BASE/2024/11/spice-1-589x1024.png products/taste-makers/abspice.png
EOF

echo "Certifications"
fetch_list <<EOF
$BASE/2020/12/cer-1.png certs/iso-9001.png
$BASE/2020/12/cer-4.png certs/iso-22000.png
$BASE/2020/12/cer-3.png certs/haccp.png
$BASE/2020/12/cer-2.png certs/halal.png
EOF

# Client logos. The numbering is not contiguous on the live site; 404s here are
# expected. Only logos that already appear on the Clientele page may be used.
echo "Client logos"
for name in vita rajhans RAINBOW DICE AZIMUT; do
  fetch "$BASE/2021/08/${name}.png" "clients/${name}.png"
done
for n in 1-2 2-2 3-2 4-2 5-2 6-2 7-1 8-2 9 $(seq 10 55); do
  fetch "$BASE/2020/12/${n}.png" "clients/${n}.png"
done

# NOT FETCHED, deliberately: two 2024/11 images with Freepik-pattern filenames
# ("health-care-researchers-working-life-science-laboratory-work-test-vaccine",
# "image-two-young-business-partners-talking-office"). Licence status unknown.

echo
echo "-----------------------------------------------"
echo "Fetched: $ok    Missing: $missed"
if [ "$missed" -gt 0 ]; then
  echo
  echo "Missing URLs (expected for non-contiguous client logo numbering):"
  printf '%s' "$MISSING"
fi
echo
echo "Next steps:"
echo "  1. pnpm optimise-assets"
echo "  2. Sample brand/logo.png and reconcile the palette in src/app/globals.css."
echo "     Re-run: node scripts/check-contrast.mjs"
echo "  3. Populate src/content/clients.ts from what landed in $OUT/clients/."
