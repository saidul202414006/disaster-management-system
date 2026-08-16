"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";

// Users page — System operators who use this application.
// NOTE: "Users" is NOT part of the ER Diagram / Oracle DB schema.
// This is an application-level concern (who can log in to this system).
// For the current project scope (DBMS course), this page shows the concept only.
// Real user authentication would require a separate USERS table and auth system.

const SYSTEM_ROLES = [
  { role: "Admin", description: "Full system access — can manage all data", color: "text-tertiary" },
  { role: "Field Op", description: "Can register victims, shelters, update status", color: "text-primary" },
  { role: "Viewer", description: "Read-only access to all data", color: "text-on-surface-variant" },
];

export default function UsersPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">System Users</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Application-level operators — not part of the Oracle DB ER Diagram
          </p>
        </div>
        <Button variant="primary" icon={<span className="material-symbols-outlined text-[18px]">person_add</span>}>
          Invite User
        </Button>
      </div>

      {/* Scope note */}
      <div className="bg-surface-container-low border border-warning-amber/20 rounded-lg p-5 flex items-start gap-4">
        <span className="material-symbols-outlined text-warning-amber text-[28px] shrink-0">info</span>
        <div>
          <p className="text-body-md font-body-md text-on-surface font-semibold mb-1">
            Out of ER Diagram Scope
          </p>
          <p className="text-body-md font-body-md text-on-surface-variant">
            This page represents application-level user management. The Oracle DB ER Diagram covers:
            DISASTER_EVENT, VICTIM, SHELTER, WAREHOUSE, VEHICLE, DONATION, DISTRIBUTION, PERSONNEL etc.
            System login users are a separate concern that would require an authentication layer.
          </p>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-slate-surface border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface-container">
          <h2 className="text-headline-md font-headline-md text-on-surface">Defined Roles</h2>
        </div>
        <div className="divide-y divide-outline-variant">
          {SYSTEM_ROLES.map((r) => (
            <div key={r.role} className="p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors">
              <div>
                <div className={`font-medium text-body-md font-body-md ${r.color}`}>{r.role}</div>
                <div className="text-label-caps font-label-caps text-on-surface-variant mt-0.5">{r.description}</div>
              </div>
              <Badge variant="neutral">{r.role}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Empty users table */}
      <div className="bg-slate-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container">
          <h2 className="text-headline-md font-headline-md text-on-surface">Registered Operators</h2>
        </div>
        <Table>
          <TableHeader className="bg-surface-container-low">
            <TableRow>
              <TableHead>Operator ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[36px]">manage_accounts</span>
                  <p className="text-body-md font-body-md">No operators registered</p>
                  <p className="text-label-caps font-label-caps text-on-surface-variant/70">
                    User management requires an authentication backend (out of current DB scope)
                  </p>
                </div>
              </td>
            </tr>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
