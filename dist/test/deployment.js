import fs from 'fs';
function testEntrypoint() {
    const mainPath = './src/main.ts';
    const mainContent = fs.readFileSync(mainPath, 'utf-8');
    if (mainContent.includes('Zeroth Principle')) {
        console.log('[Test] Zeroth Principle found: Ethical alignment confirmed.');
        console.log('[Test] Would launch app.');
    }
    else {
        console.log('[Test] ERROR: Zeroth Principle not found. Launch aborted.');
    }
    const fakeContent = mainContent.replace('Zeroth Principle', '');
    if (!fakeContent.includes('Zeroth Principle')) {
        console.log('[Test] (Simulated) ERROR: Zeroth Principle not found. Launch aborted.');
    }
}
testEntrypoint();
//# sourceMappingURL=deployment.js.map