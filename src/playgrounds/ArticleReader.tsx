import { useRef, useState } from 'react'
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
import { useActiveSection } from '../components/useActiveSection'
import { useSweep } from '../components/sweep-context'
import { article } from '../content/article'

type View = 'article' | 'summary'

export function ArticleReader() {
  const [view, setView] = useState<View>('article')
  const [isPlaying, setIsPlaying] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sweep = useSweep()

  const activeSection = useActiveSection(scrollRef, article.sections[0].id)

  const toggleView = () => {
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
      {/* Left rail — document outline */}
      <aside className="border-hairline relative hidden shrink-0 border-r pt-[132px] pl-[25px] lg:block lg:w-[180px] xl:w-[264px]">
        <OutlineMinimap
          activeSection={activeSection}
          onSelect={scrollToSection}
        />
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
                    isPlaying={isPlaying}
                    onToggleListen={() => setIsPlaying((p) => !p)}
                  />
                </div>
                <ArticleBody />
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
          <AskAiFab label={fabLabel} onActivate={toggleView} />
        </div>
      </aside>

      {/* Rails collapse on smaller screens, so the action floats over the content */}
      <div className="absolute right-5 bottom-6 z-20 lg:hidden">
        <AskAiFab label={fabLabel} onActivate={toggleView} />
      </div>
    </DeviceFrame>
  )
}
