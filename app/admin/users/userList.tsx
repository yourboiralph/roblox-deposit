"use client";

import { useActionState, useState } from "react";
import { resetUserCreditsAction, type ResetUserActionState } from "./actions";

type User = { id: string; username: string | null };

export default function UserList({ users }: { users: User[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [state, action, pending] = useActionState<ResetUserActionState, FormData>(
    resetUserCreditsAction,
    null
  );

  return (
    <ul style={{ marginTop: 10, listStyle: "none", padding: 0 }}>
      {users.map((u) => (
        <li
          key={u.id}
          style={{
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            marginBottom: 8,
            cursor: "pointer",
          }}
        >
          <div
            onClick={() =>
              setSelected(selected === u.username ? null : u.username)
            }
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <b>{u.username ?? "(no username)"}</b>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              {selected === u.username ? "▲" : "▼"}
            </span>
          </div>

          {selected === u.username && (
            <div style={{ marginTop: 10 }}>
              <form action={action}>
                <input type="hidden" name="username" value={u.username ?? ""} />
                <button
                  disabled={pending}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "1px solid #f87171",
                    background: "#fef2f2",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {pending ? "Resetting..." : "🔄 Reset credits & timer"}
                </button>
              </form>

              {state?.username === u.username && (
                <div style={{ marginTop: 6, fontSize: 13 }}>
                  {state.success ? (
                    <span style={{ color: "#16a34a" }}>✅ Credits reset to 3</span>
                  ) : (
                    <span style={{ color: "#dc2626" }}>❌ {state.error}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}