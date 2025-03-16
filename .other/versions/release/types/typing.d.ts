type DrawToolProp = 'toolType' | 'toolColor' | 'toolSize' | 'toolGCO';

interface PageProps {}

interface GCOdropDownProps {
  value: string;
  onChange: function;
}

interface DownloadButtonProps {
  tag: string;
  reference: RefObject<HTMLCanvasElement, OffscreenCanvas>;
}

interface RadioButtonLabelProps {
  tag: string;
  onChange: function;
  checked: boolean
}

type Point = {
  x: number;
  y: number;
};

type Path = Point & {
  px: number | null;
  py: number | null;
};

type CanvasMap = {
  dx: number;
  dy: number;
  scale: number;
  wheelDX: number | null;
  wheelDY: number | null;
};

interface DrawToolBase {
  toolType: number;
  toolColor: string;
  toolSize: number;
  toolGCO: GlobalCompositeOperation;
}

type DrawItem = DrawToolBase & {
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
  paths: Path[];
};

type PointerVisuals = DrawToolBase & {
  ctx: CanvasRenderingContext2D | null;
  x: number;
  y: number;
};
