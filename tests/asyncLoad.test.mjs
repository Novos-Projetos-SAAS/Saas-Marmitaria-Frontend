import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runAsyncLoad, createAsyncLoadScope } from '../src/services/asyncLoad.mjs';

test('loading settles only after the asynchronous operation completes', async () => {
    let resolve, started = false, settled = false;
    const pending = runAsyncLoad(() => {
        started = true;
        return new Promise(done => { resolve = done; });
    }, {}, () => { settled = true; });
    assert.equal(started, true);
    assert.equal(settled, false);
    resolve('response');
    assert.equal(await pending, 'response');
    assert.equal(settled, true);
});

test('an obsolete request cannot finish loading for a replacement request', async () => {
    const controller = new AbortController();
    let resolve, settled = false;
    const pending = runAsyncLoad(() => new Promise(done => { resolve = done; }),
        { signal: controller.signal }, () => { settled = true; });
    controller.abort();
    resolve('obsolete');
    await pending;
    assert.equal(settled, false);
});

test('failed asynchronous operations settle loading and preserve their error', async () => {
    let settled = false;
    const error = new Error('synthetic failure');
    await assert.rejects(runAsyncLoad(async () => { throw error; }, {},
        () => { settled = true; }), candidate => candidate === error);
    assert.equal(settled, true);
});

test('a cancelled operation is never started', async () => {
    const controller = new AbortController();
    controller.abort();
    await runAsyncLoad(() => assert.fail('cancelled operation'), { signal: controller.signal },
        () => assert.fail('cancelled settlement'));
});

test('query disposal invalidates manual refreshes as well as the initial request', async () => {
    const resolvers = [], signals = [];
    let committed = 0, settled = 0;
    const load = async ({ signal }) => {
        signals.push(signal);
        await new Promise(resolve => { resolvers.push(resolve); });
        if (!signal.aborted) committed++;
    };
    const scope = createAsyncLoadScope(load);
    scope.activate();
    const initial = scope.run({}, () => settled++);
    const manual = scope.run({}, () => settled++);
    assert.equal(signals.length, 2);
    scope.dispose();
    assert.equal(signals.every(signal => signal.aborted), true);
    resolvers.forEach(resolve => resolve());
    await Promise.all([initial, manual]);
    assert.equal(committed, 0);
    assert.equal(settled, 0);
});

test('a request scope supports React effect setup after cleanup and rejects refreshes while unmounted', async () => {
    let calls = 0;
    const scope = createAsyncLoadScope(async ({ signal }) => {
        calls++;
        assert.equal(signal.aborted, false);
        return 'current';
    });
    scope.activate(); scope.dispose();
    await scope.run({}, () => assert.fail('unmounted settlement'));
    assert.equal(calls, 0);
    scope.activate();
    let settled = false;
    assert.equal(await scope.run({}, () => { settled = true; }), 'current');
    assert.equal(settled, true);
});
