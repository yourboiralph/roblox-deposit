import prisma from "@/lib/prisma";
import UserForm from "./userForm";
import UserList from "./userList";

export default async function AllowedUsersAdminPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Allowed Users</h1>
      <UserForm />
      <h2 style={{ marginTop: 20, fontWeight: 700 }}>Allowed List</h2>
      <UserList users={users} />
    </div>
  );
}