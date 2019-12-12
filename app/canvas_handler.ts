import { IAnimationData } from './Interfaces/IAnimationData';
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

		this.ResizeCanvas(256, 256);
		this.UpdateCanvasDataSize();
		const canvasContext: CanvasRenderingContext2D = this.canvasImage.getContext('2d')!;
		canvasContext.clearRect(0, 0, this.targetImageSize, this.targetImageSize);
		canvasContext.imageSmoothingEnabled = false;
	}

	public ResizeCanvas(width: number, height: number) {
		// get image ratio, then scale default width by it
		const hwratio = height / width;

		let newWidth = this.targetImageSize / hwratio;
		let newHeight = this.targetImageSize;

		if (newWidth > 600) {
			newWidth = 600;
			newHeight = 600 * hwratio;
		}

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
		if (this.projectData.currentlySelectedPin === -1) {
			// update animation data
			this.animationData.originX = pixelX;
			this.animationData.originY = pixelY;
		} else {
			const newPinData = {
				x: pixelX,
				y: pixelY
			};

			this.animationData.frames[this.projectData.currentFrame].pinData[
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
