import { IAnimationData } from './Interfaces/IAnimationData';
import { IPinDefinition } from './Interfaces/IPinDefinition';
import { IProjectData } from './Interfaces/IProjectData';

export class PinHandler {
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
		this.originPin.addEventListener('click', () => {
			this.projectData.currentlySelectedPin = -1;
			this.UpdatePinBoxStatus();
		});
		// put origin into pincontainer array
		this.allPinContainers = [];
	}

	public UpdatePinBoxStatus = () => {
		for (let i = 0; i < this.allPinContainers.length; i++) {
			const pinDiv = this.allPinContainers[i];
			pinDiv.classList.remove('selected', 'warning');
			if (this.GetPinNumberFromID(this.allPinContainers[i].id) === this.projectData.currentlySelectedPin) {
				this.allPinContainers[i].classList.add('selected');
			}
			// check frames for missing pin info
			const pinNumber = this.GetPinNumberFromID(pinDiv.id);
			for (let f = 0; f < this.animationData.frames.length; f++) {
				if (this.animationData.frames[f] !== undefined) {
					if (this.animationData.frames[f].pinData[pinNumber] === undefined) {
						pinDiv.classList.add('warning');
						break;
					}
				}
			}
		}
		if (this.animationData.originX === null || this.animationData.originY === null) {
			this.originPin.classList.add('warning');
		}
		if (this.projectData.currentlySelectedPin === -1) {
			this.originPin.classList.add('selected');
		}
	};

	public UpdateAnimationPinDefinitions = () => {
		const animationPinData: IPinDefinition[] = [];
		for (let i = 0; i < this.allPinContainers.length; i++) {
			const pinName: string = this.GetPinNameFromDiv(this.allPinContainers[i]);
			if (pinName !== null && pinName !== undefined) {
				const newPinData: IPinDefinition = {
					id: this.GetPinNumberFromID(this.allPinContainers[i].id),
					name: pinName
				};
				animationPinData.push(newPinData);
			}
		}
		this.animationData.pinDefinitions = animationPinData;
	};

	public RemoveAllPins = () => {
		for (let i = 1; i < this.allPinContainers.length; i++) {
			const pinID: number = this.GetPinNumberFromID(this.allPinContainers[i].id);
			this.RemovePinDataForID(pinID);
			this.allPinContainers[i].remove();
		}
		this.allPinContainers.splice(1, this.allPinContainers.length - 1);
		this.UpdatePinBoxStatus();
		this.UpdateAnimationPinDefinitions();
	};

	public GetAvailablePins = (): number[] => {
		const availablePins: number[] = [];
		for (let i = 1; i < this.allPinContainers.length; i++) {
			const pinID: number = this.GetPinNumberFromID(this.allPinContainers[i].id);
			availablePins.push(pinID);
		}
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

		let newPinIDString = this.animationData.pinDefinitions.length.toString();

		this.pinContainer.appendChild(newDiv);
		newDiv.id = 'pinID_' + newPinIDString;
		newDiv.className = 'pinButtonContainer';
		// text input field for pin name
		const newNameInput = document.createElement('input');
		newNameInput.id = 'nameInput_' + newPinIDString;
		newDiv.addEventListener('click', () => {
			this.SelectPin(newDiv);
		});
		newDiv.appendChild(newNameInput);
		newNameInput.value = 'PinName_' + newPinIDString;
		newNameInput.addEventListener('focusout', () => {
			this.UpdateAnimationPinDefinitions();
		});
		// button to remove pin
		const removePinButton = document.createElement('div');
		newDiv.appendChild(removePinButton);
		removePinButton.textContent = 'X';
		removePinButton.className = 'removeButton';
		removePinButton.addEventListener('click', (event: MouseEvent) => {
			event.stopPropagation();
			// get ID number for this div
			const idNumber = this.GetPinNumberFromID(newDiv.id);
			let indexToDelete: number = 0;
			// that id from allPinContainers
			for (let i = 0; i < this.allPinContainers.length; i++) {
				if (this.GetPinNumberFromID(this.allPinContainers[i].id) === idNumber) {
					indexToDelete = i;
				}
			}
			if (indexToDelete !== -1) {
				this.allPinContainers.splice(indexToDelete, 1);
			}
			// remove data associated with that id from all frames
			this.RemovePinDataForID(idNumber);
			// remove the div itself
			newDiv.remove();
			//this.UpdateAnimationPinDefinitions();

			//reset to origin
			this.SelectOriginPin();
		});
		// break

		this.UpdateAnimationPinDefinitions();
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
		this.UpdatePinBoxStatus();
		this.UpdateAnimationPinDefinitions();
	};

	private SelectOriginPin = () => {
		this.projectData.currentlySelectedPin = -1;
		this.UpdatePinBoxStatus();
	};

	private RemovePinDataForID = (pinID: number) => {
		// check for matching id in pin list and remove

		let indexToDelete = -1;

		let deleted: boolean = false;
		for (let i = 0; i < this.animationData.pinDefinitions.length; i++) {
			if (this.animationData.pinDefinitions[i].id === pinID) {
				indexToDelete = i;
			}
			deleted = true;
		}

		if (indexToDelete == -1) {
			return;
		}

		let removedPinDefinition = this.animationData.pinDefinitions[indexToDelete];
		this.animationData.pinDefinitions.splice(indexToDelete, 1);
		for (let i = this.animationData.pinDefinitions.length - 1; i >= 0; i--) {
			let pinDefinition = this.animationData.pinDefinitions[i];
			if (pinDefinition.id > removedPinDefinition.id) {
				let div = document.getElementById('pinID_' + pinDefinition.id);
				div!.id = 'pinID_' + (pinDefinition.id - 1);
				pinDefinition.id -= 1;
			}
		}

		if (!deleted) {
			// console.log('failed to find pinID ' + pinID + ' in list of pins');
		}

		// delete pin data from each frame
		for (let f = 0; f < this.animationData.frames.length; f++) {
			if (this.animationData.frames[f].pinData[pinID] !== undefined) {
				//delete this.animationData.frames[f].pinData[pinID];
				this.animationData.frames[f].pinData.splice(pinID, 1);
				// console.log('deleting pinID ' + pinID + ' data from frame ' + f);
			} else {
				// console.log('tried to delete pinID ' + pinID + ' data from frame ' + f + ' but it doesnt exist');
			}
		}
	};
}
