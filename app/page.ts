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

	private addPinButton: HTMLElement;

	private outputMessage: HTMLElement;

	private canvasMouseHeld: boolean = false;

	public Load() {
		// defining blank slate animation data
		this.animationData = {
			frameRate: 30,
			frames: [
				{
					filename: ''
				}
			],
			loop: true,
			originX: -1,
			originY: -1,
			pins: []
		};
		// blank slate canvas data
		this.projectData = {
			currentFrame: 0,
			currentlySelectedPin: 0,
			height: 0,
			heightRatio: 0,
			width: 0,
			widthRatio: 0
		};

		this.outputMessage = document.getElementById('outputMessage') as HTMLElement;

		this.message = document.getElementById('message') as HTMLElement;
		const canvasImage = document.getElementById('canvasImage') as HTMLCanvasElement;

		const imageElement = new Image();

		this.pinHandler = new PinHandler(
			document.getElementById('pinSettings') as HTMLElement,
			document.getElementById('pinContainer') as HTMLElement,
			document.getElementById('originPin') as HTMLElement,
			this.projectData,
			this.animationData
		);
		this.addPinButton = document.getElementById('addpin') as HTMLElement;
		this.addPinButton.addEventListener('click', this.AddPinButtonPressed);

		// setup canvas
		this.canvasHandler = new CanvasHandler(
			this.animationData,
			this.projectData,
			canvasImage,
			imageElement,
			document.getElementById('originInfo') as HTMLElement
		);
		canvasImage.addEventListener('mousedown', (event: MouseEvent) => {
			this.canvasMouseHeld = true;
			this.canvasHandler.CanvasMouseDown(event.offsetX, event.offsetY);
			this.pinHandler.UpdatePinBoxStatus();
		});
		canvasImage.addEventListener('mousemove', this.CanvasMouseDown);

		// reset holds on global mouse up
		document.addEventListener('mouseup', () => {
			this.canvasMouseHeld = false;
			this.frameHandler.frameViewerMouseHeld = false;
		});

		// setup frame handler
		this.frameHandler = new FrameHandler(
			this.animationData,
			this.projectData,
			canvasImage,
			canvasImage.getContext('2d')!,
			document.getElementById('frameNumber') as HTMLElement,
			imageElement,
			this.projectData,
			document.getElementById('frameViewer') as HTMLElement
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
					let targetFrame: number = event.keyCode - 49;
					if (event.keyCode === 48) {
						targetFrame = 9;
					}

					targetFrame %= this.animationData.frames.length;

					this.frameHandler.StopPlayingAnimation();
					this.frameHandler.GoToFrame(targetFrame);
					this.frameHandler.RefreshFrameViewer();
					break;
				}

				case 39:
				case 190: {
					// right_arrow, carrot
					this.frameHandler.AdvanceFrames(1);
					this.frameHandler.StopPlayingAnimation();
					break;
				}

				case 37:
				case 188: {
					// left arrow, carrot
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

						if (this.ProjectHasNeccesaryData()) {
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

	private ProjectHasNeccesaryData(): boolean {
		this.outputMessage.innerText = '';
		this.outputMessage.classList.remove('errorMessage');

		let pass: boolean = true;
		let errorString: string = '';
		this.frameHandler.RefreshFrameViewer();
		if (this.filenameInput.value === '') {
			errorString += '- Missing name\n';
			pass = false;
		}
		if (this.animationData.originX === null || this.animationData.originY === null) {
			errorString += '- Missing origin data\n';
			pass = false;
		}
		// check frames for data errors
		let pinDataErrorString: string = '';
		let passPinData: boolean = true;
		for (let f = 0; f < this.animationData.frames.length; f++) {
			const errorOnFrame: boolean = false;
			if (this.animationData.pins !== undefined) {
				for (let p = 0; p < this.animationData.pins.length; p++) {
					if (this.animationData.pins[p] !== undefined) {
						const pinIDtoCheck = this.animationData.pins[p].id;
						// console.log('checking frame ' + f + ' for pinID ' + this.animationData.pins[p].name);
						if (this.animationData.frames[f][pinIDtoCheck] === undefined) {
							if (!errorOnFrame) {
								pinDataErrorString += '  Frame ' + f + ' :\n';
							}
							pinDataErrorString += '      Pin: ' + this.animationData.pins[p].name + '\n';
							passPinData = false;
						}
					}
				}
			}
		}
		if (!passPinData) {
			errorString += '- Missing pin data on some frames: \n' + pinDataErrorString;
			pass = false;
		}
		if (!pass) {
			this.outputMessage.innerText = errorString;
			this.outputMessage.classList.add('errorMessage');
		}
		return pass;
	}

	private CanvasMouseDown = (event: MouseEvent) => {
		if (this.canvasMouseHeld) {
			this.canvasHandler.CanvasMouseDown(event.offsetX, event.offsetY);
			this.pinHandler.UpdatePinBoxStatus();
		}
	};

	private AddPinButtonPressed = () => {
		this.pinHandler.AddNewPin();
		this.pinHandler.pins += 1;
	};

	private handleFileSelect = async (event: DragEvent) => {
		this.ResetProgram();

		event.stopPropagation();
		event.preventDefault();

		const filenames = await FileHandler.ProcessImages(event.dataTransfer!.files);
		this.frameHandler.loadFrames(filenames);

		const newFrames: IFrame[] = [];

		for (let i = 0; i < filenames.length; i++) {
			newFrames.push({
				filename: i.toString()
			});
		}

		this.animationData.frames = newFrames;
		this.frameHandler.GoToFrame(0);
		this.frameHandler.StopPlayingAnimation();
		this.frameHandler.TogglePlayingAnimation();

		const imageElement = new Image();
		imageElement.src = filenames[0];
		imageElement.onload = () => {
			this.canvasHandler.ResizeCanvas(imageElement.width, imageElement.height);
		};

		this.frameHandler.ConstructFrameUI();
	};

	private ResetProgram = () => {
		// defining blank slate animation data
		this.animationData.pins = [];
		this.animationData.originX = null;
		this.animationData.originY = null;
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
	};
}
