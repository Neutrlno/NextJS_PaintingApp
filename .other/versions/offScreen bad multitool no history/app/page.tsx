'use client'

import { FC, useState } from 'react'
import { useDraw } from '../hooks/useDraw'
import { HexAlphaColorPicker } from "react-colorful";

const Page: FC<pageProps> = ({ }) => {
    const [drawToolConfig, setDrawToolConfig] = useState<DrawToolConfig>({
        toolType: 1,
        toolColor: "#FF000020",
        toolSize: 100
    });
    const { canvasRef, remap, clear, initializeCanvas, repaintCanvas } = useDraw(drawToolConfig);
    const [canvasScale, setCanvasScale] = useState<Number>(remap.scale);
    // console.log("page component")
    const handleScaleChange = (value: string) => {
        const scale = parseFloat(value);
        if (value === '1') {
            remap.scale = scale;
            initializeCanvas();
        } else {
            const canvas = canvasRef.current;
            if (canvas) {
                const x = canvas.width * 0.5;
                const y = canvas.height * 0.5
                const prevX = remap.dx + x * remap.scale;
                const prevY = remap.dy + y * remap.scale;
                remap.scale = scale;
                remap.dx = prevX - x * remap.scale;
                remap.dy = prevY - y * remap.scale;
                repaintCanvas();
            }
        }
        setCanvasScale(scale);
    }

    const handleToolChange = (propKey: DrawToolProp, nextPropValue: number | string) => {
        setDrawToolConfig({
            ...drawToolConfig,
            [propKey]: nextPropValue 
        });
    };

    return (
        <div className='flex justify-center items-center w-screen h-screen bg-white p-3 m-0'>
            <div
                className='flex flex-col gap-5 min-w-fit pr-5'
            >
                <div className='flex flex-col gap-1'>
                    <label className='flex p-1 gap-1 border border-black rounded-md'>
                        <input
                            type='radio'
                            value='pen'
                            checked={drawToolConfig.toolType === 1}
                            onChange={() => handleToolChange('toolType', 1)}
                        />
                        Pen
                    </label>
                    <label className='flex p-1 gap-1 border border-black rounded-md'>
                        <input
                            type='radio'
                            value='eraser'
                            checked={drawToolConfig.toolType === 0}
                            onChange={() => handleToolChange('toolType', 0)}
                        />
                        Eraser
                    </label>
                </div>
                <label className='flex flex-col items-center gap-1'>
                    Pen Color
                    <HexAlphaColorPicker
                        color={drawToolConfig.toolColor}
                        onChange={(color) => handleToolChange('toolColor', color)}
                        style={{
                            width: '100%',
                            height: '15vh',
                            maxHeight: '150px',
                            minHeight: '100px',
                        }}
                    />
                </label>
                <div className='flex flex-col items-center gap-1'>
                    <label>
                        Pen Size: {drawToolConfig.toolSize}
                    </label>
                    <input
                        type="number"
                        min='1'
                        max='1000'
                        step='1'
                        placeholder=' pen size'
                        className='w-full border border-black rounded-md'
                        onChange={(e) => handleToolChange('toolSize', parseInt(e.target.value) || 1)}
                    />
                    <input
                        type='range'
                        min='1'
                        max='50'
                        step='1'
                        value={drawToolConfig.toolSize}
                        onChange={(e) => handleToolChange('toolSize', parseInt(e.target.value))}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <label>
                        Canvas Scale: {`${canvasScale}` || "1"}
                    </label>
                    <input
                        type='range'
                        min='0.1'
                        max='10'
                        step='0.1'
                        value={`${canvasScale}`}
                        onChange={(e) => handleScaleChange(e.target.value)}
                    />
                    <button
                        type='button'
                        className='p-2 border border-black rounded-md'
                        onClick={() => handleScaleChange('1')}
                    >
                        Default View
                    </button>
                    <button
                        type='button'
                        className='p-2 border border-black rounded-md'
                        onClick={clear}
                    >
                        Clear canvas
                    </button>
                </div>
            </div>
            <div
                id={"canvas-container"}
                className='w-full h-full border border-black'
                style={{ borderRadius: "10px" }} //this way is necessary to compensate this radius inside the canvas
            >
                <canvas
                    ref={canvasRef}
                    className='w-full h-full'
                    onWheel={() => setCanvasScale(parseFloat((remap.scale).toFixed(2)))}
                />
            </div>
        </div>
    )
}

export default Page