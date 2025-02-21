import { KeyboardKey } from '../Enums/KeyboardKey.ts';

export interface IAvatarControls {
    keysPressed: { [key in KeyboardKey]: boolean }
}