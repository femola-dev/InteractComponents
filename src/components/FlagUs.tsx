import frame from '../assets/icons/flag-us/frame.svg'
import stripes from '../assets/icons/flag-us/stripes.svg'
import canton from '../assets/icons/flag-us/canton.svg'
import e0 from '../assets/icons/flag-us/e0.svg'
import b0 from '../assets/icons/flag-us/b0.svg'
import e1 from '../assets/icons/flag-us/e1.svg'
import b1 from '../assets/icons/flag-us/b1.svg'
import e2 from '../assets/icons/flag-us/e2.svg'
import b2 from '../assets/icons/flag-us/b2.svg'
import e3 from '../assets/icons/flag-us/e3.svg'
import b3 from '../assets/icons/flag-us/b3.svg'
import e4 from '../assets/icons/flag-us/e4.svg'
import b4 from '../assets/icons/flag-us/b4.svg'

/**
 * Figma node 152:1435, transcribed structure-for-structure.
 *
 * Figma exports this flag as thirteen separate vector fragments — a base, the
 * stripe field, the canton, and a star pair (`e`/`b`) per column — rather than
 * one SVG, so the nesting and the percentage insets below are the export's, not
 * a hand-drawn approximation. The wrapper is wider than the clip
 * (`inset-[0_-45%]`) because the flag is a 3:2 rectangle cropped to a circle.
 *
 * Renders at 16px; the surrounding 20px box comes from the caller.
 */
export function FlagUs() {
  return (
    <div className="absolute top-[2px] left-[2px] size-[16px] overflow-clip rounded-[8px] bg-white">
      <div className="absolute inset-[0_-45%] overflow-clip">
        <img alt="" src={frame} className="absolute inset-0 block size-full max-w-none" />

        <div className="absolute inset-[11.54%_0]">
          <div className="absolute inset-[-5%_0]">
            <img alt="" src={stripes} className="block size-full max-w-none" />
          </div>
        </div>

        <div className="absolute inset-[0_60%_46.15%_0]">
          <img alt="" src={canton} className="absolute inset-0 block size-full max-w-none" />
        </div>

        {/* Star columns */}
        <div className="absolute inset-[2.31%_95.13%_49.05%_1.79%]">
          <img alt="" src={e0} className="absolute inset-0 block size-full max-w-none" />
        </div>
        <div className="absolute inset-[7.69%_91.8%_54.43%_5.12%]">
          <img alt="" src={b0} className="absolute inset-0 block size-full max-w-none" />
        </div>

        <div className="absolute inset-[2.31%_88.46%_49.05%_8.46%]">
          <div className="absolute inset-[0_-0.15%_0_0]">
            <img alt="" src={e1} className="block size-full max-w-none" />
          </div>
        </div>
        <div className="absolute inset-[7.69%_85.13%_54.43%_11.79%]">
          <img alt="" src={b1} className="absolute inset-0 block size-full max-w-none" />
        </div>

        <div className="absolute inset-[2.31%_81.8%_49.05%_15.12%]">
          <img alt="" src={e2} className="absolute inset-0 block size-full max-w-none" />
        </div>
        <div className="absolute inset-[7.69%_78.47%_54.43%_18.45%]">
          <img alt="" src={b2} className="absolute inset-0 block size-full max-w-none" />
        </div>

        <div className="absolute inset-[2.31%_75.13%_49.05%_21.79%]">
          <div className="absolute inset-[0_0_0_-0.15%]">
            <img alt="" src={e3} className="block size-full max-w-none" />
          </div>
        </div>
        <div className="absolute inset-[7.69%_71.8%_54.43%_25.12%]">
          <img alt="" src={b3} className="absolute inset-0 block size-full max-w-none" />
        </div>

        <div className="absolute inset-[2.31%_68.46%_49.05%_28.46%]">
          <img alt="" src={e4} className="absolute inset-0 block size-full max-w-none" />
        </div>
        <div className="absolute inset-[7.69%_65.13%_54.43%_31.79%]">
          <img alt="" src={b4} className="absolute inset-0 block size-full max-w-none" />
        </div>

        {/* Last column reuses the fourth column's star. */}
        <div className="absolute inset-[2.31%_61.79%_49.05%_35.13%]">
          <div className="absolute inset-[0_0_0_-0.15%]">
            <img alt="" src={e3} className="block size-full max-w-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
