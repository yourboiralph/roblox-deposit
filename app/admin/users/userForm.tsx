"use client";

import { useActionState } from "react";
import { addAllowedUserAction, type UserActionState } from "./actions";

export default function UserForm() {
  const [state, action, pending] = useActionState<UserActionState, FormData>(
    addAllowedUserAction,
    null
  );

  return (
    <div style={{ marginTop: 16 }}>
      <form action={action} style={{ display: "grid", gap: 10 }}>
        <input
          name="username"
          placeholder="Username (e.g. ReynaldoBajaJr)"
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <button
          disabled={pending}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        >
          {pending ? "Adding..." : "Add Allowed User"}
        </button>
      </form>

      {state && (
        <div style={{ marginTop: 12 }}>
          {state.success ? (
            <div>
              ✅ Added: <b>{state.user.username}</b>
            </div>
          ) : (
            <div>❌ {state.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
