import type { GstSlab } from '~/types/hotel';

// India defaults — used when a hotel has no GST slabs configured yet.
export const GST_DEFAULTS: GstSlab[] = [
  { max_rate: 1000, gst_value: 0 },
  { max_rate: 7500, gst_value: 5 },
  { max_rate: null, gst_value: 18 },
];

// Returns a human error string if the slabs are invalid, else null.
// Tiers are contiguous brackets: ceilings must strictly ascend, and exactly
// one open-ended (max_rate === null) tier must sit last.
export function validateGstSlabs(slabs: GstSlab[]): string | null {
  if (!slabs.length) return 'Add at least one tier.';

  const openEnded = slabs.filter((s) => s.max_rate === null);
  if (openEnded.length !== 1) return 'There must be exactly one open-ended top tier.';
  if (slabs[slabs.length - 1]!.max_rate !== null) return 'The open-ended tier must be last.';

  let prev = 0;
  for (let i = 0; i < slabs.length; i++) {
    const { max_rate, gst_value } = slabs[i]!;
    if (gst_value == null || gst_value < 0 || gst_value > 100) {
      return `GST % must be between 0 and 100 (tier ${i + 1}).`;
    }
    if (max_rate !== null) {
      if (max_rate <= prev) return `Rate ceilings must increase (tier ${i + 1}).`;
      prev = max_rate;
    }
  }
  return null;
}
