import { createFileRoute } from "@tanstack/react-router";
import { employees } from "@/lib/mektep-data";
import { Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employees")({
  component: EmployeesPage,
});

function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold">Employee Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">Core team of Aqbobek school.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {employees.map((e) => (
          <div key={e.id} className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="h-16 w-16 rounded-2xl mx-auto flex items-center justify-center text-xl font-bold text-primary-foreground" style={{ background: e.avatarColor }}>
              {e.name[0]}
            </div>
            <h3 className="mt-3 font-semibold text-foreground">{e.name}</h3>
            <p className="text-xs text-muted-foreground">{e.role}</p>
            {e.subject && <p className="text-xs text-primary mt-1 font-medium">{e.subject}</p>}
            <div className="mt-4 flex justify-center gap-2">
              <button className="p-2 rounded-lg bg-secondary hover:bg-border"><Mail className="h-3.5 w-3.5" /></button>
              <button className="p-2 rounded-lg bg-secondary hover:bg-border"><Phone className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
