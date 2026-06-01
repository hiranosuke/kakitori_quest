import { useEffect, useRef, useState } from 'react'

// @k1low/kakitori の型は package の型定義を参照
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any

export function KakitoriProbe() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [log, setLog] = useState<string[]>([])

  const addLog = (msg: string) =>
    setLog((prev) => [...prev, `${new Date().toISOString().slice(11, 23)} ${msg}`])

  useEffect(() => {
    if (!hostRef.current) return
    let charInstance: AnyData = null

    const init = async () => {
      const kakitoriModule = await import('@k1low/kakitori')
      addLog(`kakitori exports: ${Object.keys(kakitoriModule).join(', ')}`)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const char = kakitoriModule.char ?? (kakitoriModule as any).default?.char
      if (!char) {
        addLog('ERROR: char not found in kakitori exports')
        return
      }

      charInstance = char.create('い')
      charInstance.mount(hostRef.current, {
        onCorrectStroke: (data: AnyData) => {
          addLog(`onCorrectStroke: ${JSON.stringify(data)}`)
        },
        onMistake: (data: AnyData) => {
          addLog(`onMistake: ${JSON.stringify(data)}`)
        },
        onComplete: (data: AnyData) => {
          addLog(`onComplete: ${JSON.stringify(data)}`)
        },
      })
    }

    init()
    return () => {
      charInstance?.unmount?.()
    }
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#fff', fontFamily: 'monospace' }}>
      <div ref={hostRef} style={{ width: '50%', border: '1px solid #333' }} />
      <div style={{ width: '50%', padding: '8px', overflowY: 'auto', fontSize: '11px' }}>
        <div style={{ color: '#ffd700', marginBottom: '8px' }}>kakitori API probe — 「い」を書いてください</div>
        {log.map((l, i) => <div key={i} style={{ borderBottom: '1px solid #222', padding: '2px 0' }}>{l}</div>)}
      </div>
    </div>
  )
}
