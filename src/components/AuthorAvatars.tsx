import { article } from '../content/article'

/**
 * Figma "Frame 4" (node 68:959): three 20px avatars on a -6px gap.
 *
 * The PNGs in assets are node exports at 4× that already bake in the design's
 * 0.5px rgba(0,0,0,0.2) ring and its three drop shadows — 88×92 is the 80×80
 * core plus exactly the shadow bleed (1px sides/top, 2px bottom at 1×). So the
 * image is placed raw: adding a CSS border or shadow here would double the ring,
 * which is what made it read as a hard black outline.
 */
const IMG_W = 22 // 88 / 4
const IMG_H = 23 // 92 / 4
const BLEED = 1 // 4 / 4 — offset of the 20px core inside the export

export function AuthorAvatars() {
  return (
    <div className="flex items-center">
      {article.avatars.map((avatar, i) => (
        <span
          key={avatar.alt}
          className="relative size-5 shrink-0"
          style={{
            marginLeft: i === 0 ? 0 : -6,
            // Figma paints earlier siblings on top: the leftmost avatar overlaps
            // the one after it.
            zIndex: article.avatars.length - i,
          }}
        >
          <img
            src={avatar.src}
            alt={avatar.alt}
            width={IMG_W}
            height={IMG_H}
            className="pointer-events-none absolute max-w-none select-none"
            style={{ width: IMG_W, height: IMG_H, left: -BLEED, top: -BLEED }}
          />
        </span>
      ))}
    </div>
  )
}
