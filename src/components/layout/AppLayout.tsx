import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto px-10 py-6">
          <div className="mx-auto flex max-w-[1147px] flex-col gap-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
