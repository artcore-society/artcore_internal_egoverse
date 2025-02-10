import Avatar from '../Classes/Avatar.ts';

export interface IAvatarLobby {
    currentPlayer: Avatar | null;
    visitors: Avatar[] | null;
}