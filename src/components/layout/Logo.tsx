import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The ABsource Biologics lockup.
 *
 * Built by `npm run prepare-brand` from the largest artwork the live site
 * holds (601x206, trimmed to 550x179 — there is no unscaled original behind
 * it in the media library). Header and Footer both come through here; nothing
 * else references the logo.
 *
 * TWO THINGS ARE DELIBERATE AND EASY TO UNDO BY ACCIDENT:
 *
 * `unoptimized` — the source is already a LOSSLESS 4.2KB WebP. Letting
 * next/image re-encode it would put it back through a lossy pass at q75 and
 * ring every letter edge, which is precisely what shows on flat-colour vector
 * art at navbar sizes. Serving the file as-is is both smaller and sharper.
 * This is the rare case where the image optimiser makes things worse.
 *
 * The reversed variant is a separate asset rather than a CSS filter. The
 * wordmark is dark blue and "BIOLOGICS" is black, so on the footer's ab-tank
 * ground the original all but disappears; prepare-brand.mjs generates an
 * ab-milk knockout from the artwork's alpha channel.
 */

/** Intrinsic size of the trimmed artwork. Keep in step with prepare-brand.mjs. */
const INTRINSIC = { width: 550, height: 179 };

export function Logo({
  className,
  tone = "default",
  priority = false,
}: {
  className?: string;
  tone?: "default" | "reversed";
  /** Set on the header lockup — it is above the fold on every page. */
  priority?: boolean;
}) {
  const reversed = tone === "reversed";
  return (
    <Image
      src={reversed ? "/assets/brand/logo-reversed.webp" : "/assets/brand/logo.webp"}
      alt="ABsource Biologics"
      width={INTRINSIC.width}
      height={INTRINSIC.height}
      priority={priority}
      unoptimized
      // `self-start` is not cosmetic. As a direct child of a flex column —
      // which is how the footer lays out — the default `align-items: stretch`
      // resolves `w-auto` to the container's full width and stretches the
      // lockup to its container (320px wide against a 44px height, in the
      // footer's case). Pinning align-self stops any flex parent doing that.
      className={cn("w-auto self-start", className)}
    />
  );
}
