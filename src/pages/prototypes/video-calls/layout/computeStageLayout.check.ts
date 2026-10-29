/**
 * Assertion script for computeStageLayout (no test runner in this repo).
 * Run from the repo root:
 *   node --experimental-strip-types src/pages/prototypes/video-calls/layout/computeStageLayout.check.ts
 */
import assert from 'node:assert/strict';
import {
  computeStageLayout,
  gridDimensions,
  type GridLayout,
  type LayoutParticipant,
  type StageLayout,
} from './computeStageLayout.ts';

const IDS = [
  'self',
  'p1',
  'p2',
  'p3',
  'p4',
  'p5',
  'p6',
  'p7',
  'p8',
  'p9',
  'p10',
  'p11',
];

function people(
  n: number,
  extra: Record<string, Partial<LayoutParticipant>> = {},
): LayoutParticipant[] {
  return IDS.slice(0, n).map((id) => ({
    id,
    self: id === 'self',
    ...extra[id],
  }));
}

function asGrid(layout: StageLayout): GridLayout {
  assert.equal(layout.kind, 'grid');
  return layout as GridLayout;
}

function visibleIds(layout: StageLayout): string[] {
  if (layout.kind === 'pip') return [layout.mainId, layout.pipId];
  if (layout.kind === 'grid') return layout.tileIds;
  return layout.filmstripIds;
}

let checks = 0;
function check(name: string, fn: () => void) {
  fn();
  checks += 1;
  console.log(`ok - ${name}`);
}

check('0 participants → empty grid', () => {
  const g = asGrid(
    computeStageLayout({ participants: [], view: 'speaker', sharing: false }),
  );
  assert.deepEqual([g.cols, g.rows, g.tileIds.length], [0, 0, 0]);
});

check('1 participant → self alone 1x1 (both views)', () => {
  for (const view of ['speaker', 'grid'] as const) {
    const g = asGrid(
      computeStageLayout({ participants: people(1), view, sharing: false }),
    );
    assert.deepEqual([g.cols, g.rows], [1, 1]);
    assert.deepEqual(g.tileIds, ['self']);
  }
});

check('2 participants speaker → pip (remote main, self pip)', () => {
  const l = computeStageLayout({
    participants: people(2),
    view: 'speaker',
    sharing: false,
  });
  assert.deepEqual(l, { kind: 'pip', mainId: 'p1', pipId: 'self' });
});

check('2 participants grid → two equal tiles 2x1', () => {
  const g = asGrid(
    computeStageLayout({
      participants: people(2),
      view: 'grid',
      sharing: false,
    }),
  );
  assert.deepEqual([g.cols, g.rows, g.featuredSpan], [2, 1, 1]);
  assert.deepEqual(g.tileIds, ['self', 'p1']);
});

const EXPECTED: Record<number, [number, number]> = {
  1: [1, 1],
  2: [2, 1],
  3: [2, 2],
  4: [2, 2],
  5: [3, 2],
  6: [3, 2],
  7: [3, 3],
  8: [3, 3],
  9: [3, 3],
  10: [4, 3],
};

check('gridDimensions table 1..10', () => {
  for (let n = 1; n <= 10; n += 1) {
    const { cols, rows } = gridDimensions(n);
    assert.deepEqual([cols, rows], EXPECTED[n], `n=${n}`);
    assert.ok(cols * rows >= n);
  }
});

check('grid view 1..9: all visible, join order, no overflow', () => {
  for (let n = 1; n <= 9; n += 1) {
    const g = asGrid(
      computeStageLayout({
        participants: people(n),
        view: 'grid',
        sharing: false,
      }),
    );
    assert.deepEqual(g.tileIds, IDS.slice(0, n));
    assert.deepEqual(g.overflowIds, []);
    assert.deepEqual([g.cols, g.rows], EXPECTED[n]);
  }
});

