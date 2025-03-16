import { Inter } from 'next/font/google'

export const myFont = Inter({
  weight: '400', //['300', '700'],
  style: 'normal',
  fallback: ['Arial'],
  display: 'swap',
  // variable: '--font-roboto',
  subsets: ["latin"] //['cyrillic-ext', 'latin-ext']
})
