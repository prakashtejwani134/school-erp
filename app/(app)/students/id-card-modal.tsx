"use client";

import * as React from "react";
import { Download, IdCard } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";
import type { SchoolBranding, StudentRow } from "./types";

// Standard CR80 card size (credit-card format), in millimeters — matches
// the physical card stock most schools print on.
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 54;

export function IdCardModal({
  student,
  branding,
  open,
  onOpenChange,
}: {
  student: StudentRow;
  branding: SchoolBranding;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Student ID Card</DialogTitle>
          <DialogDescription>
            {student.firstName} {student.lastName} — {student.className}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <IdCardModalBody student={student} branding={branding} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function IdCardModalBody({
  student,
  branding,
}: {
  student: StudentRow;
  branding: SchoolBranding;
}) {
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const verifyUrl = `${window.location.origin}/verify/${student.id}`;
    import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(verifyUrl, { width: 160, margin: 1 }).then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [student.id]);

  async function handleExportPdf() {
    const node = document.getElementById("id-card-print-area");
    if (!node) return;

    setIsExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] =
        await Promise.all([import("html2canvas"), import("jspdf")]);

      const canvas = await html2canvas(node, {
        scale: 3,
        backgroundColor: "#ffffff",
      });
      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        unit: "mm",
        format: [CARD_WIDTH_MM, CARD_HEIGHT_MM],
      });
      pdf.addImage(imageData, "PNG", 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM);
      pdf.save(`${student.admissionNo}-id-card.pdf`);
    } catch {
      toast.error("Failed to generate ID card. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <div className="flex justify-center py-2">
        <div
          id="id-card-print-area"
          className="flex aspect-[856/540] w-full max-w-[380px] flex-col justify-between rounded-lg border bg-background p-4 text-sm"
        >
          <div className="flex items-center gap-2 border-b pb-2">
            {branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- card is rasterized for PDF export, next/image adds no value here
              <img
                src={branding.logoUrl}
                alt=""
                className="size-7 rounded object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                {branding.schoolName}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Student Identity Card · {branding.currentAcademicYear}
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 py-2">
            <Avatar className="size-14 shrink-0">
              <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                {getInitials(`${student.firstName} ${student.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                Class {student.className}
              </p>
              <p className="mt-1 font-mono text-xs">{student.admissionNo}</p>
            </div>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL, and card is rasterized for PDF export
              <img src={qrDataUrl} alt="" className="size-14 shrink-0" />
            ) : (
              <div className="size-14 shrink-0 animate-pulse rounded bg-muted" />
            )}
          </div>

          <p className="border-t pt-1.5 text-center text-[9px] text-muted-foreground">
            This card is the property of {branding.schoolName}. Scan the QR
            code to verify.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={handleExportPdf} disabled={isExporting || !qrDataUrl}>
          {isExporting ? (
            <>
              <IdCard />
              Generating...
            </>
          ) : (
            <>
              <Download />
              Download PDF
            </>
          )}
        </Button>
      </div>
    </>
  );
}
