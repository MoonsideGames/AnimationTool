import { IFrame } from './IFrame';
import { IPinDefinition } from './IPinDefinition';

export interface IAnimationData {
	frameRate: number;
	originX: number | null;
	originY: number | null;
	loop: boolean;
	frames: IFrame[];
	pinDefinitions: IPinDefinition[];
}
