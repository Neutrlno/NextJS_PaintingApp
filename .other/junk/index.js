const useAnimationFrame = ({
	nextAnimationFrameHandler,
	// we still want to have "infinite" animations in some cases
	duration = Number.POSITIVE_INFINITY,
	shouldAnimate = true
}) => {
	const frame = React.useRef(0);
	// keep track of when animation is started
	const firstFrameTime = React.useRef(performance.now());
	let prev = performance.now();
	const animate = (now) => {
		// calculate at what time fraction we are currently of whole time of animation
		console.log((1000/(now-prev)).toFixed(2));
		prev=now;
		let timeFraction = (now - firstFrameTime.current) / duration;
		if (timeFraction > 1) {
			timeFraction = 1;
		}

		if (timeFraction <= 1) {
			nextAnimationFrameHandler(timeFraction);

			// request next frame only in cases when we not reached 100% of duration
			if (timeFraction != 1) frame.current = requestAnimationFrame(animate);
		}
	};

	React.useEffect(() => {
		// console.log(shouldAnimate);
		if (shouldAnimate) {
			firstFrameTime.current = performance.now();
			frame.current = requestAnimationFrame(animate);
		} else {
			cancelAnimationFrame(frame.current);
		}

		return () => cancelAnimationFrame(frame.current);
	}, [shouldAnimate]);
};

const Scroller = () => {
	const brickRef = React.useRef();
	const [shouldAnimate, setShouldAnimate] = React.useState(false);

	const reset = () => {
		brickRef.current.style.left = 0;
	};

	const nextAnimationFrameHandler = (progress) => {
		// console.log(progress);
		const brick = brickRef.current;
		if (brick) {
			const currentLeft = Number(brick.style.left.replace("px", "") || 0);

			if (progress < 1) {
				brick.style.left = `${1000 * progress}px`;
			} else {
				setShouldAnimate(false);
				brick.style.left = `1000px`;
			}
		}
	};

	useAnimationFrame({
		nextAnimationFrameHandler,
		shouldAnimate,
		duration: 10000
	});

	return (
		<>
			<button onClick={() => reset()}>Reset!</button>
			<main className="path">
				<div
					className="brick"
					ref={brickRef}
					onClick={() => setShouldAnimate(true)}
				>
					Click me!
				</div>
			</main>
		</>
	);
};

ReactDOM.render(<Scroller />, document.getElementById("app"));
