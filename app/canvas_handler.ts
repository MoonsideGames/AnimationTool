import { IAnimationData } from './Interfaces/IAnimationData';
import { ICanvasData } from './Interfaces/ICanvasData';

// I display the canvas and am clickable
export class CanvasHandler {
	private canvasImage: HTMLCanvasElement;
	private imageElement: HTMLImageElement;
	private animationData: IAnimationData;
	private canvasData: ICanvasData;
	private orginInfo: HTMLElement;

	private targetImageSize: number = 256;

	constructor(
		animationData: IAnimationData,
		canvasData: ICanvasData,
		canvasImage: HTMLCanvasElement,
		imageElement: HTMLImageElement,
		originInfo: HTMLElement
	) {
		this.animationData = animationData;
		this.canvasData = canvasData;
		this.canvasImage = canvasImage;
		this.imageElement = imageElement;
		this.orginInfo = originInfo;

		this.ResizeCanvas();
		this.UpdateCanvasDataSize();
		const canvasContext: CanvasRenderingContext2D = this.canvasImage.getContext('2d')!;
		canvasContext.fillRect(0, 0, this.targetImageSize, this.targetImageSize);
		canvasContext.imageSmoothingEnabled = false;

		this.canvasImage.addEventListener('click', this.mouseDown);
	}

	public ResizeCanvas() {
		// get image ratio, then scale default width by it
		const hwratio = this.imageElement.height / this.imageElement.width;
		const newWidth = this.targetImageSize / hwratio;
		const newHeight = this.targetImageSize;
		console.log('hwratio = ' + hwratio);
		this.canvasImage.width = newWidth;
		this.canvasImage.height = newHeight;
		this.UpdateCanvasDataSize();
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
