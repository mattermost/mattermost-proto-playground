import styles from './ExampleFlow.module.scss';

// ----------------------------------------------------------------
// ExampleFlow — a starter template for a prototype page.
//
// To build a new flow:
//   1. Duplicate this folder and rename it.
//   2. Register the new page in src/router/index.tsx.
//   3. Replace the placeholder content with your Figma components.
// ----------------------------------------------------------------

export default function ExampleFlow() {
  return (
    <div className={styles['example-flow']}>
      <div className={styles['example-flow__canvas']}>
        <p className={styles['example-flow__hint']}>
          Replace this with your prototype content.
          <br />
          Drop Figma components in here to build the flow.
        </p>
      </div>
    </div>
  );
}
