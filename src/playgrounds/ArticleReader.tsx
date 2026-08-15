import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ActionsBar } from '../components/ActionsBar'
import { AiSummary } from '../components/AiSummary'
import { ArticleBody } from '../components/ArticleBody'
import { ArticleHeader } from '../components/ArticleHeader'
import { AskAiFab } from '../components/AskAiFab'
import { DeviceFrame } from '../components/DeviceFrame'
import { HatchBand } from '../components/HatchBand'
import { OutlineMinimap } from '../components/OutlineMinimap'
import { ProgressiveBlur } from '../components/ProgressiveBlur'
import { PublishedMeta } from '../components/PublishedMeta'
import { TOTAL_WORDS } from '../components/reading'
import { useActiveSection } from '../components/useActiveSection'
import { useReadingCursor, type NarrationStatus } from '../components/useReadingCursor'
import { useSweep } from '../components/sweep-context'
import { article } from '../content/article'

type View = 'article' | 'summary'

export function ArticleReader() {
  const [view, setView] = useState<View>('article')
  // Narration is a hold, not a stop: it lives here for the life of the page and
  // only a reload puts it back to `idle`.
  const [narration, setNarration] = useState<NarrationStatus>('idle')
  const scrollRef = useRef<HTMLDivElement>(null)
  const sweep = useSweep()

  const isPlaying = narration === 'playing'
  const activeSection = useActiveSection(scrollRef, article.sections[0].id)
  const readingCursor = useReadingCursor(narration, TOTAL_WORDS)

  // Follow the highlight, but only once it leaves the comfortable middle band —
  // scrolling on every word would yank the page out from under the reader.
  useEffect(() => {
    const container = scrollRef.current
    if (readingCursor === null || !container) return

    const mark = container.querySelector<HTMLElement>('[data-reading-active]')
    if (!mark) return

    const frame = container.getBoundingClientRect()
    const box = mark.getBoundingClientRect()
    if (box.top >= frame.top + frame.height * 0.25 && box.bottom <= frame.top + frame.height * 0.7) {
      return
    }

    container.scrollTo({
      top: container.scrollTop + (box.top - frame.top) - frame.height * 0.35,
      behavior: 'smooth',
    })
    // `view` is a dependency so coming back from the summary brings the parked
    // mark into sight rather than leaving it wherever the fresh scroll landed.
  }, [readingCursor, view])

  const toggleView = () => {
    // Narration belongs to the article; the summary is not what it was reading.
    // It holds rather than stops, so the article is still mid-sentence on return.
    setNarration((s) => (s === 'playing' ? 'paused' : s))
    sweep(
      () => {
        setView((v) => (v === 'article' ? 'summary' : 'article'))
        scrollRef.current?.scrollTo({ top: 0 })
      },
      // Sweep back the way it came when returning to the article.
      { direction: view === 'article' ? 'ltr' : 'rtl' },
    )
  }

  const fabLabel = view === 'article' ? 'Summarize Article' : 'Back to Article'
  const fabMode = view === 'article' ? 'summarize' : 'back'

  const scrollToSection = (id: string) => {
    const container = scrollRef.current
    const target = container?.querySelector<HTMLElement>(`[data-section="${id}"]`)
    if (!container || !target) return

    const top =
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop

    container.scrollTo({ top: Math.max(0, top - 24), behavior: 'smooth' })
  }

  return (
    <DeviceFrame>
      {/* Left rail — document outline. The Figma places the outline's first
          stroke at 24,131 from the screen's outer edge; the rail sits inside the
          screen's 1.5px border, so both offsets lose that 1.5. */}
      <aside className="border-hairline relative hidden shrink-0 border-r pt-[129.5px] pl-[22.5px] lg:block lg:w-[180px] xl:w-[264px]">
        {/* The outline maps the article's own sections, so it has nothing to
            point at on the summary — it leaves and the rail stays. */}
        <AnimatePresence>
          {view === 'article' && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <OutlineMinimap
                activeSection={activeSection}
                onSelect={scrollToSection}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-[35px] left-[25px]">
          <PublishedMeta />
        </div>
      </aside>

      {/* Center column — article or AI summary */}
      <div className="relative flex min-w-0 flex-1 flex-col md:mx-auto md:max-w-[613px]">
        <div className="h-band-gap shrink-0" />
        <HatchBand isPlaying={isPlaying} />

        <div ref={scrollRef} className="scroll-hidden min-h-0 flex-1 overflow-y-auto">
          <article
            key={view}
            className="gap-read-gap pt-read-top pb-read-bottom flex flex-col px-6 sm:px-14"
          >
            {view === 'article' ? (
              <>
                <div className="flex flex-col gap-6">
                  <ArticleHeader />
                  <ActionsBar
                    status={narration}
                    onToggleListen={() =>
                      setNarration((s) => (s === 'playing' ? 'paused' : 'playing'))
                    }
                  />
                </div>
                <ArticleBody cursor={readingCursor} />
              </>
            ) : (
              <AiSummary />
            )}
          </article>
        </div>

        <ProgressiveBlur />
      </div>

      {/* Right rail — floating action */}
      <aside className="border-hairline relative hidden shrink-0 border-l lg:block lg:w-[180px] xl:w-[264px]">
        <div className="absolute right-6 bottom-5">
          <AskAiFab label={fabLabel} mode={fabMode} onActivate={toggleView} />
        </div>
      </aside>

      {/* Rails collapse on smaller screens, so the action floats over the content */}
      <div className="absolute right-5 bottom-6 z-20 lg:hidden">
        <AskAiFab label={fabLabel} mode={fabMode} onActivate={toggleView} />
      </div>
    </DeviceFrame>
  )
}
