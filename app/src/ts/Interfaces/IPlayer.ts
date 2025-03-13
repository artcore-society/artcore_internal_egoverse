import ParticleSystem from '../Classes/ParticleSystem.ts';

export interface IPlayer {
	isCurrent: boolean;
	particleSystem: ParticleSystem | null;

	fart(): void;
}
