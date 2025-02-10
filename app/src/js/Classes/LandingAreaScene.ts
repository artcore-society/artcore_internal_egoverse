import { AmbientLight, DirectionalLight, HemisphereLight, OrthographicCamera } from 'three';
import ExperienceScene from './ExperienceScene';
import Avatar from './Avatar.ts';
import { AvatarType } from '../Enums/AvatarType.ts';

export class LandingAreaScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.init();
	}

	init() {
		// Setup landing area lighting
		this.setupLighting();

		// Set current player
		this.currentPlayer = new Avatar(this.scene, this.camera, AvatarType.CURRENT_PLAYER);

		// Set render action
		this.setUpdateAction((delta) => {
			if(this.currentPlayer) {
				// Update avatar
				this.currentPlayer.update(delta);
			}
		});
	}

	setupLighting() {
		// Add ambient light
		const ambientLight = new AmbientLight(0xffffff, 5);
		this.scene.add(ambientLight);

		// Add hemisphere light
		const hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.5);
		hemiLight.position.set(0, 20, 0);
		this.scene.add(hemiLight);

		// Add directional light
		const dirLight = new DirectionalLight(0xffffff, 10);
		dirLight.position.set(-3, 10, -10);
		dirLight.castShadow = true;
		dirLight.shadow.camera = new OrthographicCamera(-10, 10, 10, -10, 1, 1000);
		dirLight.shadow.mapSize.set(4096, 4096);
		this.scene.add(dirLight);
	}
}