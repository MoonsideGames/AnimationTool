export class FileHandler {
	public static ProcessImages = (fileList: FileList): Promise<string[]> => {
		return new Promise(async (resolve, reject) => {
			const filenames: string[] = [];

			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i];
				const filename = await FileHandler.ProcessImage(file);

				filenames.push(filename);
			}

			resolve(filenames);
		});
	};

	private static ProcessImage = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event: any) => {
				resolve(event.target!.result);
			};

			reader.onerror = reject;

			// Read in the image file as a data URL.
			reader.readAsDataURL(file);
		});
	};
}
