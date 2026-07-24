import { redirect } from "next/navigation";
import { School } from "lucide-react";

import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { loginAsDirector } from "./actions";

export default async function LoginPage() {
  const userId = await getSession();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <School className="size-6" />
          </div>
          <CardTitle className="text-xl">Greenwood School</CardTitle>
          <CardDescription>Sign in to the ERP Console</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAsDirector}>
            <Button type="submit" className="w-full">
              Continue as Director
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
