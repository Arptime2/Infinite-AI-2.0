class Node {
  constructor(id, letter1, letter2, type) {
    this.id = id;
    this.letter1 = letter1;
    this.letter2 = letter2;
    this.type = type; // 'ANY', 'ALL', 'NANY', 'NALL'
    this.inputs = []; // array of letters from previous cycle
    this.outputs = []; // list of connected node ids
    this.inputQueue = []; // for IN node, predefined inputs per cycle
    this.delayedOutput = null; // output from current cycle, sent next cycle
  }
}

function executeCycle(nodes) {
  // Step 0: Send delayed outputs from previous cycle
  nodes.forEach(node => {
    if (node.delayedOutput !== null) {
      console.log(`Sending delayed output from ${node.id}: ${node.delayedOutput}`);
      node.outputs.forEach(targetId => {
        const target = nodes.find(n => n.id === targetId);
        if (target) {
          target.inputs.push(node.delayedOutput);
        }
      });
      node.delayedOutput = null; // Reset after sending
    }
  });

  // Find IN node
  const inNode = nodes.find(n => n.id === 'IN');
  if (!inNode) return;

  // Step 1: IN outputs a letter: from queue if available, else random A-Z
  let letter;
  if (inNode.inputQueue && inNode.inputQueue.length > 0) {
    letter = inNode.inputQueue.shift();
  } else {
    letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  console.log(`IN outputs: ${letter}`);

  // Send to connected nodes
  inNode.outputs.forEach(targetId => {
    const target = nodes.find(n => n.id === targetId);
    if (target) {
      target.inputs.push(letter);
    }
  });

  // Step 2: Execute other nodes and set delayed outputs
  const otherNodes = nodes.filter(n => n.id !== 'IN' && n.id !== 'OUT');
  otherNodes.forEach(node => {
    let output = null;
    const first = node.letter1;
    const second = node.letter2;

    if (node.type === 'ANY') {
      // If any input equals first letter, output second
      if (node.inputs.some(inp => inp === first)) {
        output = second;
      }
    } else if (node.type === 'ALL') {
      // If all non-empty inputs equal first, output second
      const nonEmpty = node.inputs.filter(inp => inp !== '');
      if (nonEmpty.length > 0 && nonEmpty.every(inp => inp === first)) {
        output = second;
      }
    } else if (node.type === 'NANY') {
      // If no input equals first, output second
      if (!node.inputs.some(inp => inp === first)) {
        output = second;
      }
    } else if (node.type === 'NALL') {
      // If not all non-empty inputs equal first, output second
      const nonEmpty = node.inputs.filter(inp => inp !== '');
      if (nonEmpty.length === 0 || !nonEmpty.every(inp => inp === first)) {
        output = second;
      }
    }

    if (output) {
      console.log(`Node ${node.id} (${node.type}) outputs: ${output}`);
      node.delayedOutput = output; // Delayed to next cycle
    } else {
      console.log(`Node ${node.id} (${node.type}) outputs nothing`);
      node.delayedOutput = null; // Delayed "nothing" (no send)
    }
  });

  // Step 3: OUT node logs inputs
  const outNode = nodes.find(n => n.id === 'OUT');
  if (outNode && outNode.inputs.length > 0) {
    console.log('OUT received:', outNode.inputs.join(', '));
  } else {
    console.log('OUT received nothing');
  }

  // Step 4: Clear inputs for next cycle
  nodes.forEach(node => node.inputs = []);
}

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Node, executeCycle };
}