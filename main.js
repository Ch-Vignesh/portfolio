import './style.css'
import { initScene } from './src/scene.js'
import { initAnimations } from './src/animations.js'

// Initialize the 3D scene
const sceneManager = initScene();

// Initialize animations
initAnimations(sceneManager);
