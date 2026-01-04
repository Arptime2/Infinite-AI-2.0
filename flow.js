// flow.js
class FlowNode {
    constructor(id, letter1, letter2, type) {
        this.id = id;
        this.letter1 = letter1;
        this.letter2 = letter2;
        this.type = type;
        this.inputs = [];
        this.outputs = [];
        this.inputQueue = [];
        this.delayedOutput = null;
    }
}

function selectLetter(chances) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let primaryTotal = 0;
    let secondaryTotal = 0;
    for (const letter of letters) {
        if (chances[letter]) {
            primaryTotal += chances[letter].primary || 0;
            secondaryTotal += chances[letter].secondary || 0;
        }
    }
    let primaryLetter = 'A';
    let secondaryLetter = 'A';
    if (primaryTotal > 0) {
        let rand = Math.random() * primaryTotal;
        for (const letter of letters) {
            rand -= chances[letter]?.primary || 0;
            if (rand <= 0) {
                primaryLetter = letter;
                break;
            }
        }
    } else {
        primaryLetter = letters[Math.floor(Math.random() * 26)];
    }
    if (secondaryTotal > 0) {
        let rand = Math.random() * secondaryTotal;
        for (const letter of letters) {
            rand -= chances[letter]?.secondary || 0;
            if (rand <= 0) {
                secondaryLetter = letter;
                break;
            }
        }
    } else {
        secondaryLetter = letters[Math.floor(Math.random() * 26)];
    }
    return primaryLetter + secondaryLetter;
}

function selectCategory(chances) {
    const categories = ['ALL', 'ANY', 'NANY', 'NALL'];
    let total = 0;
    for (const chance of Object.values(chances)) {
        total += chance;
    }
    if (total === 0) return categories[Math.floor(Math.random() * 4)];
    let rand = Math.random() * total;
    for (const cat of categories) {
        rand -= chances[cat] || 0;
        if (rand <= 0) return cat;
    }
    return 'ALL';
}

function getFlowCategoryColor(category) {
    const colors = {
        ALL: '#ff6b6b',
        ANY: '#6b6bff',
        NANY: '#6bff6b',
        NALL: '#ffff6b'
    };
    return colors[category] || '#ff6b6b';
}

function executeCycle(flowNodes) {
    // Send delayed outputs
    flowNodes.forEach(node => {
        if (node.delayedOutput !== null) {
            node.outputs.forEach(targetId => {
                const target = flowNodes.find(n => n.id === targetId);
                if (target) {
                    target.inputs.push(node.delayedOutput);
                }
            });
            node.delayedOutput = null;
        }
    });

    // IN sends
    const inNode = flowNodes.find(n => n.id === 'IN');
    if (inNode) {
        let letter;
        const input = document.getElementById('command-input').value;
        if (input.length > 0) {
            letter = input[input.length - 1].toUpperCase();
        } else {
            letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
        console.log(`IN outputs: ${letter}`);
        inNode.outputs.forEach(targetId => {
            const target = flowNodes.find(n => n.id === targetId);
            if (target) {
                target.inputs.push(letter);
            }
        });
    }

    // Compute for processing nodes
    const otherNodes = flowNodes.filter(n => n.id !== 'IN' && n.id !== 'OUT');
    otherNodes.forEach(node => {
        let output = null;
        const first = node.letter1;
        const second = node.letter2;

        if (node.type === 'ANY') {
            if (node.inputs.some(inp => inp === first)) {
                output = second;
            }
        } else if (node.type === 'ALL') {
            const nonEmpty = node.inputs.filter(inp => inp !== '');
            if (nonEmpty.length > 0 && nonEmpty.every(inp => inp === first)) {
                output = second;
            }
        } else if (node.type === 'NANY') {
            if (!node.inputs.some(inp => inp === first)) {
                output = second;
            }
        } else if (node.type === 'NALL') {
            const nonEmpty = node.inputs.filter(inp => inp !== '');
            if (nonEmpty.length === 0 || !nonEmpty.every(inp => inp === first)) {
                output = second;
            }
        }

        if (output) {
            console.log(`Node ${node.id} (${node.type}) outputs: ${output}`);
            node.delayedOutput = output;
        } else {
            console.log(`Node ${node.id} (${node.type}) outputs nothing`);
            node.delayedOutput = null;
        }
    });

    // OUT logs
    const outNode = flowNodes.find(n => n.id === 'OUT');
    if (outNode && outNode.inputs.length > 0) {
        console.log('OUT received:', outNode.inputs.join(', '));
    } else {
        console.log('OUT received nothing');
    }

    // Clear inputs
    flowNodes.forEach(node => node.inputs = []);
}

// Create flow nodes
const inNode = new FlowNode('IN', '', '', '');
const nodeA = new FlowNode('A', 'A', 'D', 'NANY');
const nodeB = new FlowNode('B', 'B', 'C', 'ALL');
const outNode = new FlowNode('OUT', '', '', '');
inNode.outputs = ['A', 'B'];
nodeA.outputs = ['B'];
nodeB.outputs = ['OUT'];
window.FlowNode = FlowNode;
window.selectLetter = selectLetter;
window.selectCategory = selectCategory;

const flowNodes = [inNode, nodeA, nodeB, outNode];
window.flowNodes = flowNodes;