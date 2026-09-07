import type { Assessment } from "../../types/assessment";
import { AssessmentCard } from "./AssessmentCard";

export function AssessmentCardGrid({ rows }: { rows: Assessment[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row, index) => (
        <AssessmentCard key={row.id} row={row} index={index} />
      ))}
    </div>
  );
}
