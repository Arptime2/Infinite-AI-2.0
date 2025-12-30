// Test file for flow.js
const { Node, executeCycle } = require('./flow.js');

// Create nodes
const inNode = new Node('IN', '', '', ''); // Special
const nodeA = new Node('A', 'A', 'D', 'NANY');
const nodeB = new Node('B', 'B', 'C', 'ALL');
const outNode = new Node('OUT', '', '', ''); // Special

// Define inputs for IN node per cycle (optional, falls back to random)
inNode.inputQueue = ['A', '', 'A', 'C', '', 'B', 'A', 'D', 'B', 'E']; // For 10 cycles

// Connect: IN -> A -> B -> OUT, and IN -> B -> OUT
inNode.outputs = ['A', 'B'];
nodeA.outputs = ['B'];
nodeB.outputs = ['OUT'];

const nodes = [inNode, nodeA, nodeB, outNode];

// Run asynchronous cycles with 30ms clock
const stopAfterMs = 140; // Stop after 200ms total
console.log('Starting asynchronous test with 30ms clock...');

let cycleCount = 0;
const startTime = Date.now();
const clockInterval = setInterval(() => {
  const elapsed = Date.now() - startTime;
  if (elapsed >= stopAfterMs) {
    clearInterval(clockInterval);
    console.log('Clock stopped after', elapsed, 'ms.');
    return;
  }

  cycleCount++;
  console.log(`\n--- Cycle ${cycleCount} (elapsed: ${elapsed}ms) ---`);
  executeCycle(nodes);
}, 30);