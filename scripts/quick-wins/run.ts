import { appendFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PACKETS, ROOT, WORK, readJson } from './lib.ts';

const args = process.argv.slice(2);
const option = (name: string): string | undefined =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const concurrency = Number(option('concurrency') ?? 4);
const model = option('model') ?? 'opus';
const effort = option('effort');
const timeoutMinutes = Number(option('timeout') ?? 45);
const redo = args.includes('--redo');
const safe = args.includes('--safe');
const dryRun = args.includes('--dry-run');
const reverse = args.includes('--reverse');

function selectPackets(): string[] {
  const plan = readJson(join(WORK, 'plan.json'));
  const all =
    typeof plan === 'object' && plan !== null && 'packets' in plan && Array.isArray(plan.packets)
      ? plan.packets.flatMap((p: unknown) =>
          typeof p === 'object' && p !== null && 'id' in p && typeof p.id === 'string' ? [p.id] : []
        )
      : [];
  const spec = option('packets');
  if (!spec) return all;
  const wanted = new Set<string>();
  for (const part of spec.split(',')) {
    const range = /^p(\d{3})-p(\d{3})$/.exec(part);
    if (range)
      for (let n = Number(range[1]); n <= Number(range[2]); n++)
        wanted.add(`p${String(n).padStart(3, '0')}`);
    else wanted.add(part);
  }
  return all.filter((id) => wanted.has(id));
}

function isDone(id: string): boolean {
  const file = join(PACKETS, id, 'run.json');
  if (!existsSync(file)) return false;
  const run = readJson(file);
  return typeof run === 'object' && run !== null && 'ok' in run && run.ok === true;
}

async function runPacket(id: string): Promise<boolean> {
  const dir = join(PACKETS, id);
  const lock = join(dir, 'run.lock');
  if (isDone(id) || existsSync(lock)) return true;
  writeFileSync(lock, `${process.pid} ${new Date().toISOString()}\n`);
  const prompt = `Working directory: ${ROOT}\n\nRead \`scripts/quick-wins/REVIEWER.md\` and carry it out for packet \`${id}\`. Your final message is the report described in step 5 of REVIEWER.md.`;
  const command = [
    'claude',
    '-p',
    '--model',
    model,
    '--output-format',
    'json',
    '--no-session-persistence',
    '--dangerously-skip-permissions',
    '--strict-mcp-config',
    ...(safe ? ['--safe-mode'] : []),
    ...(effort ? ['--effort', effort] : []),
    prompt,
  ];
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const proc = Bun.spawn(command, { cwd: ROOT, stdout: 'pipe', stderr: 'pipe' });
  const timer = setTimeout(() => proc.kill(), timeoutMinutes * 60_000);
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exit = await proc.exited;
  clearTimeout(timer);
  let result: unknown = null;
  try {
    result = JSON.parse(stdout);
  } catch {
    result = { parseError: true, stdout: stdout.slice(-4000) };
  }
  const isError =
    typeof result === 'object' && result !== null && 'is_error' in result
      ? result.is_error !== false
      : true;
  const ok =
    exit === 0 &&
    !isError &&
    existsSync(join(dir, 'findings.json')) &&
    existsSync(join(dir, 'manifest.json'));
  rmSync(lock, { force: true });
  const seconds = Math.round((Date.now() - started) / 1000);
  const pick = (key: string): unknown =>
    typeof result === 'object' && result !== null && key in result
      ? Reflect.get(result, key)
      : undefined;
  writeFileSync(
    join(dir, 'run.json'),
    `${JSON.stringify({ id, ok, exit, startedAt, seconds, model, effort: effort ?? null, safe, reviewed: existsSync(join(dir, 'review.json')), result, stderr: stderr.slice(-2000) }, null, 2)}\n`
  );
  const line = {
    id,
    ok,
    seconds,
    turns: pick('num_turns'),
    cost: pick('total_cost_usd'),
    usage: pick('usage'),
    reviewed: existsSync(join(dir, 'review.json')),
  };
  appendFileSync(join(WORK, 'runs.jsonl'), `${JSON.stringify(line)}\n`);
  console.log(JSON.stringify(line));
  return ok;
}

const queue = selectPackets().filter((id) => redo || !isDone(id));
if (reverse) queue.reverse();
console.log(
  JSON.stringify({
    model,
    effort: effort ?? null,
    safe,
    concurrency,
    timeoutMinutes,
    queued: queue.length,
    first: queue[0],
    last: queue[queue.length - 1],
  })
);
if (!dryRun) {
  const results = { ok: 0, failed: [] as string[] };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
        if (await runPacket(id)) results.ok += 1;
        else results.failed.push(id);
      }
    })
  );
  console.log(JSON.stringify({ done: true, ...results }));
}
