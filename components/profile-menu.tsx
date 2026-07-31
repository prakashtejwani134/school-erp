"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Settings, UserRound } from "lucide-react";

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

export function ProfileMenu({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: string;
}) {
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
        <div className="hidden flex-col items-start text-left leading-tight sm:flex">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">{role}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-sm font-medium">{name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <UserRound />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          disabled={isPending}
        >
          <LogOut />
          {isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
