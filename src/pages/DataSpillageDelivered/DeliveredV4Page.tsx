import DataSpillageDelivered from './DataSpillageDelivered';

// v4: latest design variation. Hybrid (CSV download, no modal) with the refined
// ready-state summary ("N users · N integrations") and copy vetted by the
// ux-copy-reviewer skill. Removal uses the download-report confirm + "list not
// generated" notice.
export default function DeliveredV4Page() {
  return (
    <DataSpillageDelivered listMode="csv" removeFlow="download" variant="v4" />
  );
}
