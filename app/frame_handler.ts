import { IAnimationData } from './Interfaces/IAnimationData';

export class FrameHandler {
	private start: number = 0;

	private frameNumberDiv: HTMLElement;
	private animationData: IAnimationData;

	private filenames: string[] = [];
	private currentFrame: number = 0;
	private currentImageDiv: HTMLElement;
	private playingAnimation: boolean;

	constructor(animationData: IAnimationData, currentImageDiv: HTMLElement, frameNumberDiv: HTMLElement) {
		this.animationData = animationData;
		this.currentImageDiv = currentImageDiv;
		this.frameNumberDiv = frameNumberDiv;
		window.requestAnimationFrame(this.windowAnimationUpdate);
	}

	public GetCurrentFrame(): number {
		return this.currentFrame;
	}

	public loadFrames(filenames: string[]) {
		this.filenames = filenames;
		this.currentFrame = 0;
		this.SetCurrentImageDiv();
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
		this.SetCurrentImageDiv();
	}

	public TogglePlayingAnimation() {
		this.playingAnimation = !this.playingAnimation;
		console.log('playingAnimation = ', this.playingAnimation);
	}
	public StopPlayingAnimation() {
		this.playingAnimation = false;
	}

	private SetCurrentImageDiv() {
		this.currentImageDiv.innerHTML = `<img src="${this.filenames[this.currentFrame]}"></img>`;
		if (this.filenames.length === 0) {
			this.frameNumberDiv.className = 'warning';
			this.frameNumberDiv.innerText = 'No images uploaded yet';
		} else {
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
		window.requestAnimationFrame(this.windowAnimationUpdate);
		// console.log('timestamp = ' + timestamp);
	};
}
