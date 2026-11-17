import { useEffect, useMemo, useState } from 'react'
import { PRODUCTS, T } from './store.js'
import Art from './Art.jsx'
import Select from './Select.jsx'

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const fmt = (n) => n.toLocaleString('ru-RU')
const digits = (s) => s.replace(/\D/g, '')
const byId = (id) => PRODUCTS.find((p) => p.id === +id)

function usePersist(k, d) {
  const [v, setV] = useState(() => load(k, d))
  useEffect(() => { localStorage.setItem(k, JSON.stringify(v)) }, [k, v])
  return [v, setV]
}

function useHash() {
  const [h, setH] = useState(() => location.hash.slice(1) || '/')
  useEffect(() => {
    const f = () => { setH(location.hash.slice(1) || '/'); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return h
}

function Card({ p, lang, t, fav, onFav, onAdd, i = 0 }) {
  return (
    <article className="card reveal" style={{ transitionDelay: `${(i % 4) * 70}ms` }}>
      <div className="thumbwrap">
        <a href={`#/product/${p.id}`} className="thumb" style={{ '--h': p.hue }} aria-label={p.name[lang]}><Art shape={p.shape} hue={p.hue} /></a>
        <button className={'heart' + (fav ? ' on' : '')} onClick={() => onFav(p.id)} aria-pressed={fav} aria-label={t.fav}>{fav ? '♥' : '♡'}</button>
      </div>
      <a href={`#/product/${p.id}`}><h3>{p.name[lang]}</h3></a>
      <div className="row">
        <b>{fmt(p.price)} {t.cur}</b>
        <button className="btn sm" onClick={() => onAdd(p.id)}>{t.add}</button>
      </div>
    </article>
  )
}

export default function App() {
  const [lang, setLang] = usePersist('mm-lang', 'ru')
  const [theme, setTheme] = usePersist('mm-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const [cart, setCart] = usePersist('mm-cart', {})
  const [favs, setFavs] = usePersist('mm-favs', [])
  const [users, setUsers] = usePersist('mm-users', [])
  const [session, setSession] = usePersist('mm-session', '')
  const [orders, setOrders] = usePersist('mm-orders', {})
  const [now, setNow] = useState(Date.now())
  const [toast, setToast] = useState('')
  const [bump, setBump] = useState(0)
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('def')
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', phone: '', pass: '', addr: '' })
  const [err, setErr] = useState('')
  const route = useHash()
  const t = T[lang]
  const user = users.find((u) => u.phone === session)
  const mine = (user && orders[user.phone]) || []

  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 5000); return () => clearInterval(i) }, [])
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: 0.1 })
    const id = setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el)), 30)
    return () => { clearTimeout(id); io.disconnect() }
  }, [route, cat, q, sort, lang, session])

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 1800) }
  const add = (id) => { setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })); setBump((b) => b + 1); flash(t.added) }
  const change = (id, d) => setCart((c) => { const r = { ...c }; const n = (c[id] || 0) + d; if (n > 0) r[id] = n; else delete r[id]; return r })
  const toggleFav = (id) => setFavs((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))
  const setField = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const cardProps = { lang, t, onFav: toggleFav, onAdd: add }
  const count = Object.values(cart).reduce((a, b) => a + b, 0)
  const total = Object.entries(cart).reduce((s, [id, n]) => s + byId(id).price * n, 0)
  const stage = (o) => { const m = (now - o.ts) / 60000; return m < 0.5 ? 0 : m < 2 ? 1 : m < 4 ? 2 : 3 }
  const date = (ts) => new Date(ts).toLocaleString(lang === 'en' ? 'en-GB' : 'ru-RU', { dateStyle: 'short', timeStyle: 'short' })

  const auth = (e) => {
    e.preventDefault()
    const phone = digits(f.phone)
    if (mode === 'reg') {
      if (!f.name.trim() || phone.length < 9 || f.pass.length < 4) return setErr(t.short)
      if (users.some((u) => u.phone === phone)) return setErr(t.exists)
      setUsers([...users, { name: f.name.trim(), phone, pass: f.pass, since: Date.now() }])
      setSession(phone); flash(t.welcome)
    } else {
      if (!users.some((u) => u.phone === phone && u.pass === f.pass)) return setErr(t.bad)
      setSession(phone)
    }
    setErr(''); setF({ name: '', phone: '', pass: '', addr: '' })
  }
  const checkout = (e) => {
    e.preventDefault()
    if (!user || !f.addr.trim()) return
    const items = Object.entries(cart).map(([id, n]) => ({ id: +id, n, price: byId(id).price }))
    const o = { id: 100 + mine.length + 1, ts: Date.now(), items, total, addr: f.addr.trim() }
    setOrders({ ...orders, [user.phone]: [o, ...mine] })
    setCart({}); setF((s) => ({ ...s, addr: '' })); flash(t.ordered)
    location.hash = '/profile'
  }

  const list = useMemo(() => {
    let r = PRODUCTS.filter((p) => (cat === 'all' || p.cat === cat) && p.name[lang].toLowerCase().includes(q.toLowerCase()))
    if (sort === 'low') r = [...r].sort((a, b) => a.price - b.price)
    if (sort === 'high') r = [...r].sort((a, b) => b.price - a.price)
    return r
  }, [cat, q, sort, lang])

  const grid = (arr) => <div className="grid">{arr.map((p, i) => <Card key={p.id} p={p} i={i} fav={favs.includes(p.id)} {...cardProps} />)}</div>
  const feats = <div className="feats">{[1, 2, 3].map((i) => <div className="feat reveal" key={i}><h3>{t['f' + i]}</h3><p className="muted">{t['f' + i + 'd']}</p></div>)}</div>
  const catList = ['all', 'face', 'body', 'hair', 'lips']

  let page
  const pm = route.match(/^\/product\/(\d+)/)
  if (pm) {
    const p = byId(pm[1])
    page = p ? (
      <section className="wrap">
        <div className="detail">
          <div className="thumb big" style={{ '--h': p.hue }}><Art shape={p.shape} hue={p.hue} /></div>
          <div>
            <a href="#/catalog" className="link">← {t.back}</a>
            <h1>{p.name[lang]}</h1>
            <p className="price">{fmt(p.price)} {t.cur}</p>
            <p className="muted">{t[p.cat]}. {t.f1d}</p>
            <div className="acts">
              <button className="btn" onClick={() => add(p.id)}>{t.add}</button>
              <button className={'btn ghost' + (favs.includes(p.id) ? ' on' : '')} onClick={() => toggleFav(p.id)}>{favs.includes(p.id) ? '♥' : '♡'} {t.fav}</button>
            </div>
          </div>
        </div>
        <h2 className="reveal">{t.related}</h2>
        {grid(PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4))}
      </section>
    ) : <section className="wrap"><p>{t.none}</p></section>
  } else if (route === '/catalog') {
    page = (
      <section className="wrap">
        <h1>{t.catalog}</h1>
        <div className="tools">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.search} />
          <Select label={t.sort} value={sort} onChange={setSort} options={[{ value: 'def', label: t.sDef }, { value: 'low', label: t.sLow }, { value: 'high', label: t.sHigh }]} />
        </div>
        <div className="chips">{catList.map((c) => <button key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{t[c]}</button>)}</div>
        <p className="muted">{t.found}: {list.length}</p>
        {list.length ? grid(list) : <p className="muted">{t.none}</p>}
      </section>
    )
  } else if (route === '/favs') {
    page = <section className="wrap"><h1>{t.fav}</h1>{favs.length ? grid(PRODUCTS.filter((p) => favs.includes(p.id))) : <p className="muted">{t.favEmpty}</p>}</section>
  } else if (route === '/cart') {
    const items = Object.entries(cart).map(([id, n]) => ({ p: byId(id), n }))
    page = (
      <section className="wrap narrow">
        <h1>{t.cart}</h1>
        {!items.length ? <p className="muted">{t.empty}</p> : (
          <>
            {items.map(({ p, n }) => (
              <div className="line" key={p.id}>
                <div className="thumb mini" style={{ '--h': p.hue }}><Art shape={p.shape} hue={p.hue} /></div>
                <div className="grow"><a href={`#/product/${p.id}`}><b>{p.name[lang]}</b></a><div className="muted">{fmt(p.price)} {t.cur}</div></div>
                <div className="qty"><button onClick={() => change(p.id, -1)} aria-label="−">−</button><span>{n}</span><button onClick={() => change(p.id, 1)} aria-label="+">+</button></div>
              </div>
            ))}
            <p className="total">{t.total}: <b>{fmt(total)} {t.cur}</b></p>
            {user ? (
              <form onSubmit={checkout} className="form">
                <p className="muted">{user.name}, +{user.phone}</p>
                <input value={f.addr} onChange={setField('addr')} placeholder={t.addr} required />
                <button className="btn">{t.order}</button>
              </form>
            ) : <p className="ok">{t.needLogin} <a className="link" href="#/profile">{t.login}</a></p>}
          </>
        )}
      </section>
    )
  } else if (route === '/profile') {
    page = user ? (
      <section className="wrap narrow">
        <div className="pcard">
          <div className="avatar">{user.name[0].toUpperCase()}</div>
          <div className="grow"><h1>{t.hello}, {user.name}!</h1><p className="muted">+{user.phone}, {t.since} {new Date(user.since).toLocaleDateString()}</p></div>
          <button className="btn ghost sm" onClick={() => setSession('')}>{t.logout}</button>
        </div>
        <div className="stats">
          <div><b>{mine.length}</b><span>{t.orders}</span></div>
          <div><b>{fmt(mine.reduce((s, o) => s + o.total, 0))}</b><span>{t.spent}, {t.cur}</span></div>
          <div><b>{favs.length}</b><span>{t.fav}</span></div>
        </div>
        <h2>{t.orders}</h2>
        {!mine.length ? <p className="muted">{t.noOrders}</p> : mine.map((o) => {
          const s = stage(o)
          return (
            <div className="order" key={o.id}>
              <div className="ohead"><b>{t.orderNo} #{o.id}</b><span className="muted">{date(o.ts)}</span><b>{fmt(o.total)} {t.cur}</b></div>
              <div className="track"><div className="fill" style={{ width: `${(s / 3) * 100}%` }} />{[0, 1, 2, 3].map((k) => <span key={k} className={'dot' + (k <= s ? ' on' : '')}><i>{t['st' + k]}</i></span>)}</div>
              <ul className="oitems">{o.items.map((it) => <li key={it.id}>{byId(it.id).name[lang]} × {it.n}</li>)}</ul>
              <p className="muted">{o.addr}</p>
            </div>
          )
        })}
      </section>
    ) : (
      <section className="wrap narrow">
        <h1>{mode === 'reg' ? t.register : t.login}</h1>
        <form onSubmit={auth} className="form">
          {mode === 'reg' && <input value={f.name} onChange={setField('name')} placeholder={t.name} autoComplete="name" />}
          <input value={f.phone} onChange={setField('phone')} placeholder={t.phone} type="tel" autoComplete="tel" />
          <input value={f.pass} onChange={setField('pass')} placeholder={t.pass} type="password" autoComplete="current-password" />
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn">{mode === 'reg' ? t.register : t.login}</button>
        </form>
        <button className="link plain" onClick={() => { setMode(mode === 'reg' ? 'login' : 'reg'); setErr('') }}>{mode === 'reg' ? t.haveAcc : t.noAcc}</button>
      </section>
    )
  } else if (route === '/about') {
    page = <section className="wrap narrow"><h1>{t.aboutT}</h1><p className="lead">{t.aboutP}</p>{feats}</section>
  } else {
    const hits = PRODUCTS.filter((_, i) => i % 6 === 0).slice(0, 8)
    page = (
      <>
        <section className="hero">
          <div className="blob b1" /><div className="blob b2" />
          <div className="wrap heroin">
            <div><h1 className="big">{t.heroT}</h1><p className="lead">{t.heroS}</p><a className="btn" href="#/catalog">{t.shop}</a></div>
            <div className="bottles" aria-hidden="true"><Art shape="dropper" hue={340} /><Art shape="lipstick" hue={335} /><Art shape="jar" hue={140} /></div>
          </div>
        </section>
        <div className="marquee" aria-hidden="true"><div>{[1, 2, 3, 4].flatMap(() => [t.f1, t.f2, t.f3]).map((x, i) => <span key={i}>{x}</span>)}</div></div>
        <section className="wrap">
          <h2 className="reveal">{t.cats}</h2>
          <div className="tiles">{catList.slice(1).map((c, i) => (
            <button key={c} className="tile reveal" style={{ '--h': [340, 40, 30, 335][i], transitionDelay: `${i * 80}ms` }} onClick={() => { setCat(c); location.hash = '/catalog' }}>
              <Art shape={['dropper', 'pump', 'jar', 'lipstick'][i]} hue={[340, 40, 30, 335][i]} /><b>{t[c]}</b>
            </button>
          ))}</div>
        </section>
        <section className="wrap"><h2 className="reveal">{t.best}</h2>{grid(hits)}</section>
        <section className="wrap">{feats}</section>
      </>
    )
  }

  const nav = [['/', t.home], ['/catalog', t.catalog], ['/about', t.about]]
  return (
    <>
      <header className="top">
        <div className="wrap bar">
          <a href="#/" className="logo">MaxaMaci</a>
          <nav>{nav.map(([h, l]) => <a key={h} href={'#' + h} className={route === h ? 'act' : ''}>{l}</a>)}</nav>
          <div className="ctl">
            <Select compact label="Language" value={lang} onChange={setLang} options={[{ value: 'ru', label: 'Русский' }, { value: 'uz', label: 'O‘zbek' }, { value: 'en', label: 'English' }]} />
            <button className="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Theme">{theme === 'dark' ? '☀️' : '🌙'}</button>
            <a href="#/favs" className="icon" aria-label={t.fav}>♥{favs.length > 0 && <i key={favs.length} className="badge">{favs.length}</i>}</a>
            <a href="#/cart" className="icon" aria-label={t.cart}>🛍️{count > 0 && <i key={bump} className="badge">{count}</i>}</a>
            <a href="#/profile" className={'icon' + (user ? ' me' : '')} aria-label={t.profile}>{user ? user.name[0].toUpperCase() : '👤'}</a>
          </div>
        </div>
      </header>
      <main key={route}>{page}</main>
      <footer className="foot"><div className="wrap">© 2026 MaxaMaci. {t.rights}</div></footer>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  )
}
