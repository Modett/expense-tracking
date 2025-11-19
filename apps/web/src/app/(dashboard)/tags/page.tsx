"use client";

import { useState } from "react";
import Link from "next/link";
import { useTags, useActivateTag, useDeactivateTag, useDeleteTag, TagTypeEnum } from "@/features/tags";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Tag as TagIcon } from "lucide-react";

function TagsPage() {
  const [typeFilter, setTypeFilter] = useState<TagTypeEnum | "all">("all");
  const { data: tags, isLoading } = useTags(typeFilter === "all" ? undefined : { type: typeFilter });
  const activateTagMutation = useActivateTag();
  const deactivateTagMutation = useDeactivateTag();
  const deleteTagMutation = useDeleteTag();

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; tagId: string | null }>({
    open: false,
    tagId: null,
  });

  const handleDelete = () => {
    if (deleteDialog.tagId) {
      deleteTagMutation.mutate(deleteDialog.tagId, {
        onSuccess: () => setDeleteDialog({ open: false, tagId: null }),
      });
    }
  };

  const handleToggleActive = (tagId: string, isActive: boolean) => {
    if (isActive) {
      deactivateTagMutation.mutate(tagId);
    } else {
      activateTagMutation.mutate(tagId);
    }
  };

  const getTagTypeColor = (type: TagTypeEnum) => {
    switch (type) {
      case TagTypeEnum.COLLECTION:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case TagTypeEnum.CAMPAIGN:
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case TagTypeEnum.CUSTOM:
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case TagTypeEnum.DEPARTMENT:
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-zinc-500/10 text-muted-foreground border-zinc-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Tags</h1>
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
            <h1 className="text-3xl font-bold text-foreground">Tag Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage tags for expense categorization and tracking
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/tags/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Tag
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TagTypeEnum | "all")}>
            <SelectTrigger className="w-48 bg-muted border-border text-foreground">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-foreground">All Types</SelectItem>
              <SelectItem value={TagTypeEnum.COLLECTION} className="text-foreground">Collection</SelectItem>
              <SelectItem value={TagTypeEnum.CAMPAIGN} className="text-foreground">Campaign</SelectItem>
              <SelectItem value={TagTypeEnum.CUSTOM} className="text-foreground">Custom</SelectItem>
              <SelectItem value={TagTypeEnum.DEPARTMENT} className="text-foreground">Department</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!tags || tags.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <TagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Tags Found</h3>
          <p className="text-muted-foreground mb-4">Add your first tag to get started</p>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/tags/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Tag
            </Link>
          </Button>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/60">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.tagId} className="border-border hover:bg-muted/60">
                  <TableCell className="font-medium text-foreground">{tag.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTagTypeColor(tag.type)}>
                      {tag.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tag.isActive ? (
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
                          tag.isActive
                            ? "text-gray-500 hover:text-gray-400 hover:bg-gray-500/10"
                            : "text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        }
                        onClick={() => handleToggleActive(tag.tagId, tag.isActive)}
                      >
                        {tag.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                        asChild
                      >
                        <Link href={`/tags/${tag.tagId}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeleteDialog({ open: true, tagId: tag.tagId })}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, tagId: null })}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this tag? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialog({ open: false, tagId: null })}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteTagMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {deleteTagMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAdminGuard(TagsPage, { title: "Tags" });

