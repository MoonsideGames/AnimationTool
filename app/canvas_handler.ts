import { IAnimationData } from './Interfaces/IAnimationData';
import { IFramePinData } from './Interfaces/IFramePinData';
import { IProjectData } from './Interfaces/IProjectData';

// I display the canvas and am clickable
export class CanvasHandler {
	private canvasImage: HTMLCanvasElement;
	private imageElement: HTMLImageElement;
	private animationData: IAnimationData;
	private projectData: IProjectData;
	private orginInfo: HTMLElement;

	private targetImageSize: number = 256;

	constructor(
		animationData: IAnimationData,
		canvasData: IProjectData,
		canvasImage: HTMLCanvasElement,
		imageElement: HTMLImageElement,
		originInfo: HTMLElement
	) {
		this.animationData = animationData;
		this.projectData = canvasData;
		this.canvasImage = canvasImage;
		this.imageElement = imageElement;
		this.orginInfo = originInfo;

		this.ResizeCanvas();
		this.UpdateCanvasDataSize();
		const canvasContext: CanvasRenderingContext2D = this.canvasImage.getContext('2d')!;
		canvasContext.fillRect(0, 0, this.targetImageSize, this.targetImageSize);
		canvasContext.imageSmoothingEnabled = false;
	}

	public ResizeCanvas() {
		// get image ratio, then scale default width by it
		const hwratio = this.imageElement.height / this.imageElement.width;
		const newWidth = this.targetImageSize / hwratio;
		const newHeight = this.targetImageSize;
		this.canvasImage.width = newWidth;
		this.canvasImage.height = newHeight;
		this.UpdateCanvasDataSize();
	}

	public CanvasMouseDown = (offsetX: number, offsetY: number) => {
		// get position
		const ratioWidth: number = this.canvasImage.width / this.imageElement.width;
		const ratioHeight: number = this.canvasImage.height / this.imageElement.height;
		// get origin in pixels
		const pixelX: number = Math.floor(offsetX / ratioWidth);
		const pixelY: number = Math.floor(offsetY / ratioHeight);
		// console.log('CLICK X:' + pixelX + ' Y:' + pixelY);
		if (this.projectData.currentlySelectedPin === 0) {
			// update animation data
			this.animationData.originX = pixelX;
			this.animationData.originY = pixelY;
		} else {
			// console.log('current pin id = ' + this.projectData.currentlySelectedPin);
			const newPinData: IFramePinData = {
				id: this.projectData.currentlySelectedPin,
				x: pixelX,
				y: pixelY
			};

			this.animationData.frames[this.projectData.currentFrame][
				this.projectData.currentlySelectedPin
			] = newPinData;
		}
		// update canvas data
		this.projectData.widthRatio = ratioWidth;
		this.projectData.heightRatio = ratioHeight;
	};

	private UpdateCanvasDataSize() {
		this.projectData.width = this.canvasImage.width;
		this.projectData.height = this.canvasImage.height;
	}
}
