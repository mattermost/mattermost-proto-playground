import DataSpillageDelivered from './DataSpillageDelivered';

// Hybrid: keep the inline summary (count + integration-leak flag) but offer the
// full recipient detail as a CSV download instead of an in-app modal. Removal uses
// the existing download-report confirm + a "generate the list first" notice.
export default function DeliveredHybridPage() {
  return <DataSpillageDelivered listMode="csv" removeFlow="download" />;
}
