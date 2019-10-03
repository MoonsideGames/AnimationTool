import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { CanvasHandler } from './canvas_handler';
import { FileHandler } from './file_handler';
import { FrameHandler } from './frame_handler';
import { IAnimationData } from './Interfaces/IAnimationData';
import { IFrame } from './Interfaces/IFrame';
import { IProjectData } from './Interfaces/IProjectData';
import { PinHandler } from './pin_handler';

export class Page {
	private static handleDragOver(evt: DragEvent) {
		if (evt !== null) {
			evt.stopPropagation();
			evt.preventDefault();
			evt.dataTransfer!.dropEffect = 'copy'; // Explicitly show this is a copy.
		}
	}

	private pinHandler: PinHandler;
	private frameHandler: FrameHandler;
	private canvasHandler: CanvasHandler;
	private animationData: IAnimationData;
	private frameRateInput: HTMLInputElement;
	private loopingInput: HTMLInputElement;

	private canvasImage: HTMLCanvasElement;
	private canvasContext: CanvasRenderingContext2DSettings;

	private projectData: IProjectData;
	private filenameInput: HTMLInputElement;

	private message: HTMLElement;

	public Load() {
		// defining blank slate animation data
		this.animationData = {
			pins: [],
			originX: -1,
			originY: -1,
			frameRate: 30,
			loop: true,
			frames: [
				{
					filename: ''
				}
			]
		};
		// blank slate canvas data
		this.projectData = {
			currentFrame: 0,
			currentlySelectedPin: 0,
			width: 0,
			height: 0,
			widthRatio: 0,
			heightRatio: 0
		};

		this.message = document.getElementById('message') as HTMLElement;
		const canvasElement = document.getElementById('canvasImage') as HTMLCanvasElement;

		const imageElement = new Image();

		this.pinHandler = new PinHandler(
			document.getElementById('addpin') as HTMLElement,
			document.getElementById('pinSettings') as HTMLElement,
			document.getElementById('pinContainer') as HTMLElement,
			document.getElementById('originPin') as HTMLElement,
			this.projectData,
			this.animationData
		);

		// setup canvas
		this.canvasHandler = new CanvasHandler(
			this.animationData,
			this.projectData,
			canvasElement,
			imageElement,
			document.getElementById('originInfo') as HTMLElement
		);

		// setup frame handler
		this.frameHandler = new FrameHandler(
			this.animationData,
			this.projectData,
			canvasElement,
			canvasElement.getContext('2d')!,
			document.getElementById('frameNumber') as HTMLElement,
			imageElement,
			this.projectData
		);

		// input elements
		this.frameRateInput = document.getElementById('framerate') as HTMLInputElement;
		this.frameRateInput.addEventListener('change', this.UpdateFrameRate);
		this.loopingInput = document.getElementById('looping') as HTMLInputElement;
		this.loopingInput.addEventListener('change', this.UpdateLooping);
		this.filenameInput = document.getElementById('filename') as HTMLInputElement;

		const dropZone = document.getElementById('dropZone') as HTMLElement;

		dropZone.addEventListener('dragover', Page.handleDragOver, false);
		dropZone.addEventListener('drop', this.handleFileSelect, false);

		this.ResetProgram();

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
					if (document.activeElement === document.body) {
						this.pinHandler.UpdateAnimationPinNames();

						if (this.CheckAllFramesForPinData()) {
							const zip = new JSZip();
							// name of project
							const name = this.filenameInput.value;
							// .anim file
							zip.file(name + '.anim', JSON.stringify(this.animationData));
							// pngs
							const filenames = this.frameHandler.GetFilenames();
							for (let i = 0; i < filenames.length; i++) {
								const filedata = filenames[i].split('base64,')[1];
								const padding = i.toString().padStart(3, '0');
								zip.file(name + '_' + padding.toString() + '.png', filedata, { base64: true });
							}
							// save zip
							zip.generateAsync({ type: 'blob' }).then((content) => {
								// see FileSaver.js
								saveAs(content, name + '.zip');
							});
						}
					}
				}
			}
		};

		document.addEventListener('keydown', keyDown);
	}

	private CheckAllFramesForPinData(): boolean {
		const availablePins: number[] = this.pinHandler.GetAvailablePins();
		let passTest: boolean = true;
		let passPinDataTest: boolean = true;
		let errorString: string = '';
		let pinErrorString: string = '';
		for (let frame = 0; frame < this.animationData.frames.length; frame++) {
			for (let p = 0; p < availablePins.length; p++) {
				// loop through available pinIDs
				const pinIDChecking = availablePins[p];
				if (this.animationData.frames[frame][pinIDChecking] === undefined) {
					pinErrorString += 'Frame ' + frame + ', ' + this.pinHandler.GetPinName(pinIDChecking) + '\n';
					passPinDataTest = false;
				}
			}
		}
		// construct error string
		if (this.animationData.originX === -999 || this.animationData.originY === -999) {
			errorString = 'Missing Origin data. \n';
			passTest = false;
		}
		if (!passPinDataTest) {
			// warn user if missing pin data
			errorString += 'Missing the following pin data: \n\n' + pinErrorString;
			passTest = false;
		}
		this.message.innerText = errorString;
		return passTest;
	}

	private handleFileSelect = async (event: DragEvent) => {
		this.ResetProgram();

		event.stopPropagation();
		event.preventDefault();

		const filenames = await FileHandler.ProcessImages(event.dataTransfer!.files);
		this.frameHandler.loadFrames(filenames);

		const newFrames: IFrame[] = [];

		for (let i = 0; i < event.dataTransfer!.files.length; i++) {
			newFrames.push({
				filename: event.dataTransfer!.files[i].name
			});
		}

		this.animationData.frames = newFrames;
		this.frameHandler.GoToFrame(0);
		this.frameHandler.StopPlayingAnimation();
		this.frameHandler.TogglePlayingAnimation();

		this.canvasHandler.ResizeCanvas();

		// set framedata initialized to true
	};

	private ResetProgram = () => {
		// defining blank slate animation data
		this.animationData.pins = [];
		this.animationData.originX = -999;
		this.animationData.originY = -999;
		this.animationData.frameRate = 30;
		this.animationData.loop = true;
		this.animationData.frames = [ { filename: '' } ];

		// blank slate canvas data
		this.projectData.currentFrame = 0;
		this.projectData.currentlySelectedPin = 0;
		this.projectData.width = 0;
		this.projectData.widthRatio = 0;
		this.projectData.height = 0;
		this.projectData.heightRatio = 0;

		// reset input displays
		this.frameRateInput.value = this.animationData.frameRate.toString();
		this.loopingInput.checked = this.animationData.loop;
		this.filenameInput.value = '';

		// destroy pin divs
		this.pinHandler.RemoveAllPins();
		this.projectData.currentlySelectedPin = 0;
	};

	private UpdateLooping = () => {
		this.animationData.loop = this.loopingInput.checked;
	};

	private UpdateFrameRate = () => {
		this.animationData.frameRate = this.frameRateInput.valueAsNumber;
		this.frameHandler.StopPlayingAnimation();
		this.frameHandler.TogglePlayingAnimation();
		console.log('new frame rate = ' + this.animationData.frameRate);
	};

	private updateLooping = () => {
		this.animationData.loop = this.loopingInput.checked;
		console.log('new looping value = ' + this.loopingInput.checked);
	};
}
