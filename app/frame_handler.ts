export class FrameHandler {
	private frameNumberDiv: HTMLElement;

	private filenames: string[] = [];
	private currentFrame: number = 0;
	private currentImageDiv: HTMLElement;

	constructor(currentImageDiv: HTMLElement, frameNumberDiv: HTMLElement) {
		this.currentImageDiv = currentImageDiv;
		this.frameNumberDiv = frameNumberDiv;
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

	private SetCurrentImageDiv() {
		this.currentImageDiv.innerHTML = `<img src="${this.filenames[this.currentFrame]}"></img>`;
		if (this.filenames.length === 0) {
			this.frameNumberDiv.innerText = 'No images uploaded yet. Drag images onto the page to upload them';
		} else {
			this.frameNumberDiv.innerText = 'Current Frame: ' + this.currentFrame.toString();
		}
	}
}
