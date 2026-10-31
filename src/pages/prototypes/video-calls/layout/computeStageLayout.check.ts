/**
 * Assertion script for computeStageLayout (no test runner in this repo).
 * Run from the repo root:
 *   node --experimental-strip-types src/pages/prototypes/video-calls/layout/computeStageLayout.check.ts
 */
import assert from 'node:assert/strict';
import {
  computeStageLayout,
  gridRowSizes,
  OVERFLOW_CELL,
  stripRowSizes,
  visibleIds,
  type GridLayout,
  type LayoutParticipant,
  type ShareLayout,
  type SpeakerLayout,
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

function asSpeaker(layout: StageLayout): SpeakerLayout {
  assert.equal(layout.kind, 'speaker');
  return layout as SpeakerLayout;
}

function asShare(layout: StageLayout): ShareLayout {
  assert.equal(layout.kind, 'share');
  return layout as ShareLayout;
}

const shape = (rows: string[][]) => rows.map((r) => r.length);

let checks = 0;
function check(name: string, fn: () => void) {
  fn();
  checks += 1;
  console.log(`ok - ${name}`);
}

/** Grid view row shapes for 1..10 participants (everyone visible). */
const GRID_SHAPES: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [2, 1],
  4: [2, 2],
  5: [3, 2],
  6: [3, 3],
  7: [4, 3],
  8: [4, 4],
  9: [3, 3, 3],
  10: [4, 3, 3],
};

/** Speaker view (3+) strip row shapes: N-1 others above the featured tile. */
const STRIP_SHAPES: Record<number, number[]> = {
  3: [2],
  4: [3],
  5: [4],
  6: [5],
  7: [6],
  8: [7],
  9: [8],
  10: [9],
};

check('0 participants → empty grid', () => {
  const g = asGrid(
    computeStageLayout({ participants: [], view: 'speaker', sharing: false }),
  );
  assert.deepEqual([g.rows, g.cols, g.tileIds.length], [[], 0, 0]);
});

