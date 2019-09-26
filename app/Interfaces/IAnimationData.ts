import { IFrame } from './IFrame';
import { IPin } from './IPin';

export interface IAnimationData {
	frameRate: number;
	originX: number;
	originY: number;
	loop: boolean;
	frames: IFrame[];
	pins: IPin[];
}
