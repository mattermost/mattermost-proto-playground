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
  for (const view of ['speaker', 'speaker-side', 'grid'] as const) {
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
    for (const view of ['speaker', 'speaker-side', 'grid'] as const) {
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

check('speaker view keeps the strip on top', () => {
  const s = asSpeaker(
    computeStageLayout({
      participants: people(4),
      view: 'speaker',
      sharing: false,
    }),
  );
  assert.equal(s.strip, 'top');
});

check('speaker-side 1 participant → self alone in a grid', () => {
  const g = asGrid(
    computeStageLayout({
      participants: people(1),
      view: 'speaker-side',
      sharing: false,
    }),
  );
  assert.deepEqual(g.rows, [['self']]);
});

check(
  'speaker-side 2 participants → remote featured, self in the column (no PiP)',
  () => {
    for (const speaker of [undefined, 'p1', 'self']) {
      const s = asSpeaker(
        computeStageLayout({
          participants: people(2),
          view: 'speaker-side',
          sharing: false,
          activeSpeakerId: speaker,
        }),
      );
      assert.equal(s.strip, 'side');
      assert.equal(s.featuredId, 'p1');
      assert.deepEqual(s.stripIds, ['self']);
      assert.deepEqual(s.stripRows, [['self']]);
      assert.deepEqual(s.overflowIds, []);
    }
    // Self listed first or last makes no difference.
    const s = asSpeaker(
      computeStageLayout({
        participants: people(2).reverse(),
        view: 'speaker-side',
        sharing: false,
      }),
    );
    assert.deepEqual([s.featuredId, s.stripIds], ['p1', ['self']]);
  },
);

check(
  'speaker-side 2..10: membership, one column, self visible, never featured',
  () => {
    for (let n = 2; n <= 10; n += 1) {
      for (const speaker of [undefined, 'self', IDS[n - 1]]) {
        const s = asSpeaker(
          computeStageLayout({
            participants: people(n),
            view: 'speaker-side',
            sharing: false,
            activeSpeakerId: speaker,
          }),
        );
        const label = `n=${n} speaker=${speaker}`;
        assert.equal(s.strip, 'side', label);
        assert.notEqual(s.featuredId, 'self', label);
        assert.equal(
          s.featuredId,
          speaker && speaker !== 'self' ? speaker : 'p1',
          label,
        );
        assert.ok(s.stripIds.includes('self'), label);
        assert.ok(!s.stripIds.includes(s.featuredId), label);
        assert.deepEqual(shape(s.stripRows), [n - 1], label);
        assert.deepEqual(s.stripRows.flat(), s.stripIds, label);
        assert.deepEqual(
          s.stripIds,
          IDS.slice(0, n).filter((id) => id !== s.featuredId),
          label,
        );
        assert.equal(s.overflowIds.length, 0, label);
        // Same membership as speaker view (3+).
        if (n >= 3) {
          const top = asSpeaker(
            computeStageLayout({
              participants: people(n),
              view: 'speaker',
              sharing: false,
              activeSpeakerId: speaker,
            }),
          );
          assert.deepEqual(
            [top.featuredId, top.stripIds],
            [s.featuredId, s.stripIds],
            label,
          );
        }
      }
    }
  },
);

check(
  'speaker-side: speaker change swaps, membership sticky across views',
  () => {
    const base = people(6);
    const a = asSpeaker(
      computeStageLayout({
        participants: base,
        view: 'speaker-side',
        sharing: false,
        activeSpeakerId: 'p1',
      }),
    );
    const b = asSpeaker(
      computeStageLayout({
        participants: base,
        view: 'speaker-side',
        sharing: false,
        activeSpeakerId: 'p4',
        previous: a,
      }),
    );
    assert.equal(b.featuredId, 'p4');
    assert.deepEqual(b.stripIds, ['self', 'p2', 'p3', 'p1', 'p5']);
    // Switching to the top strip keeps the arrangement (and back again).
    const c = asSpeaker(
      computeStageLayout({
        participants: base,
        view: 'speaker',
        sharing: false,
        previous: b,
      }),
    );
    assert.deepEqual(
      [c.strip, c.featuredId, c.stripIds],
      ['top', 'p4', b.stripIds],
    );
    const d = asSpeaker(
      computeStageLayout({
        participants: base,
        view: 'speaker-side',
        sharing: false,
        previous: c,
      }),
    );
    assert.deepEqual({ ...d, strip: 'side' }, { ...c, strip: 'side' });
    // From the 1:1 PiP the featured person carries over.
    const pip = computeStageLayout({
      participants: people(2),
      view: 'speaker',
      sharing: false,
    });
    const e = asSpeaker(
      computeStageLayout({
        participants: people(2),
        view: 'speaker-side',
        sharing: false,
        previous: pip,
      }),
    );
    assert.equal(e.featuredId, 'p1');
  },
);

check(
  'speaker-side overflow with maxStrip 4 → 3 tiles + chip in the column',
  () => {
    const s = asSpeaker(
      computeStageLayout({
        participants: people(10),
        view: 'speaker-side',
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
  },
);

check('speaker-side sharing 1..10 → share layout wins', () => {
  for (let n = 1; n <= 10; n += 1) {
    const sharer = n > 1 ? 'p1' : 'self';
    const s = asShare(
      computeStageLayout({
        participants: people(n, { [sharer]: { sharing: true } }),
        view: 'speaker-side',
        sharing: true,
      }),
    );
    assert.equal(s.presenterId, sharer);
    assert.ok(s.filmstripIds.includes('self'));
    assert.equal(s.filmstripIds.length + s.overflowIds.length, n);
  }
});

// ── Pin ──────────────────────────────────────────────────────────────────────

check('pin 2..10, both speaker views: pinned remote / self is featured', () => {
  for (let n = 2; n <= 10; n += 1) {
    for (const view of ['speaker', 'speaker-side'] as const) {
      for (const pinned of ['self', IDS[n - 1]]) {
        // Someone else is speaking: the pin still wins.
        const speaker = n > 2 ? 'p1' : undefined;
        const label = `n=${n} view=${view} pinned=${pinned}`;
        const l = computeStageLayout({
          participants: people(n),
          view,
          sharing: false,
          activeSpeakerId: speaker,
          pinnedId: pinned,
        });
        if (n === 2 && view === 'speaker' && pinned !== 'self') {
          // 1:1 PiP: the other person is already main, so pinning them is a no-op.
          assert.deepEqual(l, { kind: 'pip', mainId: 'p1', pipId: 'self' });
          continue;
        }
        const s = asSpeaker(l);
        assert.equal(s.featuredId, pinned, label);
        assert.equal(
          s.strip,
          view === 'speaker' && n > 2 ? 'top' : 'side',
          label,
        );
        assert.ok(!s.stripIds.includes(pinned), label);
        assert.deepEqual(
          s.stripIds,
          IDS.slice(0, n).filter((id) => id !== pinned),
          label,
        );
        assert.deepEqual(shape(s.stripRows), [n - 1], label);
        assert.ok(visibleIds(s).includes('self'), label);
      }
    }
  }
});

check('pin 2 people, speaker view, self pinned → side shape, not a PiP', () => {
  const s = asSpeaker(
    computeStageLayout({
      participants: people(2),
      view: 'speaker',
      sharing: false,
      pinnedId: 'self',
    }),
  );
  assert.deepEqual(
    [s.strip, s.featuredId, s.stripIds],
    ['side', 'self', ['p1']],
  );
  // Unpinned again → back to the PiP.
  const back = computeStageLayout({
    participants: people(2),
    view: 'speaker',
    sharing: false,
    previous: s,
  });
  assert.deepEqual(back, { kind: 'pip', mainId: 'p1', pipId: 'self' });
});

check('pin holds through speaker changes; swap keeps the strip stable', () => {
  const base = people(6);
  for (const view of ['speaker', 'speaker-side'] as const) {
    const a = asSpeaker(
      computeStageLayout({
        participants: base,
        view,
        sharing: false,
        activeSpeakerId: 'p1',
      }),
    );
    // Pin a strip tile: it swaps with the featured speaker.
    const b = asSpeaker(
      computeStageLayout({
        participants: base,
        view,
        sharing: false,
        activeSpeakerId: 'p1',
        pinnedId: 'p4',
        previous: a,
      }),
    );
    assert.equal(b.featuredId, 'p4', view);
    assert.deepEqual(b.stripIds, ['self', 'p2', 'p3', 'p1', 'p5'], view);
    let prev: StageLayout = b;
    for (const speaker of ['p2', 'p5', 'p1', undefined]) {
      const c = asSpeaker(
        computeStageLayout({
          participants: base,
          view,
          sharing: false,
          activeSpeakerId: speaker,
          pinnedId: 'p4',
          previous: prev,
        }),
      );
      assert.equal(c.featuredId, 'p4', `${view} speaker=${speaker}`);
      assert.deepEqual(c.stripIds, b.stripIds, `${view} speaker=${speaker}`);
      prev = c;
    }
    // Re-pin someone else: replaces the pin, the old pin takes their slot.
    const d = asSpeaker(
      computeStageLayout({
        participants: base,
        view,
        sharing: false,
        activeSpeakerId: 'p2',
        pinnedId: 'p2',
        previous: prev,
      }),
    );
    assert.equal(d.featuredId, 'p2');
    assert.deepEqual(d.stripIds, ['self', 'p4', 'p3', 'p1', 'p5']);
  }
});

check(
  'pin self then unpin: self back in its strip slot, a remote featured',
  () => {
    const base = people(5);
    const a = asSpeaker(
      computeStageLayout({
        participants: base,
        view: 'speaker',
        sharing: false,
        activeSpeakerId: 'p2',
      }),
    );
    const b = asSpeaker(
      computeStageLayout({
        participants: base,
        view: 'speaker',
        sharing: false,
        activeSpeakerId: 'p2',
        pinnedId: 'self',
        previous: a,
      }),
    );
    assert.equal(b.featuredId, 'self');
    assert.deepEqual(b.stripIds, ['p2', 'p1', 'p3', 'p4']);
    const c = asSpeaker(
      computeStageLayout({
        participants: base,
        view: 'speaker',
        sharing: false,
        activeSpeakerId: 'p2',
        previous: b,
      }),
    );
    assert.equal(c.featuredId, 'p2');
    assert.deepEqual(c.stripIds, ['self', 'p1', 'p3', 'p4']);
  },
);

check(
  'pin survives speaker ↔ speaker-side and a round trip through grid',
  () => {
    const base = people(7);
    const opts = { participants: base, sharing: false, pinnedId: 'p5' };
    const a = asSpeaker(computeStageLayout({ ...opts, view: 'speaker' }));
    const b = asSpeaker(
      computeStageLayout({ ...opts, view: 'speaker-side', previous: a }),
    );
    assert.deepEqual([b.featuredId, b.stripIds], [a.featuredId, a.stripIds]);
    const g = asGrid(
      computeStageLayout({ ...opts, view: 'grid', previous: b }),
    );
    assert.deepEqual(g.tileIds, IDS.slice(0, 7));
    const c = asSpeaker(
      computeStageLayout({
        ...opts,
        view: 'speaker',
        activeSpeakerId: 'p2',
        previous: g,
      }),
    );
    assert.equal(c.featuredId, 'p5');
  },
);

check('pin ignored in grid view and while sharing', () => {
  for (let n = 2; n <= 10; n += 1) {
    for (const pinned of ['self', IDS[n - 1]]) {
      const g = asGrid(
        computeStageLayout({
          participants: people(n),
          view: 'grid',
          sharing: false,
          pinnedId: pinned,
        }),
      );
      assert.deepEqual(g.tileIds, IDS.slice(0, n), `grid n=${n}`);
      for (const view of ['speaker', 'speaker-side', 'grid'] as const) {
        const withPin = computeStageLayout({
          participants: people(n, { p1: { sharing: true } }),
          view,
          sharing: true,
          pinnedId: pinned,
        });
        const without = computeStageLayout({
          participants: people(n, { p1: { sharing: true } }),
          view,
          sharing: true,
        });
        assert.deepEqual(withPin, without, `share n=${n} ${view}`);
      }
    }
  }
});

check('pin of a non-existent id (or null) is ignored', () => {
  for (let n = 2; n <= 10; n += 1) {
    for (const view of ['speaker', 'speaker-side', 'grid'] as const) {
      const plain = computeStageLayout({
        participants: people(n),
        view,
        sharing: false,
        activeSpeakerId: IDS[n - 1],
      });
      for (const pinned of ['nobody', 'p11', '', null]) {
        assert.deepEqual(
          computeStageLayout({
            participants: people(n),
            view,
            sharing: false,
            activeSpeakerId: IDS[n - 1],
            pinnedId: pinned,
          }),
          plain,
          `n=${n} ${view} pinned=${pinned}`,
        );
      }
    }
  }
});

console.log(`\n${checks} checks passed`);
