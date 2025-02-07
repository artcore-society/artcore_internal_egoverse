import type { Ref } from 'vue';
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Scene, PerspectiveCamera, WebGLRenderer, AnimationMixer, TextureLoader, Clock } from 'three';

export default interface IThreeManager {
    scene: Scene | null;
    camera: PerspectiveCamera | null;
    renderer: WebGLRenderer | null;
    canvas: HTMLCanvasElement | null;
    controls: OrbitControls | null;
    renderAction: ((delta: number) => void) | null;
    animationMixers: AnimationMixer[];
    isSceneReady: Ref;
    textureLoader: TextureLoader;
    clock: Clock;
    gltfLoader: GLTFLoader;
    dracoLoader: DRACOLoader;
    initThree(canvasId: string): void;
    setupCamera(): void;
    setupPostProcessing(): void;
    setupControls(): void;
    setupDebugging(): void;
    setSceneSize(): void;
    handleSceneLoading(): void;
    animate(): void;
    setRenderAction(callback: () => void): void;
    render(): void;
    destroy(): void;
    resize(): void;
}