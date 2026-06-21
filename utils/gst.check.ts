// Runnable self-check (no test framework). Node 22.6+: `node utils/gst.check.ts`
import assert from 'node:assert';
import { validateGstSlabs, GST_DEFAULTS } from './gst.ts';

// Defaults are valid.
assert.equal(validateGstSlabs(GST_DEFAULTS), null);

// Single open-ended tier is valid.
assert.equal(validateGstSlabs([{ max_rate: null, gst_value: 12 }]), null);

// Non-ascending ceilings rejected.
assert.match(
  validateGstSlabs([{ max_rate: 5000, gst_value: 5 }, { max_rate: 1000, gst_value: 12 }, { max_rate: null, gst_value: 18 }])!,
  /increase/,
);

// Out-of-range percent rejected.
assert.match(validateGstSlabs([{ max_rate: 1000, gst_value: 150 }, { max_rate: null, gst_value: 18 }])!, /0 and 100/);

// Missing open-ended tier rejected.
assert.match(validateGstSlabs([{ max_rate: 1000, gst_value: 5 }])!, /open-ended/);

// Open-ended tier not last rejected.
assert.match(validateGstSlabs([{ max_rate: null, gst_value: 5 }, { max_rate: 1000, gst_value: 18 }])!, /open-ended/);

// Two open-ended tiers rejected.
assert.match(validateGstSlabs([{ max_rate: null, gst_value: 5 }, { max_rate: null, gst_value: 18 }])!, /exactly one/);

console.log('gst.check.ts: all assertions passed');
