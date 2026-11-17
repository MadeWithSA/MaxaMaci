import { useEffect, useRef, useState } from 'react'

export default function Select({ value, options, onChange, label, compact }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const out = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', out)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc) }
  }, [open])
  const cur = options.find((o) => o.value === value)
  return (
    <div className={'sel' + (compact ? ' compact' : '')} ref={ref}>
      <button type="button" className="selbtn" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}>
        {cur?.label}<i className={open ? 'up' : ''}>▾</i>
      </button>
      {open && (
        <ul className="sellist" role="listbox">
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value} className={o.value === value ? 'on' : ''} onClick={() => { onChange(o.value); setOpen(false) }}>{o.label}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
