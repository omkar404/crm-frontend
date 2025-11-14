import toast from "react-hot-toast";

export const successToast = (msg) =>
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-slide-in" : "animate-slide-out"
        } bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-300 flex items-start gap-3 w-[320px]`}
      >
        <div className="text-2xl">✅</div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Success</p>
          <p className="text-xs opacity-90">{msg}</p>
        </div>
      </div>
    ),
    { duration: 3000 }
  );

export const errorToast = (msg) =>
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-slide-in" : "animate-slide-out"
        } bg-gradient-to-r from-rose-500 to-red-600 text-white px-4 py-3 rounded-xl shadow-lg border border-red-300 flex items-start gap-3 w-[320px]`}
      >
        <div className="text-2xl">❌</div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Error</p>
          <p className="text-xs opacity-90">{msg}</p>
        </div>
      </div>
    ),
    { duration: 3000 }
  );
