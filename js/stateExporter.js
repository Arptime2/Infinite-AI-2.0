// Separate test runner (executed via UI button)
const runTest = () => {
    // Create test nodes based on current GUI nodes
    const testNodes = [];
    const nodeMap = {};
    window.nodes.forEach(node => {
        let newNode;
        if (node.isSpecial) {
            newNode = new FlowNode(node.id === -1 ? 'IN' : 'OUT', '', '', '');
        } else {
            const letters = selectLetter(node.letterChances);
            const category = selectCategory(node.categoryChances);
            newNode = new FlowNode(node.id.toString(), letters[0], letters[1], category);
        }
        testNodes.push(newNode);
        nodeMap[node.id] = newNode;
    });

    // Set connections based on current connections
    if (window.currentConnections) {
        window.currentConnections.forEach(conn => {
            const fromNode = nodeMap[conn.from];
            if (fromNode) {
                fromNode.outputs.push(conn.to.toString());
            }
        });
    }

    // Set IN inputQueue to empty (random)
    const inNodeTest = testNodes.find(n => n.id === 'IN');
    if (inNodeTest) {
        inNodeTest.inputQueue = [];
    }

    // Run asynchronous cycles
    let cycleCount = 0;
    const startTime = Date.now();
    const stopAfterMs = 500; // Run for 500ms
    console.log('Starting test with current state...');
    const testInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= stopAfterMs) {
            clearInterval(testInterval);
            console.log('Test stopped after', elapsed, 'ms.');
            return;
        }
        cycleCount++;
        console.log(`\n--- Cycle ${cycleCount} (elapsed: ${elapsed}ms) ---`);
        executeCycle(testNodes);
    }, 30);
};