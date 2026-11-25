// Uses your real logo from public/logo.jpeg, cropped to the artwork.
const IMG_W = 1080;
const IMG_H = 687;
const CROP = { x: 190, y: 225, w: 668, h: 204 };

export function Logo({
  width = 150,
  className = "",
}: {
  width?: number;
  className?: string;
}) {
  const s = width / CROP.w;
  return (
    <span
      role="img"
      aria-label="RETURNi"
      className={`relative inline-block overflow-hidden align-middle ${className}`}
      style={{ width, height: CROP.h * s }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.jpeg"
        alt=""
        style={{
          position: "absolute",
          maxWidth: "none",
          width: IMG_W * s,
          height: IMG_H * s,
          left: -CROP.x * s,
          top: -CROP.y * s,
          mixBlendMode: "multiply",
        }}
      />
    </span>
  );
}