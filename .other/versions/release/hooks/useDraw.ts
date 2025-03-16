import { useEffect, useRef } from 'react'

export const useDraw = (drawToolBase: DrawToolBase) => {
    const offCanvasSize = [7680, 4320];
    const borderWidth = 3;

    const clipPathRef = useRef<Path2D | null>(null);
    const mouseDown = useRef<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const offCanvasRef = useRef<OffscreenCanvas | HTMLCanvasElement | null>(null);
    const canvasSnapshotRef = useRef<OffscreenCanvas | HTMLCanvasElement | null>(null);
    const canvasContainerRef = useRef<HTMLElement | null>(null);
    const mapRef = useRef<CanvasMap>({ dx: 0, dy: 0, scale: 1, wheelDX: null, wheelDY: null });
    const offCanvHistoryRef = useRef<DrawItem[]>([]);

    const drawItem: DrawItem = {
        ...drawToolBase,
        ctx: null,
        paths: [],
    };

    const clear = () => {
        if (offCanvasRef.current && canvasRef.current) {
            canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            offCanvasRef.current.getContext('2d')?.clearRect(0, 0, offCanvasRef.current.width, offCanvasRef.current.height);
            offCanvHistoryRef.current = [];
            repaintCanvas();
        }
    }

    const drawBorder = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (offCanvasRef.current && canvasRef.current && ctx) {
            const { dx, dy, scale } = mapRef.current;
            const scaledWidth = offCanvasRef.current.width / scale;
            const scaledHeight = offCanvasRef.current.height / scale;
            const scaledDX = -dx / scale;
            const scaledDY = -dy / scale;
            const borderOffset = borderWidth * 0.5;

            // Draw the gray background
            ctx.fillStyle = "#e6e6e6";
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // Clear the background underneath the offCanvas
            ctx.clearRect(scaledDX, scaledDY, scaledWidth, scaledHeight);

            // Draw the red borderline around offCanvas
            ctx.strokeStyle = "red";
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(scaledDX - borderOffset, scaledDY - borderOffset, scaledWidth + borderOffset, scaledHeight + borderOffset);
        }
    }

    const repaintCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const snapshotCtx = canvasSnapshotRef.current?.getContext('2d');
        if (canvas && offCanvasRef.current && ctx && snapshotCtx) {
            const { dx, dy, scale } = mapRef.current;
            const scaledWidth = canvas.clientWidth * scale;
            const scaledHeight = canvas.clientHeight * scale;

            if (clipPathRef.current) ctx.clip(clipPathRef.current);

            // We can draw border or nothing (clearRect)
            drawBorder();
            // ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientWidth);

            ctx.drawImage(offCanvasRef.current, dx, dy, scaledWidth, scaledHeight, 0, 0, canvas.clientWidth, canvas.clientHeight);
            snapshotCtx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
            snapshotCtx.drawImage(offCanvasRef.current, dx, dy, scaledWidth, scaledHeight, 0, 0, canvas.clientWidth, canvas.clientHeight);
        }
    }

    const resizeWindow = () => {
        const canvas = canvasRef.current;
        if (canvas && canvasContainerRef.current && canvasSnapshotRef.current) {
            const borderRadius = parseInt(canvasContainerRef.current.style.borderRadius || "0");
            const clipPath = new Path2D;

            canvas.width = canvasContainerRef.current.clientWidth;
            canvas.height = canvasContainerRef.current.clientHeight;

            clipPath.moveTo(borderRadius, 0);
            clipPath.lineTo(canvas.width - borderRadius, 0);
            clipPath.arc(canvas.width - borderRadius, borderRadius, borderRadius, Math.PI * 1.5, 0);
            clipPath.lineTo(canvas.width, canvas.height - borderRadius);
            clipPath.arc(canvas.width - borderRadius, canvas.height - borderRadius, borderRadius, 0, Math.PI * 0.5);
            clipPath.lineTo(borderRadius, canvas.height);
            clipPath.arc(borderRadius, canvas.height - borderRadius, borderRadius, Math.PI * 0.5, Math.PI);
            clipPath.lineTo(0, borderRadius);
            clipPath.arc(borderRadius, borderRadius, borderRadius, Math.PI, Math.PI * 1.5);
            clipPathRef.current = clipPath;

            canvasSnapshotRef.current.width = canvas.width;
            canvasSnapshotRef.current.height = canvas.height;
        }
    }

    const resetCanvas = () => {
        if (canvasRef.current && canvasContainerRef.current) {
            canvasRef.current.height = canvasContainerRef.current.clientHeight;
            canvasRef.current.width = canvasContainerRef.current.clientWidth;
            mapRef.current.dx = (offCanvasSize[0] - canvasRef.current.width * mapRef.current.scale) * 0.5;
            mapRef.current.dy = (offCanvasSize[1] - canvasRef.current.height * mapRef.current.scale) * 0.5;
            repaintCanvas();
        }
    }

    useEffect(() => {
        canvasContainerRef.current = document.getElementById("canvas-container");
        const canvasWidth = canvasContainerRef.current?.clientWidth || window.innerWidth * 0.75 || 500;
        const canvasHeight = canvasContainerRef.current?.clientHeight || window.innerHeight * 0.85 || 500;

        if (typeof OffscreenCanvas !== 'undefined') {
            canvasSnapshotRef.current = new OffscreenCanvas(canvasWidth, canvasHeight);
            offCanvasRef.current = new OffscreenCanvas(offCanvasSize[0], offCanvasSize[1]);
        } else {
            canvasSnapshotRef.current = document.createElement('canvas');
            offCanvasRef.current = document.createElement('canvas');
            canvasSnapshotRef.current.width = canvasWidth;
            canvasSnapshotRef.current.height = canvasHeight;
            offCanvasRef.current.width = offCanvasSize[0];
            offCanvasRef.current.height = offCanvasSize[1];
        }
        
        resizeWindow();
        resetCanvas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // This needs to be executed once

    const undoLastStroke = () => {
        const history = offCanvHistoryRef.current;
        history.pop();
        offCanvasRef.current?.getContext('2d')?.clearRect(0, 0, offCanvasSize[0], offCanvasSize[1]);
        for (let i = 0; i < history.length; i++) {
            commitDrawItem(history[i]);
        };
        repaintCanvas();
    }

    function commitDrawItem({ ctx, toolType, toolColor, toolSize, toolGCO, paths }: DrawItem) {
        if (!ctx) return;

        const startX = paths[0].px || paths[0].x;
        const startY = paths[0].py || paths[0].y;
        ctx.beginPath();
        if (toolType === -1) {
            toolColor = '#ffffffff'
            ctx.globalCompositeOperation = "destination-out";
        } else {
            ctx.globalCompositeOperation = toolGCO;
        }
        ctx.lineWidth = toolSize;
        ctx.strokeStyle = toolColor;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.arc(startX, startY, 0.001, 0, Math.PI * 2);
        ctx.moveTo(startX, startY);
        for (let i = 0; i < paths.length; i++) {
            ctx.lineTo(paths[i].x, paths[i].y);
        }
        ctx.stroke();
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const offCanvas = offCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const offCtx = offCanvas?.getContext('2d') as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
        const remap = mapRef.current;
        const toolPath: Path = {
            x: 0,
            y: 0,
            px: null,
            py: null
        };

        function visualizePointer({ ctx, toolType, toolColor, toolSize, toolGCO, x, y }: PointerVisuals) {
            if (!ctx || !canvasSnapshotRef.current || !canvas) return;

            drawBorder();
            ctx.drawImage(canvasSnapshotRef.current, 0, 0);

            ctx.save();
            ctx.beginPath();
            if (toolType === -1) {
                toolColor = '#ffffffff';
                ctx.globalCompositeOperation = "source-over";
            } else {
                ctx.globalCompositeOperation = toolGCO;
            }
            ctx.fillStyle = toolColor;
            ctx.arc(x, y, toolSize / (remap.scale * 2), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function visualizeDrawItem({ ctx, toolType, toolColor, toolSize, toolGCO, paths }: DrawItem) {
            if (!ctx || !canvasSnapshotRef.current || !canvas) return;

            drawBorder();
            ctx.drawImage(canvasSnapshotRef.current, 0, 0);

            const startX = ((paths[0].px || paths[0].x) - remap.dx) / remap.scale;
            const startY = ((paths[0].py || paths[0].y) - remap.dy) / remap.scale;

            ctx.save();
            ctx.beginPath();
            if (toolType === -1) {
                toolColor = '#ffffffff'
                ctx.globalCompositeOperation = "source-over";
            } else {
                ctx.globalCompositeOperation = toolGCO;
            }
            ctx.lineWidth = toolSize / remap.scale;
            ctx.strokeStyle = toolColor;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.arc(startX, startY, 0.001, 0, Math.PI * 2);
            ctx.moveTo(startX, startY);

            for (let i = 0; i < paths.length; i++) {
                ctx.lineTo((paths[i].x - remap.dx) / remap.scale, (paths[i].y - remap.dy) / remap.scale);
            }
            ctx.stroke();
            ctx.restore();
        }

        const computePointInCanvas = (e: MouseEvent): Point | null => {
            if (!canvas) return null;
            const rect = canvas.getBoundingClientRect();
            const x = remap.dx + (e.clientX - rect.left) * remap.scale;
            const y = remap.dy + (e.clientY - rect.top) * remap.scale;
            return { x, y };
        }
        const computePointInWindow = (e: MouseEvent): Point => {
            if (!canvas) return { x: -Infinity, y: -Infinity };
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            return { x, y };
        }

        const handlePointer = (e: MouseEvent) => {
            if (!ctx) return;
            if (mouseDown.current) { //this guards against drawing when mouse pressed outside and dragged in 
                if (e.buttons & 4) { //case when mouse wheel down to drag the drawing 
                    remap.dx -= remap.scale * (e.clientX - (remap.wheelDX ?? e.clientX));
                    remap.dy -= remap.scale * (e.clientY - (remap.wheelDY ?? e.clientY));
                    repaintCanvas();
                    remap.wheelDX = e.clientX;
                    remap.wheelDY = e.clientY;
                } else if (e.buttons & 1) { //else we just draw the line
                    const currentPoint = computePointInCanvas(e);
                    if (!currentPoint) return;
                    toolPath.x = currentPoint.x;
                    toolPath.y = currentPoint.y;

                    drawItem.ctx = ctx;
                    drawItem.paths.push({ ...toolPath });

                    visualizeDrawItem(drawItem);

                    toolPath.px = toolPath.x;
                    toolPath.py = toolPath.y;
                }
            } else { // case when mouse buttons are not pressed, visualizing pointer
                const point = computePointInWindow(e);
                visualizePointer({ ctx: ctx, ...drawToolBase, x: point.x, y: point.y });
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

        const handleMouseDown = (e: MouseEvent) => {
            if (mouseDown.current || !offCanvas || !canvas) return;
            mouseDown.current = true;
            // console.log('down');
            const point = computePointInCanvas(e);
            toolPath.px = point?.x ?? null;
            toolPath.py = point?.y ?? null;
        }

        const handleMouseUp = (e: MouseEvent) => {
            if (!mouseDown.current || !offCtx) return;
            mouseDown.current = false;
            remap.wheelDX = null;
            remap.wheelDY = null;

            drawItem.ctx = offCtx;
            if (drawItem.paths[0]) {
                commitDrawItem(drawItem);
                offCanvHistoryRef.current.push({ ...drawItem });
            }
            // console.log("up", drawItem.paths.length, offCanvHistoryRef.current.length);
            drawItem.paths = [];
            toolPath.px = null;
            toolPath.py = null;
            repaintCanvas();
        }

        const handleUndo = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "z") {
                undoLastStroke();
            }
        }

        if (!canvas) return;
        canvas.addEventListener('mousemove', handlePointer);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousedown', handlePointer);
        canvas.addEventListener('wheel', handleWheel);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('resize', () => { resizeWindow(), repaintCanvas() });
        document.addEventListener("keydown", handleUndo);

        return () => {
            canvas.removeEventListener('mousemove', handlePointer);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousedown', handlePointer);
            canvas.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', () => { resizeWindow(), repaintCanvas() });
            document.removeEventListener("keydown", handleUndo);
        };


    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawItem, drawToolBase]);

    return { canvasRef, offCanvasRef, remap: mapRef.current, clear, resetCanvas, repaintCanvas, undoLastStroke };
}