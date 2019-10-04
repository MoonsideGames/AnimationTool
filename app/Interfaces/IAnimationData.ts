import { IFrame } from './IFrame';
import { IPin } from './IPin';

export interface IAnimationData {
	frameRate: number;
	originX: number | null;
	originY: number | null;
	loop: boolean;
	frames: IFrame[];
	pins: IPin[];
}
