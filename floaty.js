/**
 * Floaty Hearts is a demo of floaty hearts for floaty goodness.
 * 
 * @author Mark McIntyre
 */

/**
 * Particle is a floaty heart with properties such as position, rotation, speed
 * and other attributes needed for a particle system.
 */
class Particle {

    // Our random emojis
    static chars = ['👍', '😍', '❤️', '🥰', '🤩'];

    constructor() {
        this.position = {
            x: 0,
            y: 0,
            z: 0
        };
        this.reinitialize();
    }
    get progress() {
        return this.ttl / this.maxTtl;
    }
    reinitialize() {
        this.position.x = Math.floor(Math.random() * 100) - 50;
        this.position.y = 0;
        this.position.z = 0;
        this.char = Particle.chars[Math.floor(Math.random() * Particle.chars.length)];
        this.speed = Math.random() * .5 + .75;
        this.maxTtl = 360 * Math.random(); // 0 to 3 seconds
        this.ttl = 0;
        this.rotation = Math.random() * (Math.PI / 4) * (Math.random() > .5 ? -1 : 1);
    }
}

/**
 * SpiralParticleGenerator creates and renders Particle instances in a helical
 * pattern, and regenerates them to rise from the bottom of a provided canvas.
 */
class SpiralParticleGenerator {

    /**
     * Constructs a new SpiralParticleGenerator that works on a provided canvas.
     * 
     * @param {int} count - A number of particles to be generated
     * @param {*} context - A 2D context onto which to draw our particles.
     */
    constructor(count, context) {
        this.context = context;
        this.#initializeContext();
        this.particles = [];
        for (let c = 0; c < count; c += 1) {
            this.particles.push(new Particle());
        }
    }
    #initializeContext() {
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
    }
    #projectPoint(particle) {
        return {
            x: particle.position.x,
            y: particle.position.y - (particle.position.z / 2)
        };
    }

    /**
     * Updates the positions of this SpiralParticleGenerator's particles
     * for a single timestep.
     */
    update() {

        const canvasWidth = this.context.canvas.width;
        const canvasHeight = this.context.canvas.height;
        const helixRadius = canvasWidth / 10;

        this.particles.forEach(particle => {
            particle.position.y -= particle.speed * (canvasHeight / 300);
            particle.position.x = Math.cos(Math.PI * 2 * (particle.position.y / canvasHeight) * particle.rotation*3) * helixRadius;
            particle.position.z = Math.sin(Math.PI * 2 * (particle.position.y / canvasHeight) * particle.rotation*3) * helixRadius;
            particle.ttl += 1;
            if (particle.progress > 1) {
                particle.reinitialize();
            }
        });

        // Sort by depth
        this.particles.sort((particle1, particle2) => {
            return particle1.position.z - particle2.position.z;
        })
    }

    /**
     * Renders this SpiralParticleGenerator's particles to its associated
     * 2d canvas intance.
     */
    render() {

        const canvasWidth = this.context.canvas.width;
        const canvasHeight = this.context.canvas.height;

        // Calculate the size of our particle
        const fullParticleSize = (canvasWidth / 15) * window.devicePixelRatio;

        // This is where the particles are generated from
        const origin = {
            x: canvasWidth - fullParticleSize,
            y: canvasHeight + fullParticleSize
        }

        // Clear the canvas
        this.context.clearRect(0, 0, canvasWidth, canvasHeight);

        // Loop through our particles and render them to the canvas.
        this.particles.forEach(particle => {
            const particleSize = fullParticleSize * ((particle.position.z/(canvasHeight/2))+.5);
            const position = this.#projectPoint(particle);
            this.context.save();
            this.context.translate(origin.x + position.x - (particleSize / 2), origin.y + position.y + particleSize / 2);
            this.context.rotate(particle.progress * particle.rotation);
            this.context.font = `${particleSize}px sans-serif`; 
            this.context.globalAlpha = particle.progress > .75 ? (1-particle.progress)*4 : 1;
            this.context.fillText(particle.char, 0, 0);
            this.context.restore();
        });
    }
}

 (() => {

    const canvas = document.getElementById('floaty')?.querySelector('canvas');
    const context = canvas?.getContext('2d');

    if (context) {
        const particles = new SpiralParticleGenerator(5, context);
        function setSize() {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        }
        function render() {
            particles.update();
            particles.render();
            window.requestAnimationFrame(render);
        }
        window.addEventListener('load', setSize);
        window.addEventListener('resize', setSize);
        window.requestAnimationFrame(render);
    }
    
})();