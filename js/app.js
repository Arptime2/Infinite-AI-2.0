document.addEventListener('DOMContentLoaded', () => {
    const createNodeBtn = document.getElementById('create-node-btn');
    const particleArea = document.getElementById('particle-area');
    const sidePanel = document.getElementById('side-panel');
    let particleCount = 0;

    const createParticle = () => {
        particleCount++;
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = particleCount;
        particle.style.left = Math.random() * (particleArea.offsetWidth - 50) + 'px';
        particle.style.top = Math.random() * (particleArea.offsetHeight - 50) + 'px';

        particle.addEventListener('click', () => {
            sidePanel.classList.add('active');
        });

        particleArea.appendChild(particle);
    };

    createNodeBtn.addEventListener('click', createParticle);

    // Close side panel when clicking outside
    particleArea.addEventListener('click', (e) => {
        if (!e.target.classList.contains('particle')) {
            sidePanel.classList.remove('active');
        }
    });
});