import type { Metadata } from "next";
import { BadgeX, School } from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SealBadge } from "@/components/ui/seal-badge";

export const metadata: Metadata = {
  title: "ID Card Verification",
};

/**
 * Public — reachable by anyone scanning the QR code on a printed ID card,
 * no session required. Only non-sensitive fields (name, class, school) are
 * shown here; never phone/address/guardian info.
 */
async function getStudent(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true, school: true },
  });
}

export default async function VerifyStudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getStudent(studentId);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        {student ? (
          <>
            <CardHeader className="justify-items-center text-center">
              <SealBadge label="Verified" size={64} className="mb-2" />
              <CardTitle className="text-xl">Valid Student ID</CardTitle>
              <CardDescription>{student.school.schoolName}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-center">
              <div>
                <p className="text-lg font-semibold">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Class {student.class.name}-{student.class.section}
                </p>
              </div>
              <p className="font-mono text-sm text-muted-foreground">
                {student.admissionNo}
              </p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="justify-items-center text-center">
              <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                <BadgeX className="size-6" />
              </div>
              <CardTitle className="text-xl">Invalid ID Card</CardTitle>
              <CardDescription>
                This ID card could not be verified.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
              <School className="size-5" />
              <p>Contact the school office if you believe this is an error.</p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
