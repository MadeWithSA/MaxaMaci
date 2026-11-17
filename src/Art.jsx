export default function Art({ shape, hue }) {
  const a = `hsl(${hue} 72% 64%)`
  const b = `hsl(${hue} 62% 42%)`
  const dk = `hsl(${hue} 30% 22%)`
  const id = `g${hue}`
  const lbl = <rect x="34" y="54" width="32" height="20" rx="5" fill="#fff" opacity=".82" />
  const body = {
    dropper: <><rect x="44" y="4" width="12" height="16" rx="6" fill={dk} /><rect x="43" y="20" width="14" height="10" fill={dk} /><rect x="28" y="30" width="44" height="62" rx="11" fill={`url(#${id})`} />{lbl}</>,
    tube: <><path d="M30 22H70L66 84Q50 94 34 84Z" fill={`url(#${id})`} /><rect x="38" y="8" width="24" height="14" rx="4" fill={dk} />{lbl}</>,
    jar: <><rect x="22" y="26" width="56" height="16" rx="6" fill={dk} /><rect x="18" y="42" width="64" height="46" rx="12" fill={`url(#${id})`} /><rect x="30" y="54" width="40" height="22" rx="6" fill="#fff" opacity=".82" /></>,
    pump: <><rect x="48" y="6" width="26" height="7" rx="3" fill={dk} /><rect x="44" y="12" width="8" height="14" fill={dk} /><rect x="38" y="24" width="20" height="8" rx="2" fill={dk} /><rect x="28" y="32" width="44" height="60" rx="11" fill={`url(#${id})`} />{lbl}</>,
    lipstick: <><path d="M38 46V28Q38 16 50 10Q62 16 62 28V46Z" fill={a} /><rect x="32" y="46" width="36" height="12" rx="2" fill="#d8b868" /><rect x="34" y="58" width="32" height="34" rx="5" fill={dk} /></>,
    gloss: <><rect x="40" y="34" width="20" height="58" rx="9" fill={`url(#${id})`} /><rect x="37" y="8" width="26" height="28" rx="7" fill={dk} /><rect x="44" y="58" width="12" height="18" rx="3" fill="#fff" opacity=".82" /></>,
  }[shape]
  return (
    <svg viewBox="0 0 100 100" role="img" aria-hidden="true">
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <ellipse cx="50" cy="94" rx="30" ry="4" fill="#000" opacity=".12" />
      {body}
      <rect x="33" y="36" width="4" height="46" rx="2" fill="#fff" opacity=".28" />
    </svg>
  )
}
