"use client";
export default function Err({ reset }: { error: Error; reset: () => void }) {
  return <main className="px-5 py-10"><h1 className="title">This page hit a problem</h1><p className="mt-2 text-dhuan">Nothing was lost. Try again, and if it keeps failing check the server logs.</p><button className="btn mt-4" onClick={reset}>Try again</button></main>;
}
