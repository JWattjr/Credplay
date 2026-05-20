import FeedShell from "@/components/feed/FeedShell";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-20 mx-2 mt-3 flex items-center justify-between rounded-[8px] border border-white/10 bg-black/80 p-4 shadow-sm backdrop-blur sm:hidden">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-brand-secondary text-sm font-black text-black">
            CP
          </div>
          <span className="ml-3 text-lg font-black tracking-tight text-white">CredPlay</span>
        </div>
        <ThemeToggle />
      </div>

      <FeedShell />
    </div>
  );
}
