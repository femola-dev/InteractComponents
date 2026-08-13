import { SoundProvider } from '@web-kits/audio/react'
import { InterfaceKit } from 'interface-kit/react'
import { PlaygroundSwitcher } from './components/PlaygroundSwitcher'
import { SweepProvider } from './components/sweep'
import { MASTER_VOLUME } from './lib/sound'
import { usePlayground } from './playgrounds/usePlayground'

export default function App() {
  const { active, setActiveId } = usePlayground()
  const { Component } = active

  return (
    <div className="flex min-h-svh flex-col">
      {/* Above the switcher for the same reason `SweepProvider` is: it owns one
          master bus for the whole app, and a playground that swaps underneath
          it should inherit that rather than build its own.

          Nothing here starts an AudioContext — the library opens one lazily on
          the first sound, and every sound in the app is triggered by a click.
          So the context is always created inside a user gesture, which is the
          only way a browser will let it start unsuspended. */}
      <SoundProvider volume={MASTER_VOLUME}>
        {/* Provider stays above the switcher so every playground's DeviceFrame
            can mount the sweep canvas, whether or not it triggers a sweep. */}
        <SweepProvider>
          {/* Remount on switch so each playground gets its entrance animation. */}
          <Component key={active.id} />
        </SweepProvider>
      </SoundProvider>

      <PlaygroundSwitcher activeId={active.id} onSelect={setActiveId} />

      {/* Dev-only visual editor — tree-shaken out of production builds. */}
      {import.meta.env.DEV && <InterfaceKit />}
    </div>
  )
}
