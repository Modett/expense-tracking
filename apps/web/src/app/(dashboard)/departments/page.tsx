"use client";

import { useState } from "react";
import Link from "next/link";
import { useDepartments, useActivateDepartment, useDeactivateDepartment, useDeleteDepartment } from "@/features/departments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { withAdminGuard } from "@/hooks/with-admin-guard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Building } from "lucide-react";

function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments();
  const activateDepartmentMutation = useActivateDepartment();
  const deactivateDepartmentMutation = useDeactivateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; departmentId: string | null }>({
    open: false,
    departmentId: null,
  });

  const handleDelete = () => {
    if (deleteDialog.departmentId) {
      deleteDepartmentMutation.mutate(deleteDialog.departmentId, {
        onSuccess: () => setDeleteDialog({ open: false, departmentId: null }),
      });
    }
  };

  const handleToggleActive = (departmentId: string, isActive: boolean) => {
    if (isActive) {
      deactivateDepartmentMutation.mutate(departmentId);
    } else {
      activateDepartmentMutation.mutate(departmentId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-background min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage organizational departments
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/departments/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Link>
          </Button>
        </div>
      </div>

      {!departments || departments.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Departments Found</h3>
          <p className="text-muted-foreground mb-4">Add your first department to get started</p>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/departments/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Link>
          </Button>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 bg-card/40">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Code
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department, index) => (
                  <TableRow
                    key={department.departmentId}
                    className="border-border/50 hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      <div>
                        <p>{department.name}</p>
                        <p className="text-xs text-muted-foreground">{department.departmentId.slice(0, 8)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {department.code ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                          {department.code}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {department.isActive ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={
                            department.isActive
                              ? "text-gray-500 hover:text-gray-400 hover:bg-gray-500/10"
                              : "text-green-500 hover:text-green-400 hover:bg-green-500/10"
                          }
                          onClick={() => handleToggleActive(department.departmentId, department.isActive)}
                        >
                          {department.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                          asChild
                        >
                          <Link href={`/departments/${department.departmentId}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => setDeleteDialog({ open: true, departmentId: department.departmentId })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, departmentId: null })}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this department? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialog({ open: false, departmentId: null })}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteDepartmentMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {deleteDepartmentMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAdminGuard(DepartmentsPage, { title: "Departments" });
