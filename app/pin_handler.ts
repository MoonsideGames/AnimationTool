import { IAnimationData } from './Interfaces/IAnimationData';
import { IPin } from './Interfaces/IPin';
import { IProjectData } from './Interfaces/IProjectData';

export class PinHandler {
	public pins: number = 1;
	private pinSettingsDiv: HTMLElement;
	private pinContainer: HTMLElement;
	private allPinContainers: HTMLElement[];
	private projectData: IProjectData;
	private animationData: IAnimationData;
	private originPin: HTMLElement;

	constructor(
		pinSettingsDiv: HTMLElement,
		pinContainer: HTMLElement,
		originPin: HTMLElement,
		projectData: IProjectData,
		animationData: IAnimationData
	) {
		this.pinSettingsDiv = pinSettingsDiv;
		this.pinContainer = pinContainer;
		this.projectData = projectData;
		this.animationData = animationData;

		this.originPin = originPin;
		this.originPin.classList.add('pinButtonContainer');
		// add origin click behaviour
		this.originPin.id = 'pinID_0';
		this.originPin.addEventListener('click', () => {
			this.projectData.currentlySelectedPin = 0;
			this.UpdatePinBoxStatus();
		});
		// put origin into pincontainer array
		this.allPinContainers = [ originPin ];
	}

	public UpdatePinBoxStatus = () => {
		for (let i = 0; i < this.allPinContainers.length; i++) {
			const pinDiv = this.allPinContainers[i];
			pinDiv.classList.remove('selected', 'warning');
			if (i > 0) {
				if (this.GetPinNumberFromID(this.allPinContainers[i].id) === this.projectData.currentlySelectedPin) {
					this.allPinContainers[i].classList.add('selected');
				}
				// check frames for missing pin info
				const pinNumber = this.GetPinNumberFromID(pinDiv.id);
				for (let f = 0; f < this.animationData.frames.length; f++) {
					if (this.animationData.frames[f] !== undefined) {
						if (this.animationData.frames[f][pinNumber] === undefined) {
							pinDiv.classList.add('warning');
							// console.log('added warning');
							break;
						}
					}
				}
			}
		}
		if (this.animationData.originX === null || this.animationData.originY === null) {
			this.originPin.classList.add('warning');
		}
		if (this.projectData.currentlySelectedPin === 0) {
			this.originPin.classList.add('selected');
		}
	};

	public UpdateAnimationPinNames = () => {
		const animationPinData: IPin[] = [];
		for (let i = 1; i < this.allPinContainers.length; i++) {
			const pinName: string = this.GetPinNameFromDiv(this.allPinContainers[i]);
			// console.log('new pin name = ' + pinName);
			if (pinName !== null && pinName !== undefined) {
				const newPinData: IPin = {
					id: this.GetPinNumberFromID(this.allPinContainers[i].id),
					name: pinName
				};
				animationPinData.push(newPinData);
			}
		}
		this.animationData.pins = animationPinData;
		// console.log('updated animationPinData to ' + animationPinData);
	};

	public RemoveAllPins = () => {
		for (let i = 1; i < this.allPinContainers.length; i++) {
			const pinID: number = this.GetPinNumberFromID(this.allPinContainers[i].id);
			this.RemovePinDataForID(pinID);
			this.allPinContainers[i].remove();
		}
		this.allPinContainers.splice(1, this.allPinContainers.length - 1);
		this.UpdatePinBoxStatus();
		this.UpdateAnimationPinNames();
	};

	public GetAvailablePins = (): number[] => {
		const availablePins: number[] = [];
		for (let i = 1; i < this.allPinContainers.length; i++) {
			const pinID: number = this.GetPinNumberFromID(this.allPinContainers[i].id);
			availablePins.push(pinID);
		}
		// console.log('available pins are: ' + availablePins);
		return availablePins;
	};

	public GetPinName = (pinID: number): string => {
		for (let p = 0; p < this.allPinContainers.length; p++) {
			const pinContainer = this.allPinContainers[p];
			if (this.GetPinNumberFromID(pinContainer.id) === pinID) {
				const pinName: string = this.GetPinNameFromDiv(pinContainer);
				return pinName;
			}
		}
		return 'failed_to_return_pin_name_for_pin_' + pinID.toString();
	};

	public AddNewPin = () => {
		// create info window div and append to pincontainer
		const newDiv = document.createElement('div');
		this.allPinContainers.push(newDiv);

		this.pinContainer.appendChild(newDiv);
		newDiv.id = 'pinID_' + this.pins.toString();
		newDiv.className = 'pinButtonContainer';
		// text input field for pin name
		const newNameInput = document.createElement('input');
		newNameInput.id = 'nameInput_' + this.pins.toString();
		newDiv.addEventListener('click', () => {
			this.SelectPin(newDiv);
		});
		newDiv.appendChild(newNameInput);
		newNameInput.value = 'PinName_' + this.pins.toString();
		newNameInput.addEventListener('focusout', () => {
			this.UpdateAnimationPinNames();
		});
		// button to remove pin
		const removePinButton = document.createElement('button');
		newDiv.appendChild(removePinButton);
		removePinButton.textContent = 'X';
		removePinButton.className = 'removeButton';
		removePinButton.addEventListener('click', () => {
			// get ID number for this div
			const idNumber = this.GetPinNumberFromID(newDiv.id);
			let indexToDelete: number = 0;
			// that id from allPinContainers
			for (let i = 0; i < this.allPinContainers.length; i++) {
				if (this.GetPinNumberFromID(this.allPinContainers[i].id) === idNumber) {
					indexToDelete = i;
				}
			}
			if (indexToDelete !== 0) {
				this.allPinContainers.splice(indexToDelete, 1);
			}
			// remove data associated with that id from all frames
			this.RemovePinDataForID(idNumber);
			// remove the div itself
			newDiv.remove();
			this.UpdateAnimationPinNames();
		});
		// break
		newDiv.appendChild(document.createElement('br'));

		this.UpdateAnimationPinNames();
		this.UpdatePinBoxStatus();
	};

	private GetPinNameFromDiv = (pinElement: HTMLElement): string => {
		return pinElement.getElementsByTagName('input')[0].value;
	};

	private GetPinNumberFromID = (id: string): number => {
		return parseInt(id.split('_')[1], 10);
	};

	private SelectPin = (pinDiv: HTMLElement) => {
		this.projectData.currentlySelectedPin = this.GetPinNumberFromID(pinDiv.id);
		// console.log('selected pin ' + this.projectData.currentlySelectedPin);
		this.UpdatePinBoxStatus();
		this.UpdateAnimationPinNames();
	};

	private RemovePinDataForID = (pinID: number) => {
		// check for matching id in pin list and remove

		let deleted: boolean = false;
		for (let i = 0; i < this.animationData.pins.length; i++) {
			// console.log('checking if ' + this.animationData.pins[i].id.toString + ' === ' + pinID.toString());
			if (this.animationData.pins[i].id === pinID) {
				delete this.animationData.pins[i];
			}
			// console.log('deleting pinID ' + pinID);
			deleted = true;
		}

		if (!deleted) {
			// console.log('failed to find pinID ' + pinID + ' in list of pins');
		}

		// delete pin data from each frame
		for (let f = 0; f < this.animationData.frames.length; f++) {
			if (this.animationData.frames[f][pinID] !== undefined) {
				delete this.animationData.frames[f][pinID];
				// console.log('deleting pinID ' + pinID + ' data from frame ' + f);
			} else {
				// console.log('tried to delete pinID ' + pinID + ' data from frame ' + f + ' but it doesnt exist');
			}
		}
	};
}
