import { redirect } from "next/navigation";
import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatDisplayDate } from "@/lib/date";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FadeInItem, FadeInStagger } from "@/components/motion/fade-in";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default async function ProfilePage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const contactDetails = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone ?? "—" },
    { icon: ShieldCheck, label: "Role", value: user.role, badge: true },
    {
      icon: UserRound,
      label: "Member Since",
      value: formatDisplayDate(user.createdAt),
    },
  ];

  return (
    <FadeInStagger className="flex max-w-2xl flex-col gap-4">
      <FadeInItem>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar size="lg" className="size-14">
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription>{titleCase(user.role)}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </FadeInItem>

      <FadeInItem>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {contactDetails.map(({ icon: Icon, label, value, badge }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {badge ? (
                    <Badge variant="secondary">{value}</Badge>
                  ) : (
                    <p className="text-sm font-medium">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </FadeInItem>
    </FadeInStagger>
  );
}
