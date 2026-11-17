const TYPES = [
  { c: 'face', s: 'dropper', p: 150, n: { ru: 'Сыворотка', uz: 'Zardob', en: 'Serum' } },
  { c: 'face', s: 'tube', p: 90, n: { ru: 'Гель для умывания', uz: 'Yuvish geli', en: 'Cleanser' } },
  { c: 'face', s: 'jar', p: 180, n: { ru: 'Крем для лица', uz: 'Yuz kremi', en: 'Face cream' } },
  { c: 'face', s: 'pump', p: 110, n: { ru: 'Тоник', uz: 'Toner', en: 'Toner' } },
  { c: 'face', s: 'jar', p: 95, n: { ru: 'Маска для лица', uz: 'Yuz niqobi', en: 'Face mask' } },
  { c: 'body', s: 'jar', p: 120, n: { ru: 'Скраб для тела', uz: 'Tana skrabi', en: 'Body scrub' } },
  { c: 'body', s: 'pump', p: 130, n: { ru: 'Лосьон для тела', uz: 'Tana losyoni', en: 'Body lotion' } },
  { c: 'body', s: 'dropper', p: 140, n: { ru: 'Масло для тела', uz: 'Tana yog‘i', en: 'Body oil' } },
  { c: 'body', s: 'tube', p: 70, n: { ru: 'Гель для душа', uz: 'Dush geli', en: 'Shower gel' } },
  { c: 'hair', s: 'pump', p: 85, n: { ru: 'Шампунь', uz: 'Shampun', en: 'Shampoo' } },
  { c: 'hair', s: 'jar', p: 150, n: { ru: 'Маска для волос', uz: 'Soch niqobi', en: 'Hair mask' } },
  { c: 'hair', s: 'dropper', p: 125, n: { ru: 'Масло для волос', uz: 'Soch yog‘i', en: 'Hair oil' } },
  { c: 'lips', s: 'lipstick', p: 98, n: { ru: 'Помада', uz: 'Lab bo‘yog‘i', en: 'Lipstick' } },
  { c: 'lips', s: 'tube', p: 55, n: { ru: 'Бальзам для губ', uz: 'Lab balzami', en: 'Lip balm' } },
  { c: 'lips', s: 'gloss', p: 75, n: { ru: 'Блеск для губ', uz: 'Lab bo‘yog‘i (blesk)', en: 'Lip gloss' } },
]
const V = {
  face: [{ h: 340, ru: 'Роза', uz: 'Atirgul', en: 'Rose' }, { h: 140, ru: 'Зелёный чай', uz: 'Yashil choy', en: 'Green tea' }, { h: 95, ru: 'Алоэ', uz: 'Aloe', en: 'Aloe' }],
  body: [{ h: 40, ru: 'Ваниль', uz: 'Vanil', en: 'Vanilla' }, { h: 25, ru: 'Кокос', uz: 'Kokos', en: 'Coconut' }, { h: 270, ru: 'Лаванда', uz: 'Lavanda', en: 'Lavender' }],
  hair: [{ h: 30, ru: 'Аргана', uz: 'Argan', en: 'Argan' }, { h: 200, ru: 'Кератин', uz: 'Keratin', en: 'Keratin' }, { h: 48, ru: 'Мёд', uz: 'Asal', en: 'Honey' }],
  lips: [{ h: 20, ru: 'Нюд', uz: 'Nyud', en: 'Nude' }, { h: 335, ru: 'Ягода', uz: 'Rezavor', en: 'Berry' }, { h: 8, ru: 'Коралл', uz: 'Marjon', en: 'Coral' }],
}

export const PRODUCTS = TYPES.flatMap((t, ti) =>
  V[t.c].map((v, vi) => ({
    id: ti * 3 + vi + 1,
    cat: t.c,
    shape: t.s,
    hue: v.h,
    price: Math.round((t.p * (1 + vi * 0.07)) / 1) * 1000,
    name: { ru: `${t.n.ru} «${v.ru}»`, uz: `${t.n.uz} «${v.uz}»`, en: `${t.n.en} “${v.en}”` },
  })),
)
