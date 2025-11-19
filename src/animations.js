import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations(sceneManager) {
    const { camera, particlesMesh } = sceneManager;

    // Animate sections on scroll
    const sections = document.querySelectorAll('.content-section');

    sections.forEach((section) => {
        gsap.fromTo(section.children,
            {
                y: 50,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1
                }
            }
        );
    });

    // Camera movement based on scroll
    // We'll move the camera along the Z axis to fly through particles
    ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
            // Move camera forward as we scroll down
            const progress = self.progress;
            camera.position.z = 8 - (progress * 6); // Move closer
            camera.rotation.z = progress * 0.2;

            // Update shader uniform for wave intensity/speed
            if (sceneManager.particlesMaterial) {
                sceneManager.particlesMaterial.uniforms.uScroll.value = progress * 5.0;
            }

            // Also rotate particles container slightly
            if (particlesMesh) {
                particlesMesh.rotation.y = progress * Math.PI * 0.5;
            }
        }
    });

    // Animate Stickers
    gsap.utils.toArray('.sticker-container span').forEach(sticker => {
        gsap.to(sticker, {
            rotation: 360,
            scale: 1.2,
            scrollTrigger: {
                trigger: sticker,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    });
}
