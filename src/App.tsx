import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { SnackbarHost } from "./components/common/SnackbarHost";
import { AnalisisDetailPage } from "./pages/AnalisisDetailPage";
import { AssessmentDetailPage } from "./pages/AssessmentDetailPage";
import { AssessmentListPage } from "./pages/AssessmentListPage";
import { SoalDetailPage } from "./pages/SoalDetailPage";
import { SoalPerluPerhatianPage } from "./pages/SoalPerluPerhatianPage";
import { AssessmentStoreProvider } from "./state/AssessmentStore";

function App() {
  return (
    <AssessmentStoreProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<AssessmentListPage />} />
          <Route path="asesmen/:id" element={<AssessmentDetailPage />} />
          <Route path="asesmen/:id/analisis-butir-soal" element={<AnalisisDetailPage />} />
        </Route>
        {/* Full page, no sidebar/navbar — matches Figma node 5986-73118. */}
        <Route path="asesmen/:id/analisis-butir-soal/soal/:no" element={<SoalDetailPage />} />
        {/* Full page, no sidebar/navbar — matches Figma node 6028-117879. */}
        <Route
          path="asesmen/:id/analisis-butir-soal/soal-perlu-perhatian"
          element={<SoalPerluPerhatianPage />}
        />
      </Routes>
      <SnackbarHost />
    </AssessmentStoreProvider>
  );
}

export default App;
