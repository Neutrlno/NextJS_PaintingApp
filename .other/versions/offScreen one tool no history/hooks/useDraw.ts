import { useCallback, useEffect, useRef, useState } from 'react'

export const useDraw = (drawLine: ({ ctx, currentPoint, prevPoint }: Draw) => void) => {
    const offCanvasSize = 5000;
    const borderWidth = 3;
    const [mouseDown, setMouseDown] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLElement | null>(null);
    const offCanvasRef = useRef<OffscreenCanvas>((typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(offCanvasSize, offCanvasSize) : null);
    const prevPointRef = useRef<Point | null>(null);
    const mapRef = useRef<CanvasMap>({ dx: 0, dy: 0, scale: 1, wheelDX: null, wheelDY: null });

    const handleMouseDown = () => setMouseDown(true);

    const clear = () => {
        const canvas = canvasRef.current;
        const offCanvas = offCanvasRef.current;
        if (canvas && offCanvas) {
            canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
            offCanvas.getContext('2d')?.clearRect(0, 0, offCanvas.width, offCanvas.height);
            drawBorder();
        }
    }

    const drawBorder = () => {
        const canvas = canvasRef.current;
        const offCanvas = offCanvasRef.current;
        if (canvas && offCanvas) {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const { dx, dy, scale } = mapRef.current;
            const scaledWidth = offCanvas.width / scale;
            const scaledHeight = offCanvas.height / scale;
            const scaledDX = -dx / scale;
            const scaledDY = -dy / scale;
            const borderOffset = borderWidth * 0.5;
            const borderRadius = parseInt(canvasContainerRef.current?.style.borderRadius || "0");

            // Clip the rounded corners
            ctx.beginPath();
            ctx.moveTo(borderRadius, 0);
            ctx.lineTo(canvas.width - borderRadius, 0);
            ctx.arc(canvas.width - borderRadius, borderRadius, borderRadius, Math.PI * 1.5, 0);
            ctx.lineTo(canvas.width, canvas.height - borderRadius);
            ctx.arc(canvas.width - borderRadius, canvas.height - borderRadius, borderRadius, 0, Math.PI * 0.5);
            ctx.lineTo(borderRadius, canvas.height);
            ctx.arc(borderRadius, canvas.height - borderRadius, borderRadius, Math.PI * 0.5, Math.PI);
            ctx.lineTo(0, borderRadius);
            ctx.arc(borderRadius, borderRadius, borderRadius, Math.PI, Math.PI * 1.5);
            ctx.clip();

            // Draw the gray background
            ctx.fillStyle = "rgb(230, 230, 230)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Clear the background for the offCanvas
            ctx.clearRect(scaledDX, scaledDY, scaledWidth, scaledHeight);

            // Draw the red borderline around offCanvas
            ctx.strokeStyle = "red";
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(scaledDX - borderOffset, scaledDY - borderOffset, scaledWidth + borderOffset, scaledHeight + borderOffset);
        }
    }

    const repaintCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const offCanvas = offCanvasRef.current;
        const remap = mapRef.current;
        const container = canvasContainerRef.current;

        if (canvas && offCanvas && container) {
            const { clientWidth, clientHeight } = container;
            const { dx, dy, scale } = remap;
            canvas.width = clientWidth;
            canvas.height = clientHeight;
            // We can draw border or nothing (clearRect)
            //canvas.getContext('2d')?.clearRect(0, 0, clientWidth, clientWidth);
            drawBorder();
            canvas.getContext('2d')?.drawImage(offCanvas, dx, dy, clientWidth * scale, clientHeight * scale, 0, 0, clientWidth, clientHeight); 
        }
    }, []);

    const initializeCanvas = () => {
        canvasContainerRef.current = document.getElementById("canvas-container");
        if (canvasRef.current && canvasContainerRef.current) {
            canvasRef.current.height = canvasContainerRef.current.clientHeight;
            canvasRef.current.width = canvasContainerRef.current.clientWidth;
            mapRef.current.dx = (offCanvasSize - canvasRef.current.width * mapRef.current.scale) * 0.5;
            mapRef.current.dy = (offCanvasSize - canvasRef.current.height  * mapRef.current.scale) * 0.5;
            repaintCanvas();
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(initializeCanvas, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const offCanvas = offCanvasRef.current;
        const remap = mapRef.current;
        
        const computePointInCanvas = (e: MouseEvent) => {
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = remap.dx + (e.clientX - rect.left) * remap.scale;
            const y = remap.dy + (e.clientY - rect.top) * remap.scale;

            return { x, y };
        }

        const handler = (e: MouseEvent) => {
            // console.log(remap.scale)
            if (!mouseDown) return;
            const currentPoint = computePointInCanvas(e);
            const ctx = offCanvas?.getContext('2d');
            if (!currentPoint || !ctx) return;

            if (e.buttons & 4) { //case when mouse wheel down to drag the drawing 
                remap.dx -= remap.scale * (e.clientX - (remap.wheelDX ?? e.clientX));
                remap.dy -= remap.scale * (e.clientY - (remap.wheelDY ?? e.clientY));
                repaintCanvas();
                remap.wheelDX = e.clientX;
                remap.wheelDY = e.clientY;
            } else if (e.buttons & 1) { //else we just draw the line
                drawLine({ ctx, currentPoint, prevPoint: prevPointRef.current });
                repaintCanvas();
                prevPointRef.current = currentPoint;
            }
        }

        const wheelHandler = (e: WheelEvent) => {
            if (e.ctrlKey || !canvasRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();

            const minScale = 0.1;
            const maxScale = 10;
            const k = 0.35;

            const mousePrev = computePointInCanvas(e);     

            // Calculate the next scale
            let nextScale = remap.scale * (e.deltaY > 0 ? 1 + k : 1 / (1 + k));
            
            // Apply the next scale within the min and max limits
            remap.scale = Math.min(Math.max(minScale, nextScale), maxScale);

            if (mousePrev) {
                remap.dx = mousePrev.x - (e.clientX - rect.left) * remap.scale;
                remap.dy = mousePrev.y - (e.clientY - rect.top) * remap.scale;
            }

            repaintCanvas();
        }

        const mouseUpHandler = () => {
            setMouseDown(false);
            prevPointRef.current = null;
            remap.wheelDX = null;
            remap.wheelDY = null;
        }

        canvas?.addEventListener('mousemove', handler);
        canvas?.addEventListener('mousedown', handler);
        canvas?.addEventListener('wheel', wheelHandler);
        window.addEventListener('mouseup', mouseUpHandler);
        window.addEventListener('resize', repaintCanvas);

        return () => {
            canvas?.removeEventListener('mousemove', handler);
            canvas?.removeEventListener('mousedown', handler);
            canvas?.removeEventListener('wheel', wheelHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
            window.removeEventListener('resize', repaintCanvas);
        };
    }, [drawLine, mouseDown, repaintCanvas]);

    return { canvasRef, handleMouseDown, clear, mapRef, repaintCanvas };
}