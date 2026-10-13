"use client";

import { useOptimistic, useTransition } from "react";
import { togglePublished } from "../../../actions";

export function PublishToggle({ typeKey, id, published }: { typeKey: string; id: string; published: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(published);
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await togglePublished(typeKey, id, !optimistic);
        })
      }
      className="group inline-flex items-center gap-2 text-xs font-medium"
    >
      <span
        className={`relative h-5 w-9 rounded-full transition ${optimistic ? "bg-emerald-500" : "bg-slate-300"} ${pending ? "opacity-60" : ""}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition ${optimistic ? "translate-x-4" : ""}`}
        />
      </span>
      <span className={optimistic ? "text-emerald-700" : "text-slate-500"}>{optimistic ? "Published" : "Draft"}</span>
    </button>
  );
}
