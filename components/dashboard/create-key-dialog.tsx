"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateKeyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create API key</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
          <DialogDescription>
            Keys are generated server-side and stored hashed — the full value is shown exactly
            once, at creation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="key-name">Key name</Label>
            <Input id="key-name" placeholder="production" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="key-scope">Scope</Label>
            <Select defaultValue="read-write">
              <SelectTrigger id="key-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read-write">read-write</SelectItem>
                <SelectItem value="read-only">read-only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex-1 text-left text-xs text-muted-foreground">
            Key generation activates in the backend stage.
          </p>
          <Button disabled>Generate key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}