import prisma from "@/lib/prisma";
import UserForm from "./userForm";

export default async function AllowedUsersAdminPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Allowed Users</h1>

      <UserForm />

      <h2 style={{ marginTop: 20, fontWeight: 700 }}>Allowed List</h2>
      <ul style={{ marginTop: 10 }}>
        {users.map((u) => (
          <li key={u.id}>
            <b>{u.username}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
