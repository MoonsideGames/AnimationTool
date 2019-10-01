import { IFramePinData } from './IFramePinData';

export interface IFrame {
	filename: string;
	[index: number]: IFramePinData;
}
