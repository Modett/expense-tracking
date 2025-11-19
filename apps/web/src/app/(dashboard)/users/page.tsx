"use client";

import { useState } from "react";
import Link from "next/link";
import { useUsers, useActivateUser, useDeactivateUser, useDeleteUser, RoleEnum } from "@/features/users";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Users as UsersIcon } from "lucide-react";

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<RoleEnum | "all">("all");
  const { data: users, isLoading } = useUsers(roleFilter === "all" ? undefined : { role: roleFilter });
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();
  const deleteUserMutation = useDeleteUser();

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });

  const handleDelete = () => {
    if (deleteDialog.userId) {
      deleteUserMutation.mutate(deleteDialog.userId, {
        onSuccess: () => setDeleteDialog({ open: false, userId: null }),
      });
    }
  };

  const handleToggleActive = (userId: string, isActive: boolean) => {
    if (isActive) {
      deactivateUserMutation.mutate(userId);
    } else {
      activateUserMutation.mutate(userId);
    }
  };

  const getRoleBadgeColor = (role: RoleEnum) => {
    switch (role) {
      case RoleEnum.ADMIN:
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case RoleEnum.FINANCE:
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case RoleEnum.MANAGER:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case RoleEnum.STAFF:
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-zinc-500/10 text-muted-foreground border-zinc-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage system users and their roles
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/users/new">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleEnum | "all")}>
            <SelectTrigger className="w-48 bg-muted border-border text-foreground">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-foreground">All Roles</SelectItem>
              <SelectItem value={RoleEnum.ADMIN} className="text-foreground">Admin</SelectItem>
              <SelectItem value={RoleEnum.FINANCE} className="text-foreground">Finance</SelectItem>
              <SelectItem value={RoleEnum.MANAGER} className="text-foreground">Manager</SelectItem>
              <SelectItem value={RoleEnum.STAFF} className="text-foreground">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!users || users.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Users Found</h3>
          <p className="text-muted-foreground mb-4">Add your first user to get started</p>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/users/new">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Link>
          </Button>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/60">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId} className="border-border hover:bg-muted/60">
                  <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
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
                          user.isActive
                            ? "text-gray-500 hover:text-gray-400 hover:bg-gray-500/10"
                            : "text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        }
                        onClick={() => handleToggleActive(user.userId, user.isActive)}
                      >
                        {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                        asChild
                      >
                        <Link href={`/users/${user.userId}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeleteDialog({ open: true, userId: user.userId })}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, userId: null })}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialog({ open: false, userId: null })}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteUserMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

