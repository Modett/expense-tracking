"use client";

import { useState } from "react";
import Link from "next/link";
import { useCategories, useActivateCategory, useDeactivateCategory, useDeleteCategory } from "@/features/categories";
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
import { Plus, Edit, Trash2, CheckCircle2, XCircle, FolderOpen } from "lucide-react";

function CategoriesPage() {
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
      <div className="p-8 bg-background min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
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
            <h1 className="text-3xl font-bold text-foreground">Category Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage expense categories for classification
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/categories/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Link>
          </Button>
        </div>
      </div>

      {!categories || categories.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Categories Found</h3>
          <p className="text-muted-foreground mb-4">Add your first category to get started</p>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/categories/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Link>
          </Button>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/70">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.categoryId} className="border-border hover:bg-muted/60">
                  <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.description || "-"}
                  </TableCell>
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
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialog({ open: false, categoryId: null })}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
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
  );
}

export default withAdminGuard(CategoriesPage, { title: "Categories" });

