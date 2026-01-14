"use client";

import { useActionState } from "react";
import { createBotAction } from "./actions";

type BotActionState =
  | { success: true; bot: { id: string; name: string } }
  | { success: false; error: string; botId?: string }
  | null;

export default function BotForm() {
  const [state, action, pending] = useActionState<BotActionState, FormData>(
    createBotAction,
    null
  );

  return (
    <div style={{ marginTop: 16 }}>
      <form action={action} style={{ display: "grid", gap: 10 }}>
        <input
          name="name"
          placeholder="Bot name (e.g. My Cool Bot)"
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <button
          disabled={pending}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        >
          {pending ? "Creating..." : "Create Bot"}
        </button>
      </form>

      {state && (
        <div style={{ marginTop: 12 }}>
          {state.success ? (
            <div>
              ✅ Created: <b>{state.bot.name}</b> — ID: <code>{state.bot.id}</code>
            </div>
          ) : (
            <div>
              ❌ {state.error}
              {state.botId ? (
                <>
                  {" "}
                  (Generated ID: <code>{state.botId}</code>)
                </>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
