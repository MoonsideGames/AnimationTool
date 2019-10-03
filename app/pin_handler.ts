import { IProjectData } from './Interfaces/IProjectData';
import { IPin } from './Interfaces/IPin';
import { IAnimationData } from './Interfaces/IAnimationData';

export class PinHandler {
	private addPinButton: HTMLElement;
	private pinSettingsDiv: HTMLElement;
	private pins: number = 1;
	private pinContainer: HTMLElement;
	private allPinContainers: HTMLElement[];
	private projectData: IProjectData;
	private animationData: IAnimationData;

	constructor(
		addPinButton: HTMLElement,
		pinSettingsDiv: HTMLElement,
		pinContainer: HTMLElement,
		originPin: HTMLElement,
		projectData: IProjectData,
		animationData: IAnimationData
	) {
		this.addPinButton = addPinButton;
		this.pinSettingsDiv = pinSettingsDiv;
		this.pinContainer = pinContainer;
		this.projectData = projectData;
		this.animationData = animationData;

		// add origin click behaviour
		originPin.addEventListener('click', () => {
			this.DeselectAllPinContainers();
			originPin.className = 'pinButtonContainerSelected';
			projectData.currentlySelectedPin = 0;
		});
		// put origin into pincontainer array
		this.allPinContainers = [ originPin ];

		// this.UpdatePinSettingsDiv();
		this.addPinButton.addEventListener('click', this.AddPinButtonPressed);
	}

	public UpdateAnimationPinNames = () => {
		const animationPinData: IPin[] = [];
		for (let i = 1; i < this.allPinContainers.length; i++) {
			console.log(this.allPinContainers[i].children);
			let pinName: string = this.allPinContainers[i].getElementsByTagName('input')[0].value;
			if (pinName !== null && pinName !== undefined) {
				let newPinData: IPin = {
					id: parseInt(this.allPinContainers[i].id.split('_')[1]),
					name: pinName
				};
				animationPinData.push(newPinData);
			}
		}
		this.animationData.pins = animationPinData;
		console.log('updated animationPinData to ' + animationPinData);
	};

	public RemoveAllPins = () => {
		for (let i = 1; i < this.allPinContainers.length; i++) {
			const pinID: number = parseInt(this.allPinContainers[i].id.split('_')[1]);
			this.RemovePinDataForID(pinID);
			this.allPinContainers[i].remove();
		}
		this.ResetPinSelection();
	};

	private ResetPinSelection = () => {
		this.DeselectAllPinContainers();
		this.allPinContainers[0].className = 'pinButtonContainerSelected';
	};

	private UpdatePinSettingsDiv = () => {
		// create info window div and append to pincontainer
		const newDiv = document.createElement('div');
		this.allPinContainers.push(newDiv);

		this.pinContainer.appendChild(newDiv);
		newDiv.id = 'pinID_' + this.pins.toString();
		newDiv.className = 'pinButtonContainer';
		// text input field for pin name
		const newNameInput = document.createElement('input');
		newNameInput.id = 'nameInput_' + this.pins.toString();
		newDiv.appendChild(newNameInput);
		newNameInput.value = 'PinName_' + this.pins.toString();
		// button to remove pin
		const removePinButton = document.createElement('button');
		newDiv.appendChild(removePinButton);
		removePinButton.textContent = 'X';
		removePinButton.className = 'removeButton';
		removePinButton.addEventListener('click', () => {
			// get ID number for this div
			const idNumber = parseInt(newDiv.id.split('_')[1]);
			let indexToDelete: number = 0;
			// that id from allPinContainers
			for (let i = 0; i < this.allPinContainers.length; i++) {
				if (parseInt(this.allPinContainers[i].id.split('_')[1]) === idNumber) {
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
		});
		// break
		newDiv.appendChild(document.createElement('br'));
		// select pin to place
		const selectPinButton = document.createElement('button');
		newDiv.appendChild(selectPinButton);
		selectPinButton.textContent = 'Select';
		selectPinButton.addEventListener('click', () => {
			this.DeselectAllPinContainers();
			newDiv.className = 'pinButtonContainerSelected';
			this.projectData.currentlySelectedPin = parseInt(newDiv.id.split('_')[1]);
			console.log('selected pin ' + this.projectData.currentlySelectedPin);
		});
	};

	private RemovePinDataForID = (pinID: number) => {
		// check for matching id in pin list and remove

		let deleted: boolean = false;
		for (let i = 0; i < this.animationData.pins.length; i++) {
			console.log('checking if ' + this.animationData.pins[i].id.toString + ' === ' + pinID.toString());
			if (this.animationData.pins[i].id === pinID) {
				delete this.animationData.pins[i];
			}
			console.log('deleting pinID ' + pinID);
			deleted = true;
		}

		if (!deleted) {
			console.log('failed to find pinID ' + pinID + ' in list of pins');
		}

		// delete pin data from each frame
		for (let f = 0; f < this.animationData.frames.length; f++) {
			if (this.animationData.frames[f][pinID] !== undefined) {
				delete this.animationData.frames[f][pinID];
				console.log('deleting pinID ' + pinID + ' data from frame ' + f);
			} else {
				console.log('tried to delete pinID ' + pinID + ' data from frame ' + f + ' but it doesnt exist');
			}
		}
	};

	private DeselectAllPinContainers = () => {
		for (let i = 0; i < this.allPinContainers.length; i++) {
			this.allPinContainers[i].className = 'pinButtonContainer';
		}
	};

	private AddPinButtonPressed = () => {
		this.UpdatePinSettingsDiv();
		this.pins += 1;
	};
}
