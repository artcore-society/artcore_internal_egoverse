import { KeyboardKey } from '../Enums/KeyboardKey.ts';
import { AnimationName } from '../Enums/AnimationName.ts';

export interface IPlayerControls {
	keysPressed: { [key in KeyboardKey]: boolean };
	emoteAnimationName: AnimationName | null;
}
