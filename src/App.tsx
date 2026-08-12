import { InterfaceKit } from 'interface-kit/react'
import { PlaygroundSwitcher } from './components/PlaygroundSwitcher'
import { SweepProvider } from './components/sweep'
import { usePlayground } from './playgrounds/usePlayground'

export default function App() {
  const { active, setActiveId } = usePlayground()
  const { Component } = active

  return (
    <div className="flex min-h-svh flex-col">
      {/* Provider stays above the switcher so every playground's DeviceFrame can
          mount the sweep canvas, whether or not it triggers a sweep. */}
      <SweepProvider>
        {/* Remount on switch so each playground gets its entrance animation. */}
        <Component key={active.id} />
      </SweepProvider>

      <PlaygroundSwitcher activeId={active.id} onSelect={setActiveId} />

      {/* Dev-only visual editor — tree-shaken out of production builds. */}
      {import.meta.env.DEV && <InterfaceKit />}
    </div>
  )
}
