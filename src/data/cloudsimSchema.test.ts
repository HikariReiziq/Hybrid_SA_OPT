import { describe, expect, it } from 'vitest';
import { validateCloudSimHybridJson } from './cloudsimSchema';

describe('CloudSim hybrid JSON schema validator', () => {
  it('accepts a valid CloudSim payload with SA+2Opt and DJAYA+2Opt rows', () => {
    const sample = {
      sourceLabel: 'CloudSim Plus 8.0.0 - Kelompok 4',
      isPlaceholder: false,
      scenarios: [
        {
          id: 'tc1-500x50',
          dataset: 'gocj',
          tasks: 500,
          vms: 50,
          evaluationBudget: 22501,
          runs: 10,
          results: [
            {
              algorithm: 'SA+2Opt',
              makespanMean: 650.4,
              makespanStd: 8.2,
              aruMean: 0.93,
              doiMean: 0.24,
              avgWaitingMean: 210.1,
              runtimeMsMean: 84.5,
              verifiedCloudSim: true,
            },
          ],
        },
      ],
    };

    const res = validateCloudSimHybridJson(sample);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.scenarios[0].results[0].algorithm).toBe('SA+2Opt');
    }
  });

  it('rejects malformed payloads with specific Indonesian error messages', () => {
    const missingLabel = validateCloudSimHybridJson({
      isPlaceholder: false,
      scenarios: [],
    });
    expect(missingLabel.ok).toBe(false);

    const badAlgo = validateCloudSimHybridJson({
      sourceLabel: 'Test',
      isPlaceholder: false,
      scenarios: [
        {
          id: 'tc1-500x50',
          dataset: 'gocj',
          tasks: 500,
          vms: 50,
          evaluationBudget: 22501,
          runs: 10,
          results: [
            {
              algorithm: 'UnknownAlgo',
              makespanMean: 100,
              makespanStd: 1,
              aruMean: 0.9,
              doiMean: 0.1,
              avgWaitingMean: 10,
              runtimeMsMean: 5,
              verifiedCloudSim: true,
            },
          ],
        },
      ],
    });
    expect(badAlgo.ok).toBe(false);
    if (!badAlgo.ok) {
      expect(badAlgo.error).toContain('UnknownAlgo');
    }
  });
});
