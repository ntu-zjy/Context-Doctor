/**
 * Context Doctor plugin for OpenCode.
 *
 * Registers the local skill and teaches the agent to run the local renderer when
 * the user invokes /contextdoctor.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, '..', '..');
const skillsDir = path.join(pluginRoot, 'skills');
const cliPath = path.join(pluginRoot, 'scripts', 'contextdoctor.mjs');

export const ContextDoctorPlugin = async () => ({
  config: async (config) => {
    config.skills = config.skills || {};
    config.skills.paths = config.skills.paths || [];
    if (fs.existsSync(skillsDir) && !config.skills.paths.includes(skillsDir)) {
      config.skills.paths.push(skillsDir);
    }
  },

  'experimental.chat.system.transform': async (_input, output) => {
    const instruction = `When the user invokes /contextdoctor, run: node ${cliPath} run --framework=opencode with any user-provided flags. Do not paste transcript bodies into chat; summarize only the generated score and report path.`;
    (output.system ||= []).push(instruction);
  }
});

export default ContextDoctorPlugin;
