import { CanvasHandler } from './canvas_handler';
import { FileHandler } from './file_handler';
import { FrameHandler } from './frame_handler';
import { IAnimationData } from './Interfaces/IAnimationData';
import { IFrame } from './Interfaces/IFrame';

export class Page {
	private static handleDragOver(evt: DragEvent) {
		if (evt !== null) {
			evt.stopPropagation();
			evt.preventDefault();
			evt.dataTransfer!.dropEffect = 'copy'; // Explicitly show this is a copy.
		}
	}

	private frameHandler: FrameHandler;
	private canvasHandler: CanvasHandler;
	private animationData: IAnimationData;
	private frameRateInput: HTMLInputElement;

	public Load() {
		// defining blank slate animation data
		this.animationData = {
			pins: [],
			originX: 0,
			originY: 0,
			frameRate: 30,
			loop: true,
			frames: [
				{
					filename: '',
					pinData: []
				}
			]
		};

		this.canvasHandler = new CanvasHandler(document.getElementById('currentImage') as HTMLElement);
		// this.canvasHandler.currentImageDiv.addEventListener('onmousedown', ClickOnCanvas);

		this.frameHandler = new FrameHandler(
			this.animationData,
			document.getElementById('currentImage') as HTMLElement,
			document.getElementById('frameNumber') as HTMLElement
		);

		this.frameRateInput = document.getElementById('framerate') as HTMLInputElement;
		this.frameRateInput.addEventListener('change', this.updateFrameRate);

		const dropZone = document.getElementById('dropZone') as HTMLElement;

		dropZone.addEventListener('dragover', Page.handleDragOver, false);
		dropZone.addEventListener('drop', this.handleFileSelect, false);

		const keyDown = (event: KeyboardEvent) => {
			switch (event.keyCode) {
				case 48:
				case 49:
				case 50:
				case 51:
				case 52:
				case 53:
				case 54:
				case 55:
				case 56:
				case 57: {
					// goto frame w 1234567890
					if (event.keyCode === 48) {
						this.frameHandler.GoToFrame(9);
					} else {
						this.frameHandler.GoToFrame(event.keyCode - 49);
					}
					this.frameHandler.StopPlayingAnimation();
					break;
				}

				case 39:
				case 190: {
					// right_arrow, carrot
					console.log('next frame action');
					this.frameHandler.AdvanceFrames(1);
					this.frameHandler.StopPlayingAnimation();
					break;
				}

				case 37:
				case 188: {
					// left arrow, carrot
					console.log('previous frame action');
					this.frameHandler.AdvanceFrames(-1);
					this.frameHandler.StopPlayingAnimation();
					break;
				}

				case 40: {
					// down arrow
					this.frameHandler.GoToFrame(0);
					this.frameHandler.StopPlayingAnimation();
					break;
				}

				case 32: {
					// spacebar
					this.frameHandler.TogglePlayingAnimation();
					break;
				}

				case 83: {
					// s
					this.download('.anim', JSON.stringify(this.animationData));
					break;
				}
			}
		};

		document.addEventListener('keydown', keyDown);
	}

	private handleFileSelect = async (event: DragEvent) => {
		event.stopPropagation();
		event.preventDefault();

		const filenames = await FileHandler.ProcessImages(event.dataTransfer!.files);
		this.frameHandler.loadFrames(filenames);

		const newFrames: IFrame[] = [];

		for (let i = 0; i < event.dataTransfer!.files.length; i++) {
			newFrames.push({
				filename: event.dataTransfer!.files[i].name,
				pinData: []
			});
		}

		this.animationData.frames = newFrames;
		console.log(this.animationData);
	};

	private download(filename: string, text: string) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	private updateFrameRate = () => {
		this.animationData.frameRate = this.frameRateInput.valueAsNumber;
		console.log('new frame rate = ' + this.animationData.frameRate);
	};
}
