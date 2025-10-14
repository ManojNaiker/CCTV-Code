import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Branch } from "@shared/schema";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function Branches() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    state: "",
  });

  // Fetch branches
  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  // Create branch mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create branch");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", state: "" });
      toast({
        title: "Branch created",
        description: "Branch has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create branch",
        variant: "destructive",
      });
    },
  });

  // Update branch mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await fetch(`/api/branches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update branch");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      setIsDialogOpen(false);
      setEditingBranch(null);
      setFormData({ name: "", email: "", state: "" });
      toast({
        title: "Branch updated",
        description: "Branch has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch",
        variant: "destructive",
      });
    },
  });

  // Delete branch mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/branches/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete branch");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      toast({
        title: "Branch deleted",
        description: "Branch has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete branch",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      email: branch.email,
      state: branch.state,
    });
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingBranch(null);
      setFormData({ name: "", email: "", state: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Branch Management</h1>
          <p className="text-muted-foreground">
            Create and manage branch locations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-branch">
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? "Edit Branch" : "Add New Branch"}
              </DialogTitle>
              <DialogDescription>
                {editingBranch
                  ? "Update the branch details below."
                  : "Enter the branch details below to create a new location."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Branch Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mumbai HQ"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    data-testid="input-branch-name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Branch Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., branch@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    data-testid="input-branch-email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) =>
                      setFormData({ ...formData, state: value })
                    }
                    required
                  >
                    <SelectTrigger data-testid="select-branch-state">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-branch"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingBranch
                    ? "Update Branch"
                    : "Save Branch"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading branches...
            </div>
          ) : branches.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No branches yet. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id} data-testid={`row-branch-${branch.id}`}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.email}</TableCell>
                    <TableCell>{branch.state}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(branch)}
                          data-testid={`button-edit-${branch.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(branch.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${branch.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
