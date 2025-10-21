import { useState } from "react";
import SidebarLayout from "../components/Sidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Pencil, Trash2 } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const initialUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", createdAt: "2024-05-01" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", createdAt: "2024-05-05" },
  { id: 3, name: "Bob Brown", email: "bob@example.com", createdAt: "2024-05-10" },
];

export default function Users() {
  const [users] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarLayout title="Usuários">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="icon-badge">
                <UserPlus className="w-5 h-5" />
              </span>
              <span>Total de Usuários</span>
            </div>
            <span className="text-xl font-semibold">{users.length}</span>
          </Card>
        </div>

        <Input
          placeholder="Buscar usuário"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-2">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="user-list-card flex items-center gap-4"
            >
              <Avatar>
                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
