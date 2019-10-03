import { IAnimationData } from './Interfaces/IAnimationData';
import { IFramePinData } from './Interfaces/IFramePinData';
import { IProjectData } from './Interfaces/IProjectData';

export class FrameHandler {
	private start: number = 0;

	private frameNumberDiv: HTMLElement;

	private animationData: IAnimationData;
	private canvasData: IProjectData;

	private filenames: string[] = [];
	private currentFrame: number = 0;
	private playingAnimation: boolean;

	private htmlCanvasElement: HTMLCanvasElement;
	private canvasContext: CanvasRenderingContext2D;

	private imageElement: HTMLImageElement;

	private projectData: IProjectData;

	constructor(
		animationData: IAnimationData,
		canvasData: IProjectData,
		htmlCanvasElement: HTMLCanvasElement,
		canvasContext: CanvasRenderingContext2D,
		frameNumberDiv: HTMLElement,
		imageElement: HTMLImageElement,
		projectData: IProjectData
	) {
		this.animationData = animationData;
		this.canvasData = canvasData;
		this.htmlCanvasElement = htmlCanvasElement;
		this.canvasContext = canvasContext;
		this.frameNumberDiv = frameNumberDiv;
		window.requestAnimationFrame(this.windowAnimationUpdate);
		this.imageElement = imageElement;
		this.projectData = projectData;
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
		if (this.animationData.loop || !this.playingAnimation) {
			this.currentFrame %= this.filenames.length;
		} else {
			if (this.currentFrame > this.filenames.length - 1) {
				this.playingAnimation = false;
				this.currentFrame = Math.min(this.currentFrame, this.filenames.length - 1);
			}
		}
		if (this.currentFrame < 0) {
			this.currentFrame = this.filenames.length - 1;
		}
		this.GoToFrame(this.currentFrame);
	}

	public GoToFrame(frame: number) {
		this.currentFrame = frame;
		this.RefreshImage();
		this.projectData.currentFrame = this.currentFrame;
	}

	public TogglePlayingAnimation() {
		this.playingAnimation = !this.playingAnimation;
		if (this.playingAnimation && this.currentFrame === this.filenames.length - 1 && !this.animationData.loop) {
			this.currentFrame = -1;
		}
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
			this.canvasContext.strokeStyle = '#000000';
			const originCursorSize: number = 500;
			const originX = this.animationData.originX;
			const originY = this.animationData.originY;
			this.DrawCrossHair(500, this.canvasContext, originX, originY);
			// frame number update
			this.frameNumberDiv.className = 'instruction';
			this.frameNumberDiv.innerText =
				'Frame  ' + (this.currentFrame + 1).toString() + ' / ' + this.filenames.length.toString();
			// draw pins
			for (let i = 0; i < 10; i++) {
				this.canvasContext.strokeStyle = '#FF0000';
				if (this.animationData.frames[this.projectData.currentFrame] !== undefined) {
					const currentSelectedPinData: IFramePinData = this.animationData.frames[
						this.projectData.currentFrame
					][i];
					if (currentSelectedPinData !== null && currentSelectedPinData !== undefined) {
						this.DrawCrossHair(50, this.canvasContext, currentSelectedPinData.x, currentSelectedPinData.y);
					}
				}
			}
		}
	}

	private DrawCrossHair(size: number, canvasContext: CanvasRenderingContext2D, x: number, y: number) {
		x *= this.canvasData.widthRatio;
		y *= this.canvasData.heightRatio;
		canvasContext.beginPath();
		canvasContext.moveTo(x, y - size);
		canvasContext.lineTo(x, y + size);
		canvasContext.moveTo(x - size, y);
		canvasContext.lineTo(x + size, y);
		canvasContext.stroke();
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
