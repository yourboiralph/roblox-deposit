import prisma from "@/lib/prisma";
import UserForm from "./userForm";
import UserList from "./userList";

export default async function AllowedUsersAdminPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(99,102,241,0.14), transparent 30%), radial-gradient(circle at top right, rgba(56,189,248,0.12), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderRadius: 24,
            boxShadow:
              "0 20px 60px rgba(15,23,42,0.08), 0 8px 24px rgba(99,102,241,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "28px 28px 20px",
              borderBottom: "1px solid rgba(226,232,240,0.8)",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(56,189,248,0.08))",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(224,231,255,1)",
                fontSize: 12,
                fontWeight: 700,
                color: "#4f46e5",
                marginBottom: 14,
              }}
            >
              Admin Panel
            </div>

            <h1
              style={{
                fontSize: 30,
                lineHeight: 1.1,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              Allowed Users
            </h1>

            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                fontSize: 14,
                color: "#475569",
              }}
            >
              Manage approved usernames and quickly reset credits when needed.
            </p>
          </div>

          <div style={{ padding: 28 }}>
            <UserForm />

            <div style={{ marginTop: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontWeight: 800,
                    fontSize: 18,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Allowed List
                </h2>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#eef2ff",
                    color: "#4338ca",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "1px solid #c7d2fe",
                  }}
                >
                  {users.length} user{users.length === 1 ? "" : "s"}
                </div>
              </div>

              <UserList users={users} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}