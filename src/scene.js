<script type="module">
    import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
    import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";
</script>

export function initScene() {
    const canvas = document.querySelector('#bg-canvas');
    const scene = new THREE.Scene();

    // White background
    scene.background = new THREE.Color(0xffffff);
    // Light fog
    scene.fog = new THREE.FogExp2(0xffffff, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Concentric Rings System
    const ringsGroup = new THREE.Group();
    const ringsCount = 120; // Increased from 60 for "more"

    // Create geometry for one ring (circle)
    const baseGeometry = new THREE.BufferGeometry();
    const segments = 128;
    const positions = [];
    const offsets = []; // For animation phase

    // We'll create a single merged geometry for better performance if possible, 
    // but separate lines allow easier radius manipulation. 
    // Let's use a single buffer geometry with "LineSegments" or just many Line objects.
    // For the shader to work on all of them, let's try instanced mesh? 
    // No, LineSegments is easier for "rings".

    // Actually, let's create individual Line objects to keep it simple for now, 
    // or one big LineSegments geometry.

    for (let i = 0; i < ringsCount; i++) {
        const radius = 0.5 + i * 0.2; // Tighter spacing
        const z = 0;

        // Create a circle path
        const curve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            radius, radius,  // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,           // aClockwise
            0                // aRotation
        );

        const points = curve.getPoints(segments);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Add attribute for animation offset
        const offsetArray = new Float32Array(segments + 1).fill(i);
        geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsetArray, 1));

        // Material
        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uScroll: { value: 0 }
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const ring = new THREE.Line(geometry, material);
        ring.rotation.x = Math.PI / 2; // Lay flat
        ringsGroup.add(ring);
    }

    scene.add(ringsGroup);

    // Store material reference for updates
    // Since we created multiple materials (one per ring, though they could share), 
    // we need to update all or share one. Sharing is better.
    const sharedMaterial = ringsGroup.children[0].material;
    ringsGroup.children.forEach(c => c.material = sharedMaterial);


    // 3D Robot Companion
    function createRobot() {
        const robotGroup = new THREE.Group();

        // Materials
        const orangeMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.4, metalness: 0.1 });
        const greyMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.5 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });

        // Head (Rounded Box look via scaling a sphere or just a box)
        // Let's use a BoxGeometry
        const headGeo = new THREE.BoxGeometry(1.2, 1, 1);
        const head = new THREE.Mesh(headGeo, orangeMat);
        head.position.y = 0.8;
        robotGroup.add(head);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.3, 32, 32);
        const leftEye = new THREE.Mesh(eyeGeo, blackMat);
        leftEye.position.set(-0.35, 0.8, 0.45);
        robotGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, blackMat);
        rightEye.position.set(0.35, 0.8, 0.45);
        robotGroup.add(rightEye);

        // Antenna
        const antStemGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        const antStem = new THREE.Mesh(antStemGeo, greyMat);
        antStem.position.set(0, 1.4, 0);
        robotGroup.add(antStem);

        const antBulbGeo = new THREE.SphereGeometry(0.15);
        const antBulb = new THREE.Mesh(antBulbGeo, orangeMat);
        antBulb.position.set(0, 1.65, 0);
        robotGroup.add(antBulb);

        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.6, 0.8, 1.2, 8);
        const body = new THREE.Mesh(bodyGeo, orangeMat);
        body.position.y = -0.4;
        robotGroup.add(body);

        // Neck
        const neckGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3);
        const neck = new THREE.Mesh(neckGeo, greyMat);
        neck.position.y = 0.25;
        robotGroup.add(neck);

        // Arms (Floating)
        const armGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const leftArm = new THREE.Mesh(armGeo, orangeMat);
        leftArm.position.set(-0.9, -0.2, 0);
        robotGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, orangeMat);
        rightArm.position.set(0.9, -0.2, 0);
        robotGroup.add(rightArm);

        // Hands (Claws)
        const handGeo = new THREE.BoxGeometry(0.2, 0.3, 0.2);
        const leftHand = new THREE.Mesh(handGeo, greyMat);
        leftHand.position.set(0, -0.5, 0);
        leftArm.add(leftHand);

        const rightHand = new THREE.Mesh(handGeo, greyMat);
        rightHand.position.set(0, -0.5, 0);
        rightArm.add(rightHand);

        // Add a light to the robot so it looks good
        const light = new THREE.PointLight(0xffaa00, 1, 5);
        light.position.set(0, 0, 1);
        robotGroup.add(light);

        return { mesh: robotGroup, leftArm, rightArm, head };
    }

    const robot = createRobot();
    robot.mesh.scale.set(0.5, 0.5, 0.5); // Scale down
    scene.add(robot.mesh);

    // Robot Animation State
    const robotState = {
        target: new THREE.Vector3(3, 2, 0),
        velocity: new THREE.Vector3(),
        speed: 0.02
    };

    function updateRobot(time) {
        // 1. Roaming Logic
        const dist = robot.mesh.position.distanceTo(robotState.target);
        if (dist < 0.5) {
            // Pick new random target
            robotState.target.set(
                (Math.random() - 0.5) * 10, // X: -5 to 5
                (Math.random() - 0.5) * 6,  // Y: -3 to 3
                (Math.random() - 0.5) * 2   // Z: -1 to 1
            );
        }

        // Move towards target
        const direction = new THREE.Vector3().subVectors(robotState.target, robot.mesh.position).normalize();
        robot.mesh.position.add(direction.multiplyScalar(robotState.speed));

        // 2. Floating (Sine wave on Y)
        robot.mesh.position.y += Math.sin(time * 2) * 0.005;

        // 3. Rotation (Look at target smoothly)
        const targetQuaternion = new THREE.Quaternion();
        const lookMatrix = new THREE.Matrix4();
        const eyePos = new THREE.Vector3().copy(robot.mesh.position).add(direction);
        lookMatrix.lookAt(robot.mesh.position, eyePos, robot.mesh.up);
        targetQuaternion.setFromRotationMatrix(lookMatrix);
        robot.mesh.quaternion.slerp(targetQuaternion, 0.05);

        // 4. Limb Animation (Idle)
        robot.leftArm.rotation.x = Math.sin(time * 3) * 0.2;
        robot.rightArm.rotation.x = Math.cos(time * 3) * 0.2;
        robot.head.rotation.y = Math.sin(time * 1.5) * 0.1;
    }

    // Add ambient light for the robot
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Add directional light for shadows/depth
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);


    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
    });

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Update uniforms
        sharedMaterial.uniforms.uTime.value = elapsedTime;

        // Rotate the whole group slowly
        ringsGroup.rotation.z = elapsedTime * 0.05;
        ringsGroup.rotation.y = mouseX * 0.2;
        ringsGroup.rotation.x = mouseY * 0.2;

        // Update Robot
        updateRobot(elapsedTime);

        // Camera float
        camera.position.x += (mouseX * 1 - camera.position.x) * 0.05;
        camera.position.y += (2 + -mouseY * 1 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();

    return { scene, camera, ringsGroup, particlesMaterial: sharedMaterial };
}
