import { Roboto } from 'next/font/google'

export const roboto = Roboto({
  weight: '300', //['300', '700'],
  style: 'normal',
  fallback: ['Arial'],
  display: 'swap',
  // variable: '--font-roboto',
  subsets: ["latin"] //['cyrillic-ext', 'latin-ext']
})
