export class FileHandler {
	public static ProcessImages(fileList: FileList): string[] {
		const filenames: string[] = [];

		// files is a FileList of File objects. List some properties.
		for (let i = 0; i < fileList.length; i++) {
			const f = fileList[i];
			const reader = new FileReader();

			reader.onload = ((theFile) => {
				return (e: any) => {
					filenames.push(e.target.result);
				};
			})(f);

			// Read in the image file as a data URL.
			reader.readAsDataURL(f);
		}

		return filenames;
	}
}