check('grid view 10 with default maxVisible 9 → 8 tiles + chip(2)', () => {
  const g = asGrid(
    computeStageLayout({
      participants: people(10),
      view: 'grid',
      sharing: false,
    }),
  );
  assert.equal(g.tileIds.length, 8);
  assert.equal(g.overflowIds.length, 2);
  assert.deepEqual([g.cols, g.rows], [3, 3]);
  assert.ok(g.tileIds.includes('self'));
});

check('grid view 10 with maxVisible 10 → 4x3, no overflow', () => {
  const g = asGrid(
    computeStageLayout({
      participants: people(10),
      view: 'grid',
      sharing: false,
      maxVisible: 10,
    }),
  );
  assert.deepEqual(
    [g.cols, g.rows, g.tileIds.length, g.overflowIds.length],
    [4, 3, 10, 0],
  );
});

check('speaker view 3..10: grid, speaker featured first, self kept', () => {
  for (let n = 3; n <= 10; n += 1) {
    const g = asGrid(
      computeStageLayout({
        participants: people(n),
        view: 'speaker',
        sharing: false,
        activeSpeakerId: 'p2',
      }),
    );
    assert.equal(g.tileIds[0], 'p2', `n=${n}`);
    assert.equal(g.featuredId, 'p2');
    assert.ok(g.tileIds.includes('self'));
    const cells = g.tileIds.length + (g.overflowIds.length ? 1 : 0);
    assert.equal(g.featuredSpan, 1 + g.cols * g.rows - cells, `span n=${n}`);
    assert.equal(g.tileIds.length + g.overflowIds.length, n);
  }
});

check('speaker view 3: featured spans the empty cell (2 top / 2 below)', () => {
  const g = asGrid(
    computeStageLayout({
      participants: people(3),
      view: 'speaker',
      sharing: false,
    }),
  );
  assert.deepEqual(
    [g.cols, g.rows, g.featuredSpan, g.featuredId],
    [2, 2, 2, 'p1'],
  );
});

check('self is never featured', () => {
  const g = asGrid(
    computeStageLayout({
      participants: people(4),
      view: 'speaker',
      sharing: false,
      activeSpeakerId: 'self',
    }),
  );
  assert.notEqual(g.featuredId, 'self');
});

check('self never dropped with overflow, wherever self sits', () => {
  const list = people(10).reverse(); // self last
  for (const view of ['speaker', 'grid'] as const) {
    for (const maxVisible of [2, 3, 5, 9]) {
      const l = computeStageLayout({
        participants: list,
        view,
        sharing: false,
        maxVisible,
        activeSpeakerId: 'p9',
      });
      assert.ok(visibleIds(l).includes('self'), `${view} max=${maxVisible}`);
      assert.ok(!(l as GridLayout).overflowIds.includes('self'));
    }
  }
});

check(
  'clamps to MAX_PARTICIPANTS (12 in → 10 kept, self kept) and dedupes',
  () => {
    const list = [
      ...people(12).slice(1),
      { id: 'self', self: true },
      { id: 'p1' },
    ];
    const g = asGrid(
      computeStageLayout({
        participants: list,
        view: 'grid',
        sharing: false,
        maxVisible: 10,
      }),
    );
    assert.equal(g.tileIds.length + g.overflowIds.length, 10);
    assert.ok(g.tileIds.includes('self'));
  },
);

check('grid view: talking flips never reorder visible tiles', () => {
  let prev: StageLayout | null = null;
  const base = people(6);
  for (const speaker of ['p1', 'p3', 'p5', 'p2', 'p1']) {
    const l = computeStageLayout({
      participants: base,
      view: 'grid',
      sharing: false,
      activeSpeakerId: speaker,
      previous: prev,
    });
    assert.deepEqual(visibleIds(l), IDS.slice(0, 6));
    prev = l;
  }
});

