document.addEventListener('DOMContentLoaded', () => {
    const createNodeBtn = document.getElementById('create-node-btn');
    const particleArea = document.getElementById('particle-area');
    const sidePanel = document.getElementById('side-panel');
    const leftPanel = document.getElementById('left-panel');
    const nodeChances = document.getElementById('node-chances');
    const letterChances = document.getElementById('letter-chances');
    const connectionCanvas = document.getElementById('connection-canvas');
    const canvasCtx = connectionCanvas.getContext('2d');
    let particleCount = 0;
    const nodes = [];

    const deleteNode = (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            // Recursively delete children first
            node.children.forEach(childId => deleteNode(childId));
            node.children = [];
        }
        // Remove from nodes array
        const index = nodes.findIndex(n => n.id === nodeId);
        if (index !== -1) {
            nodes.splice(index, 1);
        }
        // Remove particle from DOM
        const particle = particleArea.querySelector(`.particle[data-id="${nodeId}"]`);
        if (particle) particle.remove();
        // Update nodeChances for remaining nodes
        nodes.forEach(n => {
            delete n.nodeChances[`Node ${nodeId}`];
        });
        // If current selected, deselect
        if (currentSelectedNode === nodeId) {
            currentSelectedNode = null;
            sidePanel.classList.remove('active');
            leftPanel.classList.remove('active');
            particleArea.style.transform = 'scale(1) translateX(0px)';
            updateCanvasSize();
        }
        // If another node is selected, update its node chances display
        if (currentSelectedNode && nodes.find(n => n.id === currentSelectedNode)) {
            const selectedNodeData = nodes.find(n => n.id === currentSelectedNode);
            populateNodeChances(selectedNodeData.nodeChances);
        }
        // Redraw
        drawConnections();
        updateCanvasSize();
    };
    let currentSelectedNode = null;

    const splitNode = (nodeId) => {
        const nodeData = nodes.find(n => n.id === nodeId);
        if (nodeData && !nodeData.split) {
            nodeData.split = true;
            const particle = particleArea.querySelector(`.particle[data-id="${nodeId}"]`);
            if (particle) {
                particle.classList.add('split');
            }
            // Create two child nodes
            createParticle(nodeId);
            createParticle(nodeId);
            // If this node is selected, update button text
            if (currentSelectedNode === nodeId) {
                const splitBtn = nodeChances.querySelector(`.split-btn[data-node-id="${nodeId}"]`);
                if (splitBtn) splitBtn.textContent = 'Unsplit';
            }
        }
    };

    const unsplitNode = (nodeId) => {
        const nodeData = nodes.find(n => n.id === nodeId);
        if (nodeData && nodeData.split) {
            nodeData.split = false;
            const particle = particleArea.querySelector(`.particle[data-id="${nodeId}"]`);
            if (particle) {
                particle.classList.remove('split');
            }
            // Delete children
            nodeData.children.forEach(childId => deleteNode(childId));
            nodeData.children = [];
            // If this node is selected, update button text
            if (currentSelectedNode === nodeId) {
                const splitBtn = nodeChances.querySelector(`.split-btn[data-node-id="${nodeId}"]`);
                if (splitBtn) splitBtn.textContent = 'Split';
            }
        }
    };

    const updateCanvasSize = () => {
        connectionCanvas.width = particleArea.offsetWidth;
        connectionCanvas.height = particleArea.offsetHeight;
    };

    const selectLetter = (chances) => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let total = 0;
        for (const chance of Object.values(chances)) {
            total += chance;
        }
        if (total === 0) return letters[Math.floor(Math.random() * 26)];
        let rand = Math.random() * total;
        for (const letter of letters) {
            rand -= chances[letter] || 0;
            if (rand <= 0) return letter;
        }
        return 'A'; // fallback
    };

    let drawing = false;
    const drawConnections = () => {
        if (drawing) return; // Prevent recursion
        drawing = true;

        // Random split/unsplit based on chances
        nodes.forEach(node => {
            if (!node.split && !node.justCreated && Math.random() < node.nodeChances['Split'] / 100) {
                splitNode(node.id);
            } else if (node.split && !node.justCreated && Math.random() < node.nodeChances['Unsplit'] / 100) {
                unsplitNode(node.id);
            }
        });

        // Update letters for non-split nodes
        nodes.forEach(node => {
            const particle = particleArea.querySelector(`.particle[data-id="${node.id}"]`);
            if (particle) {
                if (!node.split) {
                    const selectedLetter = selectLetter(node.letterChances);
                    particle.textContent = selectedLetter;
                } else {
                    particle.textContent = '';
                }
            }
        });

        canvasCtx.clearRect(0, 0, connectionCanvas.width, connectionCanvas.height);
        const particles = particleArea.querySelectorAll('.particle');
        const particleMap = {};
        particles.forEach(particle => {
            const id = parseInt(particle.dataset.id);
            particleMap[id] = {
                x: parseFloat(particle.style.left) + 25,
                y: parseFloat(particle.style.top) + 25,
                nodeData: nodes.find(n => n.id === id)
            };
        });
        particles.forEach(particle => {
            const nodeId = parseInt(particle.dataset.id);
            const nodeData = particleMap[nodeId].nodeData;
            if (!nodeData) return;
            const x1 = particleMap[nodeId].x;
            const y1 = particleMap[nodeId].y;
            for (const [target, chance] of Object.entries(nodeData.nodeChances)) {
                const targetId = parseInt(target.split(' ')[1]);
                if (nodeData.split || (particleMap[targetId] && particleMap[targetId].nodeData.split)) continue;
                if (targetId !== nodeId && particleMap[targetId] && Math.random() < chance / 100) {
                    const x2 = particleMap[targetId].x;
                    const y2 = particleMap[targetId].y;
                    canvasCtx.beginPath();
                    canvasCtx.moveTo(x1, y1);
                    canvasCtx.lineTo(x2, y2);
                        canvasCtx.strokeStyle = `rgba(102, 126, 234, 0.5)`;
                        canvasCtx.lineWidth = 2;
                        canvasCtx.stroke();

                        // Draw arrow in the middle
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        const angle = Math.atan2(y2 - y1, x2 - x1);
                        canvasCtx.save();
                        canvasCtx.translate(midX, midY);
                        canvasCtx.rotate(angle);
                        canvasCtx.beginPath();
                        canvasCtx.moveTo(0, 0);
                        canvasCtx.lineTo(-8, -4);
                        canvasCtx.lineTo(-8, 4);
                        canvasCtx.closePath();
                        canvasCtx.fillStyle = `rgba(102, 126, 234, 0.8)`;
                        canvasCtx.fill();
                        canvasCtx.restore();
                    } else if (targetId === nodeId && Math.random() < chance / 100) {
                        // Draw self-loop as a full circle around the node
                        const loopRadius = 35;
                        canvasCtx.beginPath();
                        canvasCtx.arc(x1, y1, loopRadius, 0, Math.PI * 2);
                        canvasCtx.strokeStyle = `rgba(102, 126, 234, ${chance / 200})`;
                        canvasCtx.lineWidth = 2;
                        canvasCtx.stroke();

                        // Draw arrow on the top of the circle
                        const arrowX = x1;
                        const arrowY = y1 - loopRadius;
                        canvasCtx.save();
                        canvasCtx.translate(arrowX, arrowY);
                        canvasCtx.rotate(0); // point right
                        canvasCtx.beginPath();
                        canvasCtx.moveTo(0, 0);
                        canvasCtx.lineTo(-8, -4);
                        canvasCtx.lineTo(-8, 4);
                        canvasCtx.closePath();
                        canvasCtx.fillStyle = `rgba(102, 126, 234, 0.8)`;
                        canvasCtx.fill();
                        canvasCtx.restore();
                }
            }
        });

        // Reset justCreated flag for next cycle
        nodes.forEach(node => node.justCreated = false);

        drawing = false;
    };

    const generateRandomChances = () => {
        const chances = {};
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        letters.split('').forEach(letter => {
            chances[letter] = Math.floor(Math.random() * 101);
        });
        return chances;
    };

    const generateNodeChances = () => {
        const chances = {};
        nodes.forEach(node => {
            chances[`Node ${node.id}`] = Math.floor(Math.random() * 101);
        });
        chances['Split'] = Math.floor(Math.random() * 101);
        chances['Unsplit'] = Math.floor(Math.random() * 101);
        return chances;
    };



    const populateLetterChances = (chances) => {
        letterChances.innerHTML = '';
        for (const letter in chances) {
            const row = document.createElement('div');
            row.className = 'letter-row';
            row.innerHTML = `<span>${letter}:</span> <span>${chances[letter]}%</span>`;
            letterChances.appendChild(row);
        }
    };

    const populateNodeChances = (chances) => {
        nodeChances.innerHTML = '';
        // Add Split and Unsplit chances first
        if (chances['Split'] !== undefined) {
            const splitRow = document.createElement('div');
            splitRow.className = 'node-chance-row';
            splitRow.innerHTML = `<span>Split:</span> <span>${chances['Split']}%</span>`;
            nodeChances.appendChild(splitRow);
        }
        if (chances['Unsplit'] !== undefined) {
            const unsplitRow = document.createElement('div');
            unsplitRow.className = 'node-chance-row';
            unsplitRow.innerHTML = `<span>Unsplit:</span> <span>${chances['Unsplit']}%</span>`;
            nodeChances.appendChild(unsplitRow);
        }
        // Then add node chances with buttons
        for (const node in chances) {
            if (node.startsWith('Node ')) {
                const row = document.createElement('div');
                row.className = 'node-chance-row';
                const nodeId = parseInt(node.split(' ')[1]);
                const nodeData = nodes.find(n => n.id === nodeId);
                const isSplit = nodeData ? nodeData.split : false;
                const buttonText = isSplit ? 'Unsplit' : 'Split';
                row.innerHTML = `<span>${node}:</span> <span>${chances[node]}%</span> <button class="split-btn" data-node-id="${nodeId}">${buttonText}</button>`;
                nodeChances.appendChild(row);
            }
        }
    };

    nodeChances.addEventListener('click', (e) => {
        if (e.target.classList.contains('split-btn')) {
            const nodeId = parseInt(e.target.dataset.nodeId);
            const nodeData = nodes.find(n => n.id === nodeId);
            if (nodeData) {
                if (nodeData.split) {
                    unsplitNode(nodeId);
                } else {
                    splitNode(nodeId);
                }
                drawConnections();
            }
        }
    });

    const createParticle = (parentId = null) => {
        particleCount++;
        const letterChances = generateRandomChances();
        const nodeChances = generateNodeChances();  // chances to existing nodes
        nodeChances[`Node ${particleCount}`] = Math.floor(Math.random() * 101);  // chance to self
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = selectLetter(letterChances);
        const maxLeft = particleArea.offsetWidth - 50;
        particle.style.left = Math.random() * maxLeft + 'px';
        particle.style.top = Math.random() * (particleArea.offsetHeight - 50) + 'px';
        particle.dataset.id = particleCount;



        let dragging = false;
        let startX, startY;
        particle.addEventListener('mousedown', (e) => {
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = particleArea.getBoundingClientRect();
            const offsetX = e.clientX - rect.left - parseFloat(particle.style.left);
            const offsetY = e.clientY - rect.top - parseFloat(particle.style.top);
            const mousemove = (e) => {
                if (dragging) {
                    const newLeft = e.clientX - rect.left - offsetX;
                    const newTop = e.clientY - rect.top - offsetY;
                    particle.style.left = Math.max(0, Math.min(newLeft, particleArea.offsetWidth - 50)) + 'px';
                    particle.style.top = Math.max(0, Math.min(newTop, particleArea.offsetHeight - 50)) + 'px';
                }
            };
            const mouseup = (e) => {
                dragging = false;
                const dist = Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY);
                if (dist < 5) {
                    // Click action
                    const nodeData = nodes.find(n => n.id == particle.dataset.id);
                    currentSelectedNode = nodeData.id;
                    populateLetterChances(nodeData.letterChances);
                    populateNodeChances(nodeData.nodeChances);
                    sidePanel.classList.add('active');
                    leftPanel.classList.add('active');
                    const originalWidth = particleArea.offsetWidth;
                    const leftOccupied = 270;
                    const rightOccupied = 415;
                    const availableLeft = leftOccupied;
                    const availableRight = originalWidth - rightOccupied;
                    const scale = (availableRight - availableLeft) / originalWidth;
                    const centerX = (availableLeft + availableRight) / 2;
                    const currentCenter = originalWidth / 2;
                    const translateX = centerX - currentCenter;
                    particleArea.style.transform = `scale(${scale}) translateX(${translateX}px)`;
                    updateCanvasSize();
                }
                document.removeEventListener('mousemove', mousemove);
                document.removeEventListener('mouseup', mouseup);
            };
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
        });

        particleArea.appendChild(particle);
        const newNode = { id: particleCount, letterChances, nodeChances, split: false, children: [], justCreated: true };
        nodes.push(newNode);
        if (parentId) {
            const parent = nodes.find(n => n.id === parentId);
            if (parent) {
                parent.children.push(particleCount);
            }
        }

        // Add chance to the new node for existing nodes
        nodes.slice(0, -1).forEach(node => {
            node.nodeChances[`Node ${particleCount}`] = Math.floor(Math.random() * 101);
        })

        // If a node is currently selected, update its display
        if (currentSelectedNode) {
            const selectedNodeData = nodes.find(n => n.id === currentSelectedNode);
            if (selectedNodeData) {
                populateNodeChances(selectedNodeData.nodeChances);
            }
        }

        // Redraw connections
        drawConnections();
    };

    createNodeBtn.addEventListener('click', () => {
        createParticle();
        updateCanvasSize();
        drawConnections();
    });

    // Update connections every second
    setInterval(drawConnections, 1000);

    // Close panels when clicking outside
    particleArea.addEventListener('click', (e) => {
        if (!e.target.classList.contains('particle')) {
            sidePanel.classList.remove('active');
            leftPanel.classList.remove('active');
            particleArea.style.transform = 'scale(1) translateX(0px)';
            updateCanvasSize();
        }
    });

    // Close panels when clicking outside
    particleArea.addEventListener('click', (e) => {
        if (!e.target.classList.contains('particle')) {
            sidePanel.classList.remove('active');
            leftPanel.classList.remove('active');
            particleArea.style.transform = 'scale(1)';
        }
    });

    // Initial canvas size
    updateCanvasSize();
});