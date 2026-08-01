import { redirect } from "next/navigation";
import { School } from "lucide-react";
import type { Role } from "@prisma/client";

import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { loginAs } from "./actions";

const ROLE_OPTIONS: { role: Role; label: string; description: string }[] = [
  { role: "DIRECTOR", label: "Director", description: "Full access" },
  { role: "ADMIN", label: "Admin", description: "Students & Fees" },
  { role: "TEACHER", label: "Teacher", description: "Classes & Attendance" },
  { role: "PARENT", label: "Parent", description: "Parent portal" },
];

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="justify-items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <School className="size-6" />
          </div>
          <CardTitle className="text-xl">School ERP Console</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {ROLE_OPTIONS.map((opt) => (
            <form key={opt.role} action={loginAs.bind(null, opt.role)}>
              <Button
                type="submit"
                variant={opt.role === "DIRECTOR" ? "default" : "outline"}
                className="w-full justify-between"
              >
                <span>Continue as {opt.label}</span>
                <span className="text-xs font-normal opacity-70">
                  {opt.description}
                </span>
              </Button>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
