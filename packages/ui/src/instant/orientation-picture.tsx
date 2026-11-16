import type { ImgHTMLAttributes } from "react";

interface OrientationPictureProps {
  /* The srcSet of the landscape image (next/image getImageProps). */
  landscape: string;
  /* The props of the portrait image, from next/image getImageProps: src, srcSet, sizes, alt, loading… */
  portrait: ImgHTMLAttributes<HTMLImageElement> & { alt: string };
}

/* One image per orientation, of which the browser downloads only the one it shows: the Instant scene lays its
   drawing out by orientation, so its poster does too. */
export function OrientationPicture({ landscape, portrait }: OrientationPictureProps) {
  return (
    <picture data-slot="orientation-picture" className="block size-full">
      <source media="(orientation: landscape)" srcSet={landscape} />
      {/* oxlint-disable-next-line nextjs/no-img-element -- the img carries next/image's own optimised output (getImageProps), the documented way to art-direct. */}
      <img {...portrait} alt={portrait.alt} className="block size-full object-cover" />
    </picture>
  );
}
