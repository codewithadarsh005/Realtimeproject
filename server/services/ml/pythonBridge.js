'use strict';

/**
 * pythonBridge.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Spawns predict.py as a child process, sends JSON via stdin, reads the
 * prediction result from stdout.
 *
 * Communication protocol:
 *   Node → Python (stdin):  { type: 'url'|'message', input: string }
 *   Python → Node (stdout): { riskScore: number, reasons: string[] }
 *   Python → Node (stderr): error text (logged; triggers fallback)
 *
 * Configuration (.env):
 *   PYTHON_CMD      Python executable name/path  (default: 'python3')
 *   PYTHON_TIMEOUT  Max ms to wait for script    (default: 10000)
 * ────────────────────────────────────────────────────────────────────────────
 */

const { exec } = require('child_process');
const path       = require('path');

const PYTHON_SCRIPT  = path.resolve(__dirname, '../../python/predict.py');
const PYTHON_CMD     = process.env.PYTHON_CMD     || 'python';
const PYTHON_TIMEOUT = parseInt(process.env.PYTHON_TIMEOUT || '10000', 10);

/**
 * Run the Python prediction script.
 *
 * @param {'url'|'message'} type
 * @param {string}          input   Raw URL or message text
 * @returns {Promise<{ riskScore: number, reasons: string[] }>}
 * @throws  {Error} if the script exits non-zero or times out
 */
function runPythonPredictor(type, input) {
  return new Promise((resolve, reject) => {
    const modelType = type === 'url' ? 'url' : 'email';
    const command = `${PYTHON_CMD} "${PYTHON_SCRIPT}" ${modelType} ${JSON.stringify(input)}`;
    let timedOut = false;

    const child = exec(command, { timeout: PYTHON_TIMEOUT, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (timedOut) return;
      if (stderr && stderr.trim()) {
        console.error('[PythonBridge] stderr:', stderr.trim());
      }

      if (error) {
        if (error.killed || (error.signal === 'SIGTERM' && error.killed)) {
          timedOut = true;
          return reject(new Error(`Python script timed out after ${PYTHON_TIMEOUT}ms`));
        }
        return reject(new Error(`Python script exited with error: ${stderr.trim() || error.message}`));
      }

      try {
        const result = JSON.parse(stdout.trim());

        if (typeof result.riskScore !== 'number' || !Array.isArray(result.reasons)) {
          return reject(new Error('Python script returned unexpected output shape'));
        }

        resolve({
          riskScore: Math.min(100, Math.max(0, result.riskScore)),
          reasons:   result.reasons,
        });
      } catch (parseError) {
        reject(new Error(`Failed to parse Python output as JSON: "${stdout.trim()}"`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
}

module.exports = { runPythonPredictor };
