export class FrameHandler {
	private filenames: string[] = [];
	private currentFrame: number = 0;
	private currentImageDiv: HTMLElement;

	constructor(currentImageDiv: HTMLElement) {
		this.currentImageDiv = currentImageDiv;
	}

	public loadFrames(filenames: string[]) {
		this.filenames = filenames;
		this.currentFrame = 0;
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
		this.currentImageDiv.innerHTML = `<img src="${this.filenames[this.currentFrame]}"></img>`;
		console.log('current frame = ', this.currentFrame);
	}
}
