const startTraining = (intervalMs = 30, onStop) => {
    let trainRunning = true;
    let cycleCount = 0;
    const trainInterval = setInterval(() => {
        if (!trainRunning) {
            clearInterval(trainInterval);
            return;
        }

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

        if (window.currentConnections) {
            window.currentConnections.forEach(conn => {
                const fromNode = nodeMap[conn.from];
                if (fromNode) {
                    fromNode.outputs.push(conn.to.toString());
                }
            });
        }

        const inNodeTest = testNodes.find(n => n.id === 'IN');
        if (inNodeTest) {
            inNodeTest.inputQueue = [];
        }

        cycleCount++;
        console.log(`\n--- Cycle ${cycleCount} ---`);
        executeCycle(testNodes);
    }, intervalMs);

    return () => {
        trainRunning = false;
        clearInterval(trainInterval);
        if (onStop) onStop();
    };
};

window.startTraining = startTraining;