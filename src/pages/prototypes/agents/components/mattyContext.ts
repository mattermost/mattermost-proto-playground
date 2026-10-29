export type MattyContextChip = {
  id: string;
  kind: 'channel' | 'thread';
  label: string;
};

export type MattyComposerChip = MattyContextChip & {
  /** Seeded from where the user is; swaps when they navigate. */
  auto?: boolean;
};
