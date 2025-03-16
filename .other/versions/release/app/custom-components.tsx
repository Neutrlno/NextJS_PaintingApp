import { FC, useState } from 'react'

const GCOdropDown: FC<GCOdropDownProps> = ({ value, onChange }) => {
    const [tooltipOpacity, setTooltipOpacity] = useState<string>('0');

    const gco_bcp_full = ["source-over", "source-in", "source-out", "source-atop", "destination-over", "destination-in", "destination-out", "destination-atop", "lighter", "copy", "xor", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];

    const gco = [
        ["source-over", "This is the default setting and draws new shapes on top of the existing canvas content (try lighten to mix colors)"],
        ["color", "Preserves the luma of the bottom layer, while adopting the hue and chroma of the top layer"],
        ["color-burn", "Divides the inverted bottom layer by the top layer, and then inverts the result"],
        ["color-dodge", "Divides the bottom layer by the inverted top layer"],
        ["destination-over", "New shapes are drawn behind the existing canvas content"],
        ["destination-out", "The existing content is kept where it doesn't overlap the new shape"],
        ["darken", "Retains the darkest pixels of both layers"],
        ["difference", "Subtracts the bottom layer from the top layer or the other way round to always get a positive value"],
        ["exclusion", "Like difference, but with lower contrast"],
        ["hard-light", "A combination of multiply and screen like overlay, but with top and bottom layer swapped"],
        ["hue", "Preserves the luma and chroma of the bottom layer, while adopting the hue of the top layer"],
        ["lighten", "Retains the lightest pixels of both layers"],
        ["lighter", "Where both shapes overlap the color is determined by adding color values"],
        ["luminosity", "Preserves the hue and chroma of the bottom layer, while adopting the luma of the top layer"],
        ["multiply", "The pixels of the top layer are multiplied with the corresponding pixel of the bottom layer. A darker picture is the result"],
        ["overlay", "A combination of multiply and screen. Dark parts on the base layer become darker, and light parts become lighter"],
        ["saturation", "Preserves the luma and hue of the bottom layer, while adopting the chroma of the top layer"],
        ["screen", "The pixels are inverted, multiplied, and inverted again. A lighter picture is the result (opposite of multiply)"],
        ["soft-light", "A softer version of hard-light. Pure black or white does not result in pure black or white"],
        ["source-atop", "The new shape is only drawn where it overlaps the existing canvas content"],
        ["xor", "Shapes are made transparent where both overlap and drawn normal everywhere else"]
    ];

    function getGCOoptions() {
        const optionsArray = [];
        for (let i = 0; i < gco.length; i++) {
            optionsArray[i] = <option key={gco[i][0]} value={gco[i][0]} title={gco[i][1]}>{gco[i][0].replace("destination", "destin")}</option>
        }
        return optionsArray;
    }

    function getTitle(val: string) {
        let result = '';
        for (let i = 0; i < gco.length; i++) {
            if (gco[i][0] === val) result = gco[i][1];
        }
        return result;
    }

    return (
        <label className='flex flex-col  gap-1 relative'>
            Operation:
            <select
                value={value}
                onChange={onChange}
                className='w-full border border-black rounded-md'
                onMouseEnter={() => setTooltipOpacity('1')}
                onMouseLeave={() => setTooltipOpacity('0')}
            >
                {getGCOoptions()}
            </select>
            <div
                className={
                    `z-[1] absolute w-max max-w-[300px] top-[60px] px-2 py-1 rounded-[3px]
                    bg-gray-600 text-[white] text-sm 
                    transition-opacity duration-[0.4s]
                    pointer-events-none whitespace-normal`
                }
                style={{
                    opacity: tooltipOpacity
                }}
            >
                {getTitle(value)}
            </div>
        </label>
    )
}

const DownloadButton: FC<DownloadButtonProps> = ({ tag, reference }) => {
    const downloadImage = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (reference.current && tempCtx) {

            tempCanvas.width = reference.current.width;
            tempCanvas.height = reference.current.height;

            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(reference.current, 0, 0);

            const downloadLink = document.createElement('a');
            const now = new Date(Date.now());
            downloadLink.download = `image-${now.toLocaleTimeString('en-US', { hour12: false })}.png`;

            downloadLink.href = tempCanvas.toDataURL();
            downloadLink.click();
        }
    }

    return (
        <button
            type='button'
            className='flex flex-1 flex-col items-center border border-black rounded-md'
            onClick={downloadImage}
        >
            <svg className="w-6 h-6 inline-block" viewBox="0 0 24 24">
                <path
                    d="M4 15h2v3h12v-3h2v3c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2m11.59-8.41L13 12.17V4h-2v8.17L8.41 9.59 7 11l5 5 5-5-1.41-1.41z"
                >
                </path>
            </svg>
            <span>{tag}</span>
        </button>
    )
}

const RadioButtonLabel: FC<RadioButtonLabelProps> = ({ tag, onChange, checked }) => {
    return (
        <label
            className='flex w-1/2 p-1 border border-black rounded-md'
        >
            <input
                type='radio'
                value='pen'
                checked={checked}
                onChange={onChange}
            />
            {tag}
        </label>
    )
}

export { DownloadButton, RadioButtonLabel };
export default GCOdropDown;