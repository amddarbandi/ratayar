'use client';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl">
            📅
          </div>
          <h1 className="text-3xl font-bold text-white">تقویم</h1>
        </div>
        <p className="text-white/50">به‌زودی — ساعت، تاریخ شمسی/میلادی/قمری، اوقات شرعی</p>
      </div>
    </div>
  );
}
