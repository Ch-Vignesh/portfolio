export const vertexShader = `
uniform float uTime;
uniform float uScroll;
attribute float aOffset;
varying float vOpacity;

void main() {
  vec3 newPosition = position;
  
  // Undulate rings based on time and their offset (index)
  float wave = sin(uTime * 0.5 + aOffset * 0.5) * 0.5;
  
  // Add scroll distortion
  float distortion = sin(newPosition.x * 0.5 + uScroll * 2.0) * 0.5;
  
  newPosition.z += wave + distortion;
  newPosition.y += cos(uTime * 0.3 + newPosition.x * 0.2) * 0.2;

  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Fade out based on depth/scroll
  vOpacity = 1.0 - (abs(newPosition.z) / 20.0);
  vOpacity = clamp(vOpacity, 0.0, 1.0);
}
`;

export const fragmentShader = `
varying float vOpacity;

void main() {
  // Teal/Cyan color
  vec3 color = vec3(0.0, 0.8, 0.7); 
  
  gl_FragColor = vec4(color, vOpacity * 0.6);
}
`;