check('1 participant → self alone (both views)', () => {
  for (const view of ['speaker', 'grid'] as const) {
    const g = asGrid(
      computeStageLayout({ participants: people(1), view, sharing: false }),
    );
    assert.deepEqual(g.rows, [['self']]);
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

check('gridRowSizes / stripRowSizes tables', () => {
  for (let n = 1; n <= 10; n += 1) {
    assert.deepEqual(gridRowSizes(n), GRID_SHAPES[n], `grid n=${n}`);
  }
  for (let n = 3; n <= 10; n += 1) {
    assert.deepEqual(stripRowSizes(n - 1), STRIP_SHAPES[n], `strip n=${n}`);
  }
  // Rows sum to the cell count and never differ by more than one.
  for (let n = 1; n <= 12; n += 1) {
    for (const sizes of [gridRowSizes(n), stripRowSizes(n)]) {
      assert.equal(
        sizes.reduce((a, b) => a + b, 0),
        n,
      );
      assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `n=${n}`);
    }
  }
});

check('grid view 1..10: row shapes, join order, all visible', () => {
  for (let n = 1; n <= 10; n += 1) {
    const g = asGrid(
      computeStageLayout({
        participants: people(n),
        view: 'grid',
        sharing: false,
      }),
    );
    assert.deepEqual(shape(g.rows), GRID_SHAPES[n], `n=${n}`);
    assert.deepEqual(g.rows.flat(), IDS.slice(0, n));
    assert.deepEqual(g.tileIds, IDS.slice(0, n));
    assert.deepEqual(g.overflowIds, []);
    assert.equal(g.cols, Math.max(...GRID_SHAPES[n]));
  }
});

check('grid view 3 = 2 on top + 1 below (Figma)', () => {
  const g = asGrid(
    computeStageLayout({
      participants: people(3),
      view: 'grid',
      sharing: false,
    }),
  );
  assert.deepEqual(g.rows, [['self', 'p1'], ['p2']]);
});

check('grid view 10 with maxVisible 9 → 8 tiles + chip, 3x3', () => {
  const g = asGrid(
    computeStageLayout({
      participants: people(10),
      view: 'grid',
      sharing: false,
      maxVisible: 9,
    }),
  );
  assert.equal(g.tileIds.length, 8);
  assert.equal(g.overflowIds.length, 2);
  assert.deepEqual(shape(g.rows), [3, 3, 3]);
  assert.equal(g.rows.flat().slice(-1)[0], OVERFLOW_CELL);
  assert.ok(g.tileIds.includes('self'));
});

check('speaker view 3..10: featured + strip shapes, self in strip', () => {
  for (let n = 3; n <= 10; n += 1) {
    const s = asSpeaker(
      computeStageLayout({
        participants: people(n),
        view: 'speaker',
        sharing: false,
        activeSpeakerId: 'p2',
      }),
    );
    assert.equal(s.featuredId, 'p2', `n=${n}`);
    assert.deepEqual(shape(s.stripRows), STRIP_SHAPES[n], `n=${n}`);
    assert.ok(s.stripIds.includes('self'));
    assert.ok(!s.stripIds.includes('p2'));
    assert.deepEqual(s.stripRows.flat(), s.stripIds);
    assert.deepEqual(
      s.stripIds,
      IDS.slice(0, n).filter((id) => id !== 'p2'),
    );
    assert.equal(s.overflowIds.length, 0);
  }
});

check('speaker strip overflow with maxStrip 4 → 3 tiles + chip', () => {
  const s = asSpeaker(
    computeStageLayout({
      participants: people(10),
      view: 'speaker',
      sharing: false,
      activeSpeakerId: 'p7',
      maxStrip: 4,
    }),
  );
  assert.equal(s.featuredId, 'p7');
  assert.deepEqual(shape(s.stripRows), [4]);
  assert.equal(s.stripRows[0].slice(-1)[0], OVERFLOW_CELL);
  assert.ok(s.stripIds.includes('self'));
  assert.equal(s.stripIds.length + s.overflowIds.length + 1, 10);
});

check('self is never featured', () => {
  const s = asSpeaker(
    computeStageLayout({
      participants: people(4),
      view: 'speaker',
      sharing: false,
      activeSpeakerId: 'self',
    }),
  );
  assert.notEqual(s.featuredId, 'self');
});

check('self never dropped with overflow, wherever self sits', () => {
  const list = people(10).reverse(); // self last
  for (const view of ['speaker', 'grid'] as const) {
    for (const cap of [2, 3, 5, 9]) {
      const l = computeStageLayout({
        participants: list,
        view,
        sharing: false,
        maxVisible: cap,
        maxStrip: cap,
        activeSpeakerId: 'p9',
      });
      assert.ok(visibleIds(l).includes('self'), `${view} cap=${cap}`);
      if (l.kind === 'grid' || l.kind === 'speaker') {
        assert.ok(!l.overflowIds.includes('self'));
      }
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
      computeStageLayout({ participants: list, view: 'grid', sharing: false }),
    );
    assert.equal(g.tileIds.length + g.overflowIds.length, 10);
    assert.deepEqual(shape(g.rows), [4, 3, 3]);
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
    const opts = { view: 'grid', sharing: false, maxVisible: 9 } as const;
    let prev = computeStageLayout({
      ...opts,
      participants: base,
      activeSpeakerId: 'p1',
    });
    const first = asGrid(prev).tileIds;
    const same = asGrid(
      computeStageLayout({
        ...opts,
        participants: base,
        activeSpeakerId: 'p3',
        previous: prev,
      }),
    );
    assert.deepEqual(same.tileIds, first);
    const hidden = asGrid(prev).overflowIds[0];
    prev = computeStageLayout({
      ...opts,
      participants: base,
      activeSpeakerId: hidden,
      previous: prev,
    });
    const promoted = asGrid(prev).tileIds;
    assert.ok(promoted.includes(hidden));
    assert.ok(promoted.includes('self'));
    assert.equal(promoted.filter((id) => !first.includes(id)).length, 1);
    const again = asGrid(
      computeStageLayout({
        ...opts,
        participants: base,
        activeSpeakerId: hidden,
        previous: prev,
      }),
    );
    assert.deepEqual(again.tileIds, promoted);
  },
);

check('speaker view: speaker change swaps featured with its strip slot', () => {
  const base = people(6);
  const a = asSpeaker(
    computeStageLayout({
      participants: base,
      view: 'speaker',
      sharing: false,
      activeSpeakerId: 'p1',
    }),
  );
  assert.deepEqual(a.stripIds, ['self', 'p2', 'p3', 'p4', 'p5']);
  const b = asSpeaker(
    computeStageLayout({
      participants: base,
      view: 'speaker',
      sharing: false,
      activeSpeakerId: 'p4',
      previous: a,
    }),
  );
  assert.equal(b.featuredId, 'p4');
  assert.deepEqual(b.stripIds, ['self', 'p2', 'p3', 'p1', 'p5']);
  const c = asSpeaker(
    computeStageLayout({
      participants: base,
      view: 'speaker',
      sharing: false,
      activeSpeakerId: 'p4',
      previous: b,
    }),
  );
  assert.deepEqual(c, b);
  // No speaker → previous featured kept.
  const d = asSpeaker(
    computeStageLayout({
      participants: base,
      view: 'speaker',
      sharing: false,
      previous: c,
    }),
  );
  assert.equal(d.featuredId, 'p4');
});

check('speaker view: someone joins → appended to strip, others stay', () => {
  const a = asSpeaker(
    computeStageLayout({
      participants: people(5),
      view: 'speaker',
      sharing: false,
      activeSpeakerId: 'p2',
    }),
  );
  const b = asSpeaker(
    computeStageLayout({
      participants: people(6),
      view: 'speaker',
      sharing: false,
      previous: a,
    }),
  );
  assert.equal(b.featuredId, 'p2');
  assert.deepEqual(b.stripIds, [...a.stripIds, 'p5']);
});

check('sharing 1..10 → filmstrip cells ≤ 6, presenter + self visible', () => {
  for (let n = 1; n <= 10; n += 1) {
    const sharer = n > 1 ? 'p1' : 'self';
    for (const view of ['speaker', 'grid'] as const) {
      const s = asShare(
        computeStageLayout({
          participants: people(n, { [sharer]: { sharing: true } }),
          view,
          sharing: true,
        }),
      );
      assert.equal(s.presenterId, sharer);
      assert.ok(s.filmstripIds.includes('self'));
      assert.ok(s.filmstripIds.includes(sharer));
      assert.equal(s.filmstripIds.length + s.overflowIds.length, n);
      // ≤ 6 people: everyone; 7+: 5 tiles + "+N" chip.
      const cells = s.filmstripIds.length + (s.overflowIds.length ? 1 : 0);
      assert.equal(cells, Math.min(n, 6), `n=${n}`);
      assert.equal(s.overflowIds.length, n > 6 ? n - 5 : 0);
    }
  }
});

check('sharing without a sharer flag falls back to self as presenter', () => {
  const s = asShare(
    computeStageLayout({
      participants: people(3),
      view: 'speaker',
      sharing: true,
    }),
  );
  assert.equal(s.presenterId, 'self');
});

check('sharing=false ignores stale participant.sharing flags', () => {
  const l = computeStageLayout({
    participants: people(2, { p1: { sharing: true } }),
    view: 'speaker',
    sharing: false,
  });
  assert.equal(l.kind, 'pip');
});

check('invalid caps are clamped', () => {
  for (const cap of [-5, 0, 1, Number.NaN, 99]) {
    for (const view of ['speaker', 'grid'] as const) {
      const l = computeStageLayout({
        participants: people(10),
        view,
        sharing: false,
        maxVisible: cap,
        maxStrip: cap,
      });
      assert.ok(visibleIds(l).includes('self'));
    }
  }
});

console.log(`\n${checks} checks passed`);
