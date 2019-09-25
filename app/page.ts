import { FileHandler } from './file_handler';
import { FrameHandler } from './frame_handler';

export class Page {
	private static handleDragOver(evt: DragEvent) {
		if (evt !== null) {
			evt.stopPropagation();
			evt.preventDefault();
			evt.dataTransfer!.dropEffect = 'copy'; // Explicitly show this is a copy.
		}
	}

	private filenames: string[] = [];

	public Load() {
		// const fileHandler = new FileHandler('dropZone', 'output', this.filenames);
		const frameHandler = new FrameHandler(document.getElementById('currentImage') as HTMLElement);

		const dropZone = document.getElementById('dropZone') as HTMLElement;
		const output = document.getElementById('output') as HTMLElement;

		dropZone.addEventListener('dragover', Page.handleDragOver, false);
		dropZone.addEventListener('drop', this.handleFileSelect, false);

		const keyDown = (event: KeyboardEvent) => {
			switch (event.keyCode) {
				case 39: {
					// right_arrow
					console.log('next frame action');
					frameHandler.AdvanceFrames(1);
					break;
				}

				case 37: {
					// left arrow
					console.log('previous frame action');
					frameHandler.AdvanceFrames(-1);
					break;
				}
			}
		};

		document.addEventListener('keydown', keyDown);
	}

	private handleFileSelect = (event: any) => {
		event.stopPropagation();
		event.preventDefault();

		FileHandler.ProcessImages(event.target.result);

		console.log('files: ' + this.filenames.length);
	};
}
