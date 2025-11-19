"use client";

import { useState } from "react";
import Link from "next/link";
import { useVendors, useActivateVendor, useDeactivateVendor, useDeleteVendor } from "@/features/vendors";
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
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Building2 } from "lucide-react";

function VendorsPage() {
  const { data: vendors, isLoading } = useVendors();
  const activateVendorMutation = useActivateVendor();
  const deactivateVendorMutation = useDeactivateVendor();
  const deleteVendorMutation = useDeleteVendor();

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; vendorId: string | null }>({
    open: false,
    vendorId: null,
  });

  const handleDelete = () => {
    if (deleteDialog.vendorId) {
      deleteVendorMutation.mutate(deleteDialog.vendorId, {
        onSuccess: () => setDeleteDialog({ open: false, vendorId: null }),
      });
    }
  };

  const handleToggleActive = (vendorId: string, isActive: boolean) => {
    if (isActive) {
      deactivateVendorMutation.mutate(vendorId);
    } else {
      activateVendorMutation.mutate(vendorId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-background min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Vendors</h1>
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
            <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your vendors and supplier information
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/vendors/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Link>
          </Button>
        </div>
      </div>

      {!vendors || vendors.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Vendors Found</h3>
          <p className="text-muted-foreground mb-4">Add your first vendor to get started</p>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            asChild
          >
            <Link href="/vendors/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Link>
          </Button>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/60">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">GST Number</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.vendorId} className="border-border hover:bg-muted/60">
                  <TableCell className="font-medium text-foreground">{vendor.name}</TableCell>
                  <TableCell className="text-muted-foreground">{vendor.gstNumber || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{vendor.email || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{vendor.phone || "-"}</TableCell>
                  <TableCell>
                    {vendor.isActive ? (
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
                          vendor.isActive
                            ? "text-gray-500 hover:text-gray-400 hover:bg-gray-500/10"
                            : "text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        }
                        onClick={() => handleToggleActive(vendor.vendorId, vendor.isActive)}
                      >
                        {vendor.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                        asChild
                      >
                        <Link href={`/vendors/${vendor.vendorId}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeleteDialog({ open: true, vendorId: vendor.vendorId })}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, vendorId: null })}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this vendor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialog({ open: false, vendorId: null })}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteVendorMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {deleteVendorMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAdminGuard(VendorsPage, { title: "Vendors" });
