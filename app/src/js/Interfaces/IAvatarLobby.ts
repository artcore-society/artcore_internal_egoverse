import Avatar from '../Classes/Avatar.ts';

export interface IAvatarLobby {
    playerAvatar: Avatar | null;
    visitorAvatars: Avatar[] | null;
}