export class Page {
	public Load() {
		const thing = document.getElementById('thing') as HTMLElement;
		thing.innerHTML = '<p>mememememe</p>';

		thing.onclick = (e) => {
			thing.innerHTML = '<p>blahblahblah</p>';
		};
	}
}
