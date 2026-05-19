import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/director.json' });

interface Chamber {
  id?: string;
  type?: string;
  apparatus_loadout?: string;
}

interface Apparatus {
  id?: string;
  allocated_to_chamber_id?: string;
}

test.describe('@dashboard @bug-074 chamber.apparatus_loadout is empty for every modern chamber despite populated apparatus.allocated_to_chamber_id', () => {
  test('every modern apparatus with allocated_to_chamber_id=C is currently missing from chamber C.apparatus_loadout', async ({
    apiClient,
    chambersApi,
  }) => {
    const chambersResp = await chambersApi.list();
    expect(chambersResp.status()).toBe(200);
    const chambers = (await chambersResp.json()) as Chamber[];
    const chamberById = new Map(chambers.map((c) => [c.id ?? '', c]));

    const apparatusResp = await apiClient.get('/api/admin/apparatus');
    expect(apparatusResp.status()).toBe(200);
    const apparatus = (await apparatusResp.json()) as Apparatus[];

    const orphanEdges = apparatus
      .filter(
        (a): a is Apparatus & { id: string; allocated_to_chamber_id: string } =>
          typeof a.id === 'string' &&
          typeof a.allocated_to_chamber_id === 'string' &&
          /^C-\d+$/.test(a.allocated_to_chamber_id),
      )
      .map((a) => ({
        apparatusId: a.id,
        chamberId: a.allocated_to_chamber_id,
        chamberLoadout: chamberById.get(a.allocated_to_chamber_id)?.apparatus_loadout ?? '',
      }))
      .filter((edge) => !edge.chamberLoadout.includes(edge.apparatusId));

    expect(
      orphanEdges.length,
      `BUG-074: ${orphanEdges.length} apparatus→chamber edges currently exist with no matching entry in chamber.apparatus_loadout (sample: ${orphanEdges
        .slice(0, 3)
        .map((e) => `${e.apparatusId}→${e.chamberId}(loadout="${e.chamberLoadout}")`)
        .join('; ')})`,
    ).toBeGreaterThan(0);
  });
});
