'use client'

import { FC, useState } from 'react'
import { useDraw } from '../hooks/useDraw'

const Page: FC<pageProps> = ({ }) => {
    const { canvasRef, handleMouseDown, clear, mapRef, repaintCanvas } = useDraw(drawLine);
    const [canvasScale, setCanvasScale] = useState(mapRef.current.scale);

    function drawLine({ prevPoint, currentPoint, ctx }: Draw) {
        const { x: currX, y: currY } = currentPoint;
        const lineColor = '#000';
        const lineWidth = 3;

        let startPoint = prevPoint ?? currentPoint;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = lineColor;
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currX, currY);
        ctx.stroke();

        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, 1, 0, 2 * Math.PI);
        ctx.fill();
    }

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const scale = parseFloat(e.target.value);
        setCanvasScale(scale);
        mapRef.current.scale = scale;
        repaintCanvas();
    };

    return (
        <div className='w-screen h-screen bg-white p-3 flex justify-center items-center m-0'>
            <div
                className='flex flex-col flex-shrink-0 gap-5 pr-5'
                style={{ width: '14%' }}
            >
                <button
                    type='button'
                    className='p-2 rounded-md border border-black'
                    onClick={clear}
                >
                    Clear canvas
                </button>
                <div className='flex flex-col'>
                    <label>
                        Canvas Scale: {canvasScale || 1}
                    </label>
                    {/* <input
                        className='p-2 rounded-md border border-black'
                        type='text'
                        value={canvasScale}
                        onChange={handleValue}
                        placeholder='Canvas scale'
                    /> */}
                    <input
                        type='range'
                        min='0.1'
                        max='10'
                        step='0.25'
                        value={canvasScale}
                        onChange={handleSliderChange}
                    />
                </div>
            </div>
            <div
                id={"canvas-container"}
                className='w-full h-full border border-green-500'
                style={{ borderRadius: "10px" }}
            >
                <canvas
                    ref={canvasRef}
                    className='w-full h-full'
                    onMouseDownCapture={handleMouseDown}
                    onWheel={() => setCanvasScale(parseFloat((mapRef.current.scale).toFixed(2)))}
                />
            </div>
        </div>
    )
}

export default Page