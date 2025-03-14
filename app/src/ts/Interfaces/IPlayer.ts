import ParticleSystem from '../Classes/ParticleSystem.ts';

export interface IPlayer {
	socketId: string;
	isCurrent: boolean;
	particleSystem: ParticleSystem | null;

	fart(): void;
}
