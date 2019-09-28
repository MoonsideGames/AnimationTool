export class PinHandler {
	private addPinButton: HTMLElement;
	private pinSettingsDiv: HTMLElement;
	private pins: number = 1;

	constructor(addPinButton: HTMLElement, pinSettingsDiv: HTMLElement) {
		this.addPinButton = addPinButton;
		this.pinSettingsDiv = pinSettingsDiv;
		this.UpdatePinSettingsDiv();

		this.addPinButton.addEventListener('click', this.AddPinButtonPressed);
	}

	private UpdatePinSettingsDiv() {
		let html: string = '';
		for (let i = 0; i < this.pins; i++) {
			html += '<input type="text" id="pinname' + i + '" value="pinname' + i + '">';
		}
		this.pinSettingsDiv.innerHTML = html;
	}

	private AddPinButtonPressed() {
		this.pins += 1;
		this.UpdatePinSettingsDiv();
	}
}
