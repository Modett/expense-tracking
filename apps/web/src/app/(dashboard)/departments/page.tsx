"use client";

import { useState } from "react";
import Link from "next/link";
import { useDepartments, useActivateDepartment, useDeactivateDepartment, useDeleteDepartment } from "@/features/departments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function DepartmentsPage() {
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
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Departments</h1>
          <p className="text-zinc-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Department Management</h1>
            <p className="text-zinc-400 mt-2">
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
        <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
          <Building className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Departments Found</h3>
          <p className="text-zinc-400 mb-4">Add your first department to get started</p>
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
        <Card className="bg-zinc-900 border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-300">Name</TableHead>
                <TableHead className="text-zinc-300">Code</TableHead>
                <TableHead className="text-zinc-300">Status</TableHead>
                <TableHead className="text-zinc-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.departmentId} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-white">{department.name}</TableCell>
                  <TableCell className="text-zinc-400">
                    {department.code ? (
                      <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                        {department.code}
                      </Badge>
                    ) : (
                      "-"
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
        </Card>
      )}

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, departmentId: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete this department? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialog({ open: false, departmentId: null })}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
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
