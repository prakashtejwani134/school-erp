"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth-actions";
import { getInitials } from "@/lib/utils";

// Deliberately minimal next to components/profile-menu.tsx: no Profile or
// Settings links, since PARENT's rbac.ts access doesn't include "settings"
// and this header shouldn't offer a link that just bounces back. Sign out
// only, reusing the same lib/auth-actions.ts logout() the admin header uses.
export function ParentProfileMenu({ name }: { name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleLogout() {
    toast.loading("Logging out...", { id: "logout" });
    startTransition(async () => {
      try {
        await logout();
        toast.success("Logged out", { id: "logout" });
        router.push("/login");
        router.refresh();
      } catch {
        toast.error("Failed to log out. Please try again.", { id: "logout" });
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-11 items-center gap-2 rounded-md p-1 pr-2 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring md:h-auto">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-sm font-medium">{name}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          disabled={isPending}
        >
          <LogOut />
          {isPending ? "Logging out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
