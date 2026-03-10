"use client";

import { useActionState, useState } from "react";
import {
  resetUserCreditsAction,
  updateUserNicknameAction,
  type ResetUserActionState,
  type NicknameActionState,
} from "./actions";

type User = { id: string; username: string | null; nickname: string | null };

export default function UserList({ users }: { users: User[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [editingNickname, setEditingNickname] = useState<string | null>(null);

  const [state, action, pending] = useActionState<ResetUserActionState, FormData>(
    resetUserCreditsAction,
    null
  );

  const [nicknameState, nicknameAction, nicknamePending] = useActionState<NicknameActionState, FormData>(
    updateUserNicknameAction,
    null
  );

  return (
    <ul
      style={{
        marginTop: 10,
        listStyle: "none",
        padding: 0,
        display: "grid",
        gap: 12,
      }}
    >
      {users.map((u) => (
        <li
          key={u.id}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 18,
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            overflow: "hidden",
          }}
        >
          <div
            onClick={() =>
              setSelected(selected === u.username ? null : u.username)
            }
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: "16px 18px",
              cursor: "pointer",
              background:
                selected === u.username
                  ? "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(56,189,248,0.06))"
                  : "transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, #6366f1, #38bdf8)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                  boxShadow: "0 8px 18px rgba(99,102,241,0.22)",
                }}
              >
                {(u.username ?? "?").slice(0, 1).toUpperCase()}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#0f172a",
                    fontSize: 15,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {u.username ?? "(no username)"}
                  {u.nickname ? (
                    <span style={{ color: "#64748b", fontWeight: 600 }}>
                      {" "}({u.nickname})
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginTop: 2,
                  }}
                >
                  Click to manage user credits and nickname
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: 12,
                color: "#64748b",
                padding: "6px 10px",
                borderRadius: 999,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {selected === u.username ? "▲ Collapse" : "▼ Expand"}
            </span>
          </div>

          {selected === u.username && (
            <div
              style={{
                padding: "0 18px 18px",
                borderTop: "1px solid #eef2f7",
                background: "rgba(248,250,252,0.65)",
              }}
            >
              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: "1px solid #dbeafe",
                    background: "linear-gradient(180deg, #fff 0%, #f8fbff 100%)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#1d4ed8",
                          fontWeight: 700,
                        }}
                      >
                        Nickname
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          marginTop: 2,
                        }}
                      >
                        Current: {u.nickname ? u.nickname : "No nickname yet"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingNickname(
                          editingNickname === u.username ? null : u.username
                        )
                      }
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid #93c5fd",
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {editingNickname === u.username
                        ? "Close"
                        : u.nickname
                        ? "Edit nickname"
                        : "Add nickname"}
                    </button>
                  </div>

                  {editingNickname === u.username && (
                    <form
                      action={nicknameAction}
                      style={{
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      <input type="hidden" name="username" value={u.username ?? ""} />

                      <input
                        name="nickname"
                        defaultValue={u.nickname ?? ""}
                        placeholder="Enter nickname"
                        style={{
                          padding: "12px 14px",
                          border: "1px solid #cbd5e1",
                          borderRadius: 12,
                          fontSize: 14,
                          outline: "none",
                          background: "#ffffff",
                          color: "#0f172a",
                        }}
                      />

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          disabled={nicknamePending}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: "1px solid #2563eb",
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "#ffffff",
                            cursor: nicknamePending ? "not-allowed" : "pointer",
                            fontSize: 13,
                            fontWeight: 800,
                            boxShadow: "0 6px 18px rgba(37,99,235,0.18)",
                          }}
                        >
                          {nicknamePending ? "Saving..." : "Save nickname"}
                        </button>
                      </div>
                    </form>
                  )}

                  {nicknameState?.username === u.username && (
                    <div style={{ marginTop: 10, fontSize: 13 }}>
                      {nicknameState.success ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "10px 12px",
                            borderRadius: 12,
                            background: "#ecfdf5",
                            border: "1px solid #bbf7d0",
                            color: "#166534",
                            fontWeight: 700,
                          }}
                        >
                          ✅ Nickname updated
                          {nicknameState.nickname ? `: ${nicknameState.nickname}` : " (cleared)"}
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "10px 12px",
                            borderRadius: 12,
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            color: "#dc2626",
                            fontWeight: 700,
                          }}
                        >
                          ❌ {nicknameState.error}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: "1px solid #fee2e2",
                    background: "linear-gradient(180deg, #fff 0%, #fff7f7 100%)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: "#7f1d1d",
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    Reset this user
                  </div>

                  <form action={action}>
                    <input type="hidden" name="username" value={u.username ?? ""} />
                    <button
                      disabled={pending}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 12,
                        border: "1px solid #f87171",
                        background: pending
                          ? "linear-gradient(135deg, #fca5a5, #f87171)"
                          : "linear-gradient(135deg, #fff1f2, #fee2e2)",
                        color: "#dc2626",
                        cursor: pending ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 800,
                        boxShadow: "0 6px 18px rgba(239,68,68,0.10)",
                      }}
                    >
                      {pending ? "Resetting..." : "🔄 Reset credits & timer"}
                    </button>
                  </form>

                  {state?.username === u.username && (
                    <div style={{ marginTop: 10, fontSize: 13 }}>
                      {state.success ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "10px 12px",
                            borderRadius: 12,
                            background: "#ecfdf5",
                            border: "1px solid #bbf7d0",
                            color: "#166534",
                            fontWeight: 700,
                          }}
                        >
                          ✅ Credits reset to 3
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "10px 12px",
                            borderRadius: 12,
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            color: "#dc2626",
                            fontWeight: 700,
                          }}
                        >
                          ❌ {state.error}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}