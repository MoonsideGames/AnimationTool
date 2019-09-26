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

		this.frameHandler = new FrameHandler(
			document.getElementById('currentImage') as HTMLElement,
			document.getElementById('frameNumber') as HTMLElement
		);

		const dropZone = document.getElementById('dropZone') as HTMLElement;

		dropZone.addEventListener('dragover', Page.handleDragOver, false);
		dropZone.addEventListener('drop', this.handleFileSelect, false);

		const keyDown = (event: KeyboardEvent) => {
			switch (event.keyCode) {
				case 39: {
					// right_arrow
					console.log('next frame action');
					this.frameHandler.AdvanceFrames(1);
					break;
				}

				case 37: {
					// left arrow
					console.log('previous frame action');
					this.frameHandler.AdvanceFrames(-1);
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
}
