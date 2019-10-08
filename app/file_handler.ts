export class FileHandler {
	public static ProcessImages = (fileList: FileList): Promise<[string[], string[]]> => {
		return new Promise(async (resolve, reject) => {
			const processedFilenames: string[] = [];
			const originalFilenames: string[] = [];

			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i];
				const filename = await FileHandler.ProcessImage(file);

				processedFilenames.push(filename);
				originalFilenames.push(file.name);
			}

			resolve([ processedFilenames, originalFilenames ]);
		});
	};

	private static ProcessImage = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event: ProgressEvent<FileReader>) => {
				resolve(event.target!.result as string);
			};

			reader.onerror = reject;

			// Read in the image file as a data URL.
			reader.readAsDataURL(file);
		});
	};
}
