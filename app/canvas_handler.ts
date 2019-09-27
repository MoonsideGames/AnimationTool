import { IAnimationData } from './Interfaces/IAnimationData';
import { ICanvasData } from './Interfaces/ICanvasData';

// I display the canvas and am clickable
export class CanvasHandler {
	private currentImageDiv: HTMLElement;
	private canvasImage: HTMLCanvasElement;
	private imageElement: HTMLImageElement;
	private animationData: IAnimationData;
	private canvasData: ICanvasData;
	private orginInfo: HTMLElement;

	constructor(
		animationData: IAnimationData,
		canvasData: ICanvasData,
		canvasImage: HTMLCanvasElement,
		currentImageDiv: HTMLElement,
		imageElement: HTMLImageElement,
		originInfo: HTMLElement
	) {
		this.animationData = animationData;
		this.canvasData = canvasData;
		this.canvasImage = canvasImage;
		this.currentImageDiv = currentImageDiv;
		this.imageElement = imageElement;
		this.orginInfo = originInfo;

		//setup canvas
		this.canvasImage.width = 256;
		this.canvasImage.height = 256;
		this.UpdateCanvasDataSize();
		const canvasContext: CanvasRenderingContext2D = this.canvasImage.getContext('2d')!;
		canvasContext.fillRect(0, 0, 256, 256);

		this.currentImageDiv.addEventListener('click', this.mouseDown);
	}

	private UpdateCanvasDataSize() {
		this.canvasData.width = this.canvasImage.width;
		this.canvasData.height = this.canvasImage.height;
	}

	private mouseDown = (event: MouseEvent) => {
		// get position
		const ratioWidth: number = this.canvasImage.width / this.imageElement.width;
		const ratioHeight: number = this.canvasImage.height / this.imageElement.height;
		// get origin in pixels
		const pixelX: number = Math.floor(event.offsetX / ratioWidth);
		const pixelY: number = Math.floor(event.offsetY / ratioHeight);
		console.log('CLICK X:' + pixelX + ' Y:' + pixelY);
		// update animation data
		this.animationData.originX = pixelX;
		this.animationData.originY = pixelY;
		// update canvas data
		this.canvasData.widthRatio = ratioWidth;
		this.canvasData.heightRatio = ratioHeight;
		// update origin number display
		this.orginInfo.innerText = 'Origin X: ' + this.animationData.originX + ' Y: ' + this.animationData.originY;
	};
}
