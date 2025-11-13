import { Mail, Kanban } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-50"></div>
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
          <Mail className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Email Kanban
        </h1>
        <p className="text-xs text-muted-foreground">Powered by AI</p>
      </div>
    </div>
  );
}
