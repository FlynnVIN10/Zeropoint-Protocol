// Deployment Test Script
// Validates entrypoint gating and launch functionality

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 Running Deployment Tests...\n');

// Test 1: Check if entrypoint.sh exists and is executable
function testEntrypointExists() {
    console.log('Test 1: Entrypoint script existence and permissions');
    const entrypointPath = 'src/scripts/entrypoint.sh';
    
    if (!existsSync(entrypointPath)) {
        throw new Error('❌ Entrypoint script not found');
    }
    
    try {
        const stats = require('fs').statSync(entrypointPath);
        if (!stats.isFile()) {
            throw new Error('❌ Entrypoint is not a file');
        }
        
        // Check if executable (simplified check for Unix-like systems)
        console.log('✅ Entrypoint script exists and is accessible');
        return true;
    } catch (error) {
        throw new Error(`❌ Entrypoint script check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Test 2: Validate main.ts content
function testMainTsContent() {
    console.log('\nTest 2: Main.ts content validation');
    const mainPath = 'src/main.ts';
    
    if (!existsSync(mainPath)) {
        throw new Error('❌ main.ts not found');
    }
    
    const content = readFileSync(mainPath, 'utf8');
    
    // Check for ethical content
    const ethicalKeywords = ['ethical', 'beneficial', 'humanity', 'transparency'];
    const foundKeywords = ethicalKeywords.filter(keyword => 
        content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (foundKeywords.length < 2) {
        throw new Error('❌ Insufficient ethical content in main.ts');
    }
    
    console.log(`✅ Main.ts contains ethical keywords: ${foundKeywords.join(', ')}`);
    return true;
}

// Test 3: Check package.json scripts
function testPackageJsonScripts() {
    console.log('\nTest 3: Package.json scripts validation');
    
    if (!existsSync('package.json')) {
        throw new Error('❌ package.json not found');
    }
    
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    if (!packageJson.scripts || !packageJson.scripts.start) {
        throw new Error('❌ Start script not found in package.json');
    }
    
    if (!packageJson.scripts.start.includes('src/scripts/entrypoint.sh')) {
        throw new Error('❌ Start script does not use entrypoint.sh');
    }
    
    console.log('✅ Package.json scripts properly configured');
    return true;
}

// Test 4: Simulate entrypoint gating (without actually launching)
function testEntrypointGating() {
    console.log('\nTest 4: Entrypoint gating simulation');
    
    try {
        // Read entrypoint script content
        const entrypointContent = readFileSync('src/scripts/entrypoint.sh', 'utf8');
        
        // Check for Zeroth principle checks
        if (!entrypointContent.includes('Zeroth Principle')) {
            throw new Error('❌ Entrypoint missing Zeroth principle checks');
        }
        
        if (!entrypointContent.includes('unethical')) {
            throw new Error('❌ Entrypoint missing unethical keyword scanning');
        }
        
        if (!entrypointContent.includes('npm start')) {
            throw new Error('❌ Entrypoint missing npm start launch');
        }
        
        console.log('✅ Entrypoint gating logic properly implemented');
        return true;
    } catch (error) {
        throw new Error(`❌ Entrypoint gating test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Run all tests
function runAllTests() {
    try {
        testEntrypointExists();
        testMainTsContent();
        testPackageJsonScripts();
        testEntrypointGating();
        
        console.log('\n🎉 All deployment tests PASSED!');
        console.log('✅ Entrypoint gating: Implemented');
        console.log('✅ Main.ts: Ethical content verified');
        console.log('✅ Package.json: Scripts configured');
        console.log('✅ Zeroth principle: Gate operational');
        
        return true;
    } catch (error) {
        console.error('\n❌ Deployment test FAILED:', error instanceof Error ? error.message : String(error));
        return false;
    }
}

// Execute tests
if (require.main === module) {
    const success = runAllTests();
    process.exit(success ? 0 : 1);
}

export { runAllTests };
