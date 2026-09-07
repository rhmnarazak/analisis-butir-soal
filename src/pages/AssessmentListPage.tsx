import { useMemo, useState } from "react";
import { AssessmentCardGrid } from "../components/assessment/AssessmentCardGrid";
import { AssessmentTable } from "../components/assessment/AssessmentTable";
import { Breadcrumbs } from "../components/assessment/Breadcrumbs";
import { FilterBar } from "../components/assessment/FilterBar";
import { PageHeader } from "../components/assessment/PageHeader";
import { Pagination } from "../components/assessment/Pagination";
import { TabBar, type TabValue } from "../components/assessment/TabBar";
import { ViewToggle, type ViewMode } from "../components/assessment/ViewToggle";
import { usePageTitle } from "../hooks/usePageTitle";
import { useAssessmentStore } from "../state/AssessmentStore";
import type { AssessmentStatus } from "../types/assessment";

export function AssessmentListPage() {
  usePageTitle("Nilai Asesmen");
  const { assessments } = useAssessmentStore();
  const [activeTab, setActiveTab] = useState<TabValue>("Semua");
  const [view, setView] = useState<ViewMode>("table");

  const counts = useMemo(() => {
    return assessments.reduce(
      (acc, row) => {
        acc[row.status] += 1;
        return acc;
      },
      { "Perlu Dinilai": 0, "Siap Dipublikasi": 0, Selesai: 0 } as Record<
        AssessmentStatus,
        number
      >,
    );
  }, [assessments]);

  const filteredRows = useMemo(() => {
    if (activeTab === "Semua") return assessments;
    return assessments.filter((row) => row.status === activeTab);
  }, [activeTab, assessments]);

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <Breadcrumbs items={[{ label: "Asesmen" }, { label: "Nilai Asesmen" }]} />
        <PageHeader />
      </div>

      <div className="flex flex-col gap-5 rounded-[22px] bg-white p-5 shadow-[0_4px_10px_rgba(51,51,51,0.04)]">
        <FilterBar />

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <TabBar active={activeTab} onChange={setActiveTab} counts={counts} />
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>

        {view === "table" ? (
          <AssessmentTable rows={filteredRows} />
        ) : (
          <AssessmentCardGrid rows={filteredRows} />
        )}

        <Pagination total={filteredRows.length} page={1} pageSize={25} />
      </div>
    </>
  );
}
