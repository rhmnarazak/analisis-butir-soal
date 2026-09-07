import { ChevronDown, HelpCircle } from "lucide-react";

const ACCOUNT_NAME = "Abdul Razak";

export function Navbar() {
  return (
    <header className="flex h-[75px] shrink-0 items-center justify-between border-b border-tertiary-200 bg-white px-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-tertiary-800">SMAN 25 Jakarta Barat</span>
        <span className="text-lg font-semibold text-tertiary-900">
          Halo, selamat datang {ACCOUNT_NAME} 👋
        </span>
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          className="flex items-center gap-2 rounded-[10px] border border-primary-500 px-3 py-2 text-sm font-semibold text-primary-500"
        >
          Bantuan
          <HelpCircle size={16} />
        </button>

        <div className="h-[34px] w-px bg-tertiary-200" />

        <button type="button" className="flex items-center gap-2 rounded">
          <img
            src="/images/avatar-user.png"
            alt={ACCOUNT_NAME}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="flex flex-col items-start">
            <span className="text-sm font-bold text-tertiary-800">{ACCOUNT_NAME}</span>
            <span className="text-xs text-tertiary-500">Admin</span>
          </span>
          <ChevronDown size={16} className="text-tertiary-500" />
        </button>
      </div>
    </header>
  );
}
