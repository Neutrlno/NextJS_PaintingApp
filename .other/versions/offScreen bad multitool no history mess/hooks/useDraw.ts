import { useCallback, useEffect, useRef, useState } from 'react'

export const useDraw = (drawToolConfig: DrawToolConfig) => {
    const offCanvasSize = 8000;
    const borderWidth = 3;

    const mouseDown = useRef<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const offCanvasRef = useRef<OffscreenCanvas>(new OffscreenCanvas(offCanvasSize, offCanvasSize));
    const canvasContainerRef = useRef<HTMLElement | null>(null);
    const prevPointRef = useRef<Point | null>(null);
    const mapRef = useRef<CanvasMap>({ dx: 0, dy: 0, scale: 1, wheelDX: null, wheelDY: null });
    const offCanvHistoryRef = useRef<DrawItem[]>([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const drawItem: DrawItem = {
        ...drawToolConfig,
        ctx: canvasRef.current?.getContext('2d'),
        currX: 0,
        currY: 0,
        prevX: prevPointRef.current?.x,
        prevY: prevPointRef.current?.y
    }

    const clear = () => {
        if (offCanvasRef.current && canvasRef.current) {
            canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            offCanvasRef.current.getContext('2d')?.clearRect(0, 0, offCanvasRef.current.width, offCanvasRef.current.height);
            drawBorder();
        }
    }

    const drawBorder = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (offCanvasRef.current && canvas && ctx) {
            const { dx, dy, scale } = mapRef.current;
            const scaledWidth = offCanvasRef.current.width / scale;
            const scaledHeight = offCanvasRef.current.height / scale;
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

            // Clear the background underneath the offCanvas
            ctx.clearRect(scaledDX, scaledDY, scaledWidth, scaledHeight);

            // Draw the red borderline around offCanvas
            ctx.strokeStyle = "red";
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(scaledDX - borderOffset, scaledDY - borderOffset, scaledWidth + borderOffset, scaledHeight + borderOffset);
        }
    }

    const repaintCanvas = () => {
        if (offCanvasRef.current && canvasRef.current && canvasContainerRef.current) {
            const { clientWidth, clientHeight } = canvasContainerRef.current;
            const { dx, dy, scale } = mapRef.current;
            const ctx = canvasRef.current.getContext('2d');

            if (!ctx) return;
            canvasRef.current.width = clientWidth;
            canvasRef.current.height = clientHeight;
            // We can draw border or nothing (clearRect)
            drawBorder();
            if (mapRef.current.scale < 0.5) ctx.imageSmoothingEnabled = false;
            //ctx.clearRect(0, 0, clientWidth, clientWidth);
            ctx.drawImage(offCanvasRef.current, dx, dy, clientWidth * scale, clientHeight * scale, 0, 0, clientWidth, clientHeight);
        }
    }


    const initializeCanvas = () => {
        canvasContainerRef.current = document.getElementById("canvas-container");
        if (canvasRef.current && canvasContainerRef.current) {
            canvasRef.current.height = canvasContainerRef.current.clientHeight;
            canvasRef.current.width = canvasContainerRef.current.clientWidth;
            mapRef.current.dx = (offCanvasSize - canvasRef.current.width * mapRef.current.scale) * 0.5;
            mapRef.current.dy = (offCanvasSize - canvasRef.current.height * mapRef.current.scale) * 0.5;
            repaintCanvas();
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(initializeCanvas, []); // This needs to be executed once

    useEffect(() => {
        const canvas = canvasRef.current;
        const offCanvas = offCanvasRef.current;
        const offCtx = offCanvas?.getContext('2d')
        const remap = mapRef.current;
        drawItem.ctx = canvas?.getContext('2d');
        function drawAction({ ctx, toolType, toolColor, toolSize, currX, currY, prevX, prevY }: DrawItem) {
            if (!ctx) return;
            const startX = prevX ?? currX;
            const startY = prevY ?? currY;
            
            console.log('draw')
            ctx.moveTo(startX, startY);
            ctx.lineTo(currX, currY);


            // ctx.beginPath();
            // ctx.fillStyle = toolColor;
            // ctx.arc(startX, startY, toolSize/2, 0, 2 * Math.PI);
            // ctx.fill();
            // console.log(startX, startY, prevX, prevY)

            // Code for drawing with squares with interpolation
            // let startPoint = {x: prevX, y: prevY} || {x: currX, y: currY};
            // const halfToolSize = toolSize / 2;

            // const distance = Math.sqrt((currX - startPoint.x) ** 2 + (currY - startPoint.y) ** 2);
            // const steps = Math.max(1, Math.floor(distance / halfToolSize));

            // for (let i = 0; i <= steps; i++) {
            //     const t = i / steps;
            //     const x = startPoint.x + t * (currX - startPoint.x);
            //     const y = startPoint.y + t * (currY - startPoint.y);

            //     ctx.fillStyle = toolColor;
            //     ctx.fillRect(x - halfToolSize, y - halfToolSize, toolSize, toolSize);
            // }
            // return;
        }

        const computePointInCanvas = (e: MouseEvent) => {
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = remap.dx + (e.clientX - rect.left) * remap.scale;
            const y = remap.dy + (e.clientY - rect.top) * remap.scale;

            return { x, y };
        }

        const handlePointer = (e: MouseEvent) => {
            // if (!mouseDown) return;
            const currentPoint = computePointInCanvas(e);
            if (!currentPoint || !offCtx) return;

            if (e.buttons & 4) { //case when mouse wheel down to drag the drawing 
                remap.dx -= remap.scale * (e.clientX - (remap.wheelDX ?? e.clientX));
                remap.dy -= remap.scale * (e.clientY - (remap.wheelDY ?? e.clientY));
                repaintCanvas();
                remap.wheelDX = e.clientX;
                remap.wheelDY = e.clientY;
            } else if (e.buttons & 1) { //else we just draw the line

                // drawItem.currX = currentPoint.x;
                // drawItem.currY = currentPoint.y;
                drawItem.currX = e.offsetX;
                drawItem.currY = e.offsetY;

                offCanvHistoryRef.current.push({ ...drawItem });
                console.log(drawItem.ctx);
                drawAction(drawItem);

                // console.log(offCanvHistoryRef.current.length, offCanvHistoryRef.current[offCanvHistoryRef.current.length-1]);
                // repaintCanvas();

                // prevPointRef.current = currentPoint;
                // drawItem.prevX = prevPointRef.current?.x;
                // drawItem.prevY = prevPointRef.current?.y;
                prevPointRef.current = {x: drawItem.currX, y: drawItem.currY};
                drawItem.prevX = prevPointRef.current?.x;
                drawItem.prevY = prevPointRef.current?.y;
            }
        }

        const handleWheel = (e: WheelEvent) => {
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

        const handleMouseDown = () => {
            if (mouseDown.current) return;
            mouseDown.current = true;
    
            
            const ctx = canvasRef.current?.getContext('2d');
            if (!ctx) return;
            // console.log(ctx);
            ctx.beginPath();
            ctx.lineWidth = drawToolConfig.toolSize;
            ctx.strokeStyle = drawToolConfig.toolType === 1 ? drawToolConfig.toolColor : '#fff';
            ctx.lineJoin = "miter";
            ctx.lineCap = 'round';
        }

        const handleMouseUp = (e: { buttons: number; }) => {
            if (!mouseDown.current || !offCtx) return;

            canvasRef.current?.getContext('2d')?.stroke();
            // repaintCanvas();
            // console.log("up")


            mouseDown.current = false;
            prevPointRef.current = null;
            remap.wheelDX = null;
            remap.wheelDY = null;
        }

        if (!canvas) return;
        canvas.addEventListener('mousemove', handlePointer);
        canvas.addEventListener('mousedown', handlePointer);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('wheel', handleWheel);
        canvas.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('resize', repaintCanvas);

        return () => {
            canvas.removeEventListener('mousemove', handlePointer);
            canvas.removeEventListener('mousedown', handlePointer);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', repaintCanvas);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawItem]);

    return { canvasRef, remap: mapRef.current, clear, initializeCanvas, repaintCanvas };
}