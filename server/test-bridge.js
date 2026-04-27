'use strict';

/**
 * Test script: Node.js → Python Bridge
 * Tests the connection between Node.js and predict.py
 */

const { runPythonPredictor } = require('./services/ml/pythonBridge');

async function test() {
  console.log('Testing Node.js ↔ Python Bridge\n');

  const testCases = [
    { type: 'url', input: 'http://fake-login.xyz', desc: 'Suspicious URL' },
    { type: 'url', input: 'http://example.com', desc: 'Normal URL' },
    { type: 'message', input: 'verify your account now', desc: 'Suspicious Email' },
    { type: 'message', input: 'hi how are you doing', desc: 'Normal Email' },
  ];

  for (const test of testCases) {
    try {
      console.log(`Testing: ${test.desc}`);
      console.log(`  Input: "${test.input}"`);
      
      const result = await runPythonPredictor(test.type, test.input);
      
      console.log(`  Result:`, result);
      console.log(`  Risk Score: ${result.riskScore}/100`);
      console.log(`  Reasons: ${result.reasons.join(', ')}`);
      console.log();
    } catch (err) {
      console.error(`  ERROR: ${err.message}\n`);
    }
  }

  console.log('✅ Bridge test complete');
}

test().catch(console.error);
