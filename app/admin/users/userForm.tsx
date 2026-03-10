"use client";

import { useActionState } from "react";
import { addAllowedUserAction, type UserActionState } from "./actions";

export default function UserForm() {
  const [state, action, pending] = useActionState<UserActionState, FormData>(
    addAllowedUserAction,
    null
  );

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)",
        boxShadow: "0 8px 30px rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 4,
            letterSpacing: "-0.02em",
          }}
        >
          Add allowed user
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#64748b",
          }}
        >
          Enter a Roblox username to add it to the approved list.
        </div>
      </div>

      <form
        action={action}
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        <input
          name="username"
          placeholder="Username (e.g. ReynaldoBajaJr)"
          style={{
            padding: "14px 16px",
            border: "1px solid #cbd5e1",
            borderRadius: 14,
            fontSize: 14,
            outline: "none",
            background: "#ffffff",
            color: "#0f172a",
            boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)",
          }}
        />

        <button
          disabled={pending}
          style={{
            padding: "13px 16px",
            borderRadius: 14,
            border: "1px solid #4f46e5",
            background: pending
              ? "linear-gradient(135deg, #818cf8, #6366f1)"
              : "linear-gradient(135deg, #6366f1, #2563eb)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 14,
            cursor: pending ? "not-allowed" : "pointer",
            boxShadow: "0 10px 24px rgba(79,70,229,0.28)",
            transition: "all 0.2s ease",
          }}
        >
          {pending ? "Adding..." : "Add Allowed User"}
        </button>
      </form>

      {state && (
        <div style={{ marginTop: 14 }}>
          {state.success ? (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ✅ Added: <b>{state.user.username}</b>
            </div>
          ) : (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ❌ {state.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}