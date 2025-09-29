#!/usr/bin/env node
/**
 * dev-solo.js
 * Enforce a single Astro dev server on a fixed port (default 4977) without port hopping.
 * 1. Determine target port (DEV_PORT env or default).
 * 2. Kill any process listening on that port (SIGTERM then optional SIGKILL).
 * 3. Verify the port is free (retry loop) else exit 1.
 * 4. Spawn `astro dev --strictPort --port <port>` inheriting stdio.
 */

import { execSync, spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = process.env.DEV_PORT ? Number(process.env.DEV_PORT) : 4977;
// Allow overriding host binding; default to IPv4 loopback to avoid IPv6-only bind that breaks 127.0.0.1 curls on some macOS setups.
const HOST = process.env.DEV_HOST || '127.0.0.1';
if (!Number.isInteger(PORT) || PORT <= 0) {
    console.error(`[dev:solo] Invalid DEV_PORT value: ${process.env.DEV_PORT}`);
    process.exit(1);
}

function pidsOnPort(port) {
    try {
        const out = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
        if (!out) return [];
        return out.split(/\s+/).filter(Boolean);
    } catch {
        return [];
    }
}

async function killPort(port) {
    const pids = pidsOnPort(port);
    if (pids.length === 0) return false;
    console.log(`[dev:solo] Found listener(s) on ${port}: ${pids.join(', ')}`);
    try { execSync(`kill ${pids.join(' ')}`); } catch { }
    await delay(400);
    const still = pidsOnPort(port);
    if (still.length) {
        console.log(`[dev:solo] Forcing SIGKILL for: ${still.join(', ')}`);
        try { execSync(`kill -9 ${still.join(' ')}`); } catch { }
    }
    return true;
}

async function ensureFree(port, attempts = 5) {
    for (let i = 1; i <= attempts; i++) {
        const pids = pidsOnPort(port);
        if (pids.length === 0) return true;
        console.log(`[dev:solo] Attempt ${i}/${attempts}: port still busy (${pids.join(', ')}), re-killing...`);
        await killPort(port);
        await delay(300);
    }
    return pidsOnPort(port).length === 0;
}

(async () => {
    console.log(`[dev:solo] Target port: ${PORT}`);
    await killPort(PORT);
    const free = await ensureFree(PORT, 6);
    if (!free) {
        console.error(`[dev:solo] Could not free port ${PORT} after retries. Aborting.`);
        process.exit(1);
    }
    console.log(`[dev:solo] Port ${PORT} is free. Launching Astro (host=${HOST})...`);
    const args = ['astro', 'dev', '--port', String(PORT), '--strictPort', '--host', HOST];
    console.log(`[dev:solo] Spawn: npx ${args.join(' ')}`);
    const proc = spawn('npx', args, {
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1', ASTRO_FORCE_COLOR: '1' },
    });
    proc.on('exit', (code, sig) => {
        console.log(`[dev:solo] Astro exited code=${code} sig=${sig || ''}`);
        process.exit(code ?? 0);
    });
})();
