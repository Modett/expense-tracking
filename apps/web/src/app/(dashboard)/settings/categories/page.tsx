"use client";

import { useState } from "react";
import Link from "next/link";
import { useCategories, useActivateCategory, useDeactivateCategory, useDeleteCategory } from "@/features/categories";
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
import { Plus, Edit, Trash2, CheckCircle2, XCircle, FolderOpen, ArrowLeft } from "lucide-react";

export default function SettingsCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const activateCategoryMutation = useActivateCategory();
  const deactivateCategoryMutation = useDeactivateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; categoryId: string | null }>({
    open: false,
    categoryId: null,
  });

  const handleDelete = () => {
    if (deleteDialog.categoryId) {
      deleteCategoryMutation.mutate(deleteDialog.categoryId, {
        onSuccess: () => setDeleteDialog({ open: false, categoryId: null }),
      });
    }
  };

  const handleToggleActive = (categoryId: string, isActive: boolean) => {
    if (isActive) {
      deactivateCategoryMutation.mutate(categoryId);
    } else {
      activateCategoryMutation.mutate(categoryId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-zinc-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Category Management</h1>
              <p className="text-zinc-400 mt-1">
                Manage expense categories for classification
              </p>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            asChild
          >
            <Link href="/categories/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Link>
          </Button>
        </div>

        {!categories || categories.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
            <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Categories Found</h3>
            <p className="text-zinc-400 mb-4">Add your first category to get started</p>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              asChild
            >
              <Link href="/categories/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Link>
            </Button>
          </Card>
        ) : (
          <Card className="bg-zinc-900 border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-300">Name</TableHead>
                  <TableHead className="text-zinc-300">Description</TableHead>
                  <TableHead className="text-zinc-300">Status</TableHead>
                  <TableHead className="text-zinc-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.categoryId} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-white">{category.name}</TableCell>
                    <TableCell className="text-zinc-400">{category.description || "-"}</TableCell>
                    <TableCell>
                      {category.isActive ? (
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
                            category.isActive
                              ? "text-gray-500 hover:text-gray-400 hover:bg-gray-500/10"
                              : "text-green-500 hover:text-green-400 hover:bg-green-500/10"
                          }
                          onClick={() => handleToggleActive(category.categoryId, category.isActive)}
                        >
                          {category.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                          asChild
                        >
                          <Link href={`/categories/${category.categoryId}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => setDeleteDialog({ open: true, categoryId: category.categoryId })}
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

        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, categoryId: null })}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Are you sure you want to delete this category? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setDeleteDialog({ open: false, categoryId: null })}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteCategoryMutation.isPending}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
              >
                {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
