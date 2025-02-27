import { KeyboardKey } from '../Enums/KeyboardKey.ts';
import { AnimationName } from '../Enums/AnimationName.ts';

export interface IAvatarControls {
	keysPressed: { [key in KeyboardKey]: boolean };
	emoteAnimationName: AnimationName | null;
}
