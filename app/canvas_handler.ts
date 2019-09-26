//I display the canvas and am clickable
export class CanvasHandler {
	private currentImageDiv: HTMLElement;

	constructor(currentImageDiv: HTMLElement) {
		this.currentImageDiv = currentImageDiv;
		console.log(this.currentImageDiv);
	}

	public Load() {
		const mouseDown = (event: MouseEvent) => {
			console.log(event.x + ' ' + event.y);
		};

		this.currentImageDiv.addEventListener('mousedown', mouseDown);
	}
}
