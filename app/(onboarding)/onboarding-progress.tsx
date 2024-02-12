export default function OnboardingProgress({ step = 1 }: { step?: number }) {
  return (
    <div className="px-4 pt-12 pb-8">
      <div className="max-w-md mx-auto w-full">
        <div className="relative">
          <div
            className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-slate-200 dark:bg-slate-700"
            aria-hidden="true"
          ></div>
          <ul className="relative flex justify-between w-full">
            <li>
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 1 ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
              >
                1
              </div>
            </li>
            <li>
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 2 ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
              >
                2
              </div>
            </li>
            <li>
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 3 ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
              >
                3
              </div>
            </li>
            <li>
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 4 ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
              >
                4
              </div>
            </li>
            <li>
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 5 ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
              >
                5
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
