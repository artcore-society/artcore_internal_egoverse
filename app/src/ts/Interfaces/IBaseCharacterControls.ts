import { KeyboardKey } from '../Enums/KeyboardKey.ts';

export interface IBaseCharacterControls {
	keysPressed: { [key in KeyboardKey]: boolean };
}
