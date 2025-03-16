'use client'

import { FC, useState } from 'react'
import { useDraw } from '../hooks/useDraw'
import { HexAlphaColorPicker } from "react-colorful";
import GCOdropDown, { DownloadButton, RadioButtonLabel } from "./custom-components"
import { myFont } from './fonts' //dont use because NextJS fonts are disgustingly rendered

const Page: FC<PageProps> = ({ }) => {
    const [drawToolBase, setDrawToolBase] = useState<DrawToolBase>({
        toolType: 1,
        toolColor: "#000000ff",
        toolSize: 10,
        toolGCO: 'source-over'
    });
    const { canvasRef, offCanvasRef, remap, clear, resetCanvas, repaintCanvas, undoLastStroke } = useDraw(drawToolBase);
    const [canvasScale, setCanvasScale] = useState<Number>(remap.scale);
    // console.log("Page component");

    const handleScaleChange = (value: string) => {
        const scale = parseFloat(value);
        if (value === '1') {
            remap.scale = scale;
            resetCanvas();
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
        setDrawToolBase({
            ...drawToolBase,
            [propKey]: nextPropValue || drawToolBase[propKey]
        });
    };

    return (
        <div className={`flex justify-center items-center w-screen h-screen bg-white p-3 m-0`}>
            <div className='flex flex-col gap-3 min-w-fit pr-5'>
                <button
                    type='button'
                    className='p-2 border border-black rounded-md'
                    onClick={undoLastStroke}
                >
                    Undo (Ctrl + Z)
                </button>
                <div className='flex gap-1'>
                    <RadioButtonLabel
                        tag='Pen'
                        checked={drawToolBase.toolType === 1}
                        onChange={() => handleToolChange('toolType', 1)}
                    />
                    <RadioButtonLabel
                        tag='Eraser'
                        checked={drawToolBase.toolType === -1}
                        onChange={() => handleToolChange('toolType', -1)}
                    />
                </div>
                <GCOdropDown
                    value={drawToolBase.toolGCO}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { handleToolChange("toolGCO", e.target.value) }}
                />
                <label className='flex flex-col items-center gap-1'>
                    Pen Color
                    <HexAlphaColorPicker
                        color={drawToolBase.toolColor}
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
                        Pen Size: {drawToolBase.toolSize}
                    </label>
                    <input
                        type="number"
                        min='1'
                        max='5000'
                        step='1'
                        placeholder=' pen size'
                        className='w-full border border-black rounded-md'
                        onChange={(e) => handleToolChange('toolSize', parseInt(e.target.value))}
                    />
                    <input
                        type='range'
                        min='1'
                        max='50'
                        step='1'
                        value={drawToolBase.toolSize}
                        onChange={(e) => handleToolChange('toolSize', parseInt(e.target.value))}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <label>
                        Canv. Scale: {`${canvasScale}` || "1"}
                    </label>
                    <input
                        type='range'
                        min='0.1'
                        max='10'
                        step='0.1'
                        value={`${canvasScale}`}
                        onChange={(e) => handleScaleChange(e.target.value)}
                    />
                    <div className='flex gap-1'>
                        <button
                            type='button'
                            className='flex-1 w-min border border-black rounded-md'
                            onClick={() => handleScaleChange('1')}
                        >
                            Default View
                        </button>
                        <button
                            type='button'
                            className='flex-1 w-min border border-black rounded-md'
                            onClick={clear}
                        >
                            Clear Canvas
                        </button>
                    </div>
                </div>
                <div className='flex gap-1'>
                    <DownloadButton tag="Viev" reference={canvasRef} />
                    <DownloadButton tag="Canvas" reference={offCanvasRef} />
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
        </div >
    )
}

export default Page