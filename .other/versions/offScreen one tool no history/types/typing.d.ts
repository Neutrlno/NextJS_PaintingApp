interface pageProps { }

type DrawItem = {
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null
  toolType: number
  toolColor: string
  toolSize: number
  currX: number
  currY: number
  prevX: number | undefined
  prevY: number| undefined
}

type DrawToolConfig = {
  toolType: number,
  toolColor: string,
  toolSize: number
}

type DrawToolProp = 'toolType' | 'toolColor' | 'toolSize';

type Point = {
  x: number
  y: number
}

type CanvasMap = {
  dx: number
  dy: number
  scale: number
  wheelDX: number | null
  wheelDY: number | null
}