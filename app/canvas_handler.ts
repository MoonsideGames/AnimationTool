//I display the canvas and am clickable
export class CanvasHandler {
	private currentImageDiv: HTMLElement;

	constructor(currentImageDiv: HTMLElement) {
		this.currentImageDiv = currentImageDiv;
		this.currentImageDiv.addEventListener('onmousedown', this.clickOnImage);
		this.currentImageDiv.addEventListener('onmouseover', this.hoverOverImage);
	}

	// public Load() {
	// 	this.currentImageDiv.addEventListener('onmousedown', this.clickOnImage);
	// }

	private hoverOverImage() {
		console.log('hovering over image');
	}

	private clickOnImage = (e: Event) => {
		console.log('Clicked on image');
	};
}
