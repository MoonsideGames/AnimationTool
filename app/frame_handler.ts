import { IAnimationData } from './Interfaces/IAnimationData';
import { ICanvasData } from './Interfaces/ICanvasData';

export class FrameHandler {
	private start: number = 0;

	private frameNumberDiv: HTMLElement;

	private animationData: IAnimationData;
	private canvasData: ICanvasData;

	private filenames: string[] = [];
	private currentFrame: number = 0;
	private playingAnimation: boolean;

	private htmlCanvasElement: HTMLCanvasElement;
	private canvasContext: CanvasRenderingContext2D;

	private imageElement: HTMLImageElement;

	constructor(
		animationData: IAnimationData,
		canvasData: ICanvasData,
		htmlCanvasElement: HTMLCanvasElement,
		canvasContext: CanvasRenderingContext2D,
		frameNumberDiv: HTMLElement,
		imageElement: HTMLImageElement
	) {
		this.animationData = animationData;
		this.canvasData = canvasData;
		this.htmlCanvasElement = htmlCanvasElement;
		this.canvasContext = canvasContext;
		this.frameNumberDiv = frameNumberDiv;
		window.requestAnimationFrame(this.windowAnimationUpdate);
		this.imageElement = imageElement;
	}

	public GetCurrentFrame(): number {
		return this.currentFrame;
	}

	public loadFrames(filenames: string[]) {
		this.filenames = filenames;
		this.currentFrame = 0;
		this.RefreshImage();
	}

	public AdvanceFrames(amount: number) {
		this.currentFrame += amount;
		this.currentFrame %= this.filenames.length;
		if (this.currentFrame < 0) {
			this.currentFrame = this.filenames.length - 1;
		}
		this.GoToFrame(this.currentFrame);
	}

	public GoToFrame(frame: number) {
		this.currentFrame = frame;
		this.RefreshImage();
	}

	public TogglePlayingAnimation() {
		this.playingAnimation = !this.playingAnimation;
		console.log('playingAnimation = ', this.playingAnimation);
	}
	public StopPlayingAnimation() {
		this.playingAnimation = false;
	}

	public GetFilenames(): string[] {
		return this.filenames;
	}

	private RefreshImage() {
		if (this.filenames.length === 0) {
			this.frameNumberDiv.className = 'warning';
			this.frameNumberDiv.innerText = 'No images uploaded yet';
		} else {
			this.canvasContext.clearRect(0, 0, this.htmlCanvasElement.width, this.htmlCanvasElement.height);
			this.canvasContext.imageSmoothingEnabled = false;
			this.imageElement.src = this.filenames[this.currentFrame];
			// draw sprite
			this.canvasContext.drawImage(
				this.imageElement,
				0,
				0,
				this.htmlCanvasElement.width,
				this.htmlCanvasElement.height
			);
			// draw origin +
			const originCursorSize: number = 500;
			const originX = this.animationData.originX * this.canvasData.widthRatio;
			const originY = this.animationData.originY * this.canvasData.heightRatio;
			this.canvasContext.beginPath();
			this.canvasContext.moveTo(originX, originY - originCursorSize);
			this.canvasContext.lineTo(originX, originY + originCursorSize);
			this.canvasContext.moveTo(originX - originCursorSize, originY);
			this.canvasContext.lineTo(originX + originCursorSize, originY);
			this.canvasContext.stroke();
			this.frameNumberDiv.className = 'instruction';
			this.frameNumberDiv.innerText =
				'Frame  ' + (this.currentFrame + 1).toString() + ' / ' + this.filenames.length.toString();
		}
	}

	private windowAnimationUpdate = (timestamp: number) => {
		if (this.start === 0) {
			this.start = timestamp;
		}
		const progress = timestamp - this.start;
		if (this.playingAnimation && progress > 1000 / this.animationData.frameRate) {
			this.AdvanceFrames(1);
			this.start = 0;
		}
		this.RefreshImage();
		window.requestAnimationFrame(this.windowAnimationUpdate);
		// console.log('timestamp = ' + timestamp);
	};
}
