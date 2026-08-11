import { motion } from 'framer-motion'
import { article } from '../content/article'
import { useRise } from './rise'

const { summary } = article

export function AiSummary() {
  const rise = useRise()

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <motion.div {...rise(0.05)} className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{
              background:
                'linear-gradient(135deg, #69bff9 0%, #b96af3 34%, #e9685e 67%, #f2ac3e 100%)',
            }}
          />
          <span className="text-[12px] leading-4 tracking-[-0.108px] text-muted">
            {summary.kicker}
          </span>
          <span className="text-[12px] leading-4 text-hairline">•</span>
          <span className="text-[12px] leading-4 tracking-[-0.108px] text-muted">
            {summary.readingTime}
          </span>
        </motion.div>

        <motion.h1
          {...rise(0.12)}
          className="font-display text-[28px] leading-[1.2] text-ink sm:text-[34px]"
        >
          {article.title}
        </motion.h1>

        <motion.p
          {...rise(0.19)}
          className="text-[14px] leading-6 tracking-[-0.126px] text-outline"
        >
          {summary.lede}
        </motion.p>
      </header>

      <ol className="flex flex-col gap-6">
        {summary.points.map((point, i) => (
          <motion.li key={point.heading} {...rise(0.26 + i * 0.08)} className="flex gap-3">
            <span className="mt-[3px] w-4 shrink-0 text-[12px] leading-6 tabular-nums text-muted">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-[14px] leading-6 font-medium tracking-[-0.126px] text-ink">
                {point.heading}
              </h2>
              <p className="text-[14px] leading-6 tracking-[-0.126px] text-outline">
                {point.body}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