check(
  'overflow: speaker promoted only when not visible; set otherwise stable',
  () => {
    const base = people(10);
    let prev = computeStageLayout({
      participants: base,
      view: 'grid',
      sharing: false,
      activeSpeakerId: 'p1',
    });
    const first = asGrid(prev).tileIds;
    // Visible speaker → identical layout.
    const same = asGrid(
      computeStageLayout({
        participants: base,
        view: 'grid',
        sharing: false,
        activeSpeakerId: 'p3',
        previous: prev,
      }),
    );
    assert.deepEqual(same.tileIds, first);
    // Hidden speaker → promoted, exactly one tile leaves, self stays.
    const hidden = asGrid(prev).overflowIds[0];
    prev = computeStageLayout({
      participants: base,
      view: 'grid',
      sharing: false,
      activeSpeakerId: hidden,
      previous: prev,
    });
    const promoted = asGrid(prev).tileIds;
    assert.ok(promoted.includes(hidden));
    assert.ok(promoted.includes('self'));
    assert.equal(promoted.filter((id) => !first.includes(id)).length, 1);
    // Speaker goes quiet then talks again → no change.
    const again = asGrid(
      computeStageLayout({
        participants: base,
        view: 'grid',
        sharing: false,
        activeSpeakerId: hidden,
        previous: prev,
      }),
    );
    assert.deepEqual(again.tileIds, promoted);
  },
);

check('speaker view: speaker change swaps two tiles, others stay', () => {
  const base = people(6);
  const a = asGrid(
    computeStageLayout({
      participants: base,
      view: 'speaker',
      sharing: false,
      activeSpeakerId: 'p1',
    }),
  );
  const b = asGrid(
    computeStageLayout({
      participants: base,
      view: 'speaker',
      sharing: false,
      activeSpeakerId: 'p4',
      previous: a,
    }),
  );
  assert.equal(b.tileIds[0], 'p4');
  const moved = a.tileIds.filter((id, i) => b.tileIds[i] !== id);
  assert.deepEqual(moved.sort(), ['p1', 'p4']);
  // Same speaker again → identical.
  const c = asGrid(
    computeStageLayout({
      participants: base,
      view: 'speaker',
      sharing: false,
      activeSpeakerId: 'p4',
      previous: b,
    }),
  );
  assert.deepEqual(c.tileIds, b.tileIds);
  // No speaker → previous featured kept.
  const d = asGrid(
    computeStageLayout({
      participants: base,
      view: 'speaker',
      sharing: false,
      previous: c,
    }),
  );
  assert.equal(d.featuredId, 'p4');
});

check(
  'sharing 1..10 → share layout, presenter = sharer, self + presenter visible',
  () => {
    for (let n = 1; n <= 10; n += 1) {
      const sharer = n > 1 ? 'p1' : 'self';
      for (const view of ['speaker', 'grid'] as const) {
        const l = computeStageLayout({
          participants: people(n, { [sharer]: { sharing: true } }),
          view,
          sharing: true,
        });
        assert.equal(l.kind, 'share');
        if (l.kind !== 'share') return;
        assert.equal(l.presenterId, sharer);
        assert.ok(l.filmstripIds.includes('self'));
        assert.ok(l.filmstripIds.includes(sharer));
        assert.equal(l.filmstripIds.length + l.overflowIds.length, n);
        assert.ok(l.filmstripIds.length + (l.overflowIds.length ? 1 : 0) <= 6);
      }
    }
  },
);

check('sharing without a sharer flag falls back to self as presenter', () => {
  const l = computeStageLayout({
    participants: people(3),
    view: 'speaker',
    sharing: true,
  });
  assert.equal(l.kind === 'share' && l.presenterId, 'self');
});

check('sharing=false ignores stale participant.sharing flags', () => {
  const l = computeStageLayout({
    participants: people(2, { p1: { sharing: true } }),
    view: 'speaker',
    sharing: false,
  });
  assert.equal(l.kind, 'pip');
});

check('invalid maxVisible values are clamped', () => {
  for (const maxVisible of [-5, 0, 1, Number.NaN, 99]) {
    const l = asGrid(
      computeStageLayout({
        participants: people(10),
        view: 'grid',
        sharing: false,
        maxVisible,
      }),
    );
    assert.ok(l.tileIds.includes('self'));
    assert.ok(l.tileIds.length >= 1);
  }
});

console.log(`\n${checks} checks passed`);
