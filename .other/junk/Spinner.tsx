'use client'
import React, { useRef, useEffect } from "react";
import { roboto } from "./fonts";

export const Spinner: React.FC<{ sectors: Array<string> }> = ({ sectors }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotationAngleRef = useRef<number>(0);
    const animationFrameRef = useRef<number | undefined>();
    const sectorColors = ["#ff5733", "#33ff33", "#3333ff", "#ff33ff", "#ffff33", "#33ffff", "#ffa500", "#ff0000"];

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;
        const centerX: number = canvas.width / 2;
        const centerY: number = canvas.height / 2;
        const radius: number = Math.min(centerX, centerY) - 10;
        
        const dragK: number = 0.99;
        let startSpeed: number = 0.4377; // rad/c for 75hz
        let timePrevious = Date.now();

        const draw = () => {
            let timeNow = Date.now();
            startSpeed > 0.0003 ?  (startSpeed *= dragK) :  (startSpeed = 0);
            // rotationAngleRef.current += startSpeed * (1 + (timeNow - timePrevious) * 0.0062832); //0.0062831=2Pi/1000 and "(...)" is for graphics incosistencies compensation
            // rotationAngleRef.current += (timeNow - timePrevious) * 0.0062832; //time dependant rotation calculation
            rotationAngleRef.current += startSpeed;
            timePrevious = timeNow;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationAngleRef.current);

            // Draw sectors
            const sectorAngle = (2 * Math.PI) / sectors.length;
            let startAngle = 0;
            for (let i = 0; i < sectors.length; i++) {
                const endAngle = startAngle + sectorAngle;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = sectorColors[i % sectorColors.length];
                ctx.fill();

                // Draw text labels
                ctx.save();
                ctx.rotate(startAngle + sectorAngle / 2);
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                ctx.font = `bold 18px ${roboto.style.fontFamily}`;
                ctx.fillText(sectors[i], radius / 2, 0);
                ctx.restore();

                startAngle = endAngle;
            }
            ctx.restore();
            if  (startSpeed > 0) {
                animationFrameRef.current = requestAnimationFrame(draw);
            } else {
                cancelAnimationFrame(animationFrameRef.current ? animationFrameRef.current : 0);
            }
        };
        draw();

        // Cleanup function to stop the animation when the component unmounts
        return () => cancelAnimationFrame(animationFrameRef.current ? animationFrameRef.current : 0);
    }, [sectors]);
    return (<canvas ref={canvasRef} width={window?.innerWidth} height={window?.innerHeight * 0.85} />);
    // return (<canvas ref={canvasRef} width={700} height={700} />);
};
