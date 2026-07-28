import { Megaphone } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getCircularsPageData } from "./data";

export async function CircularsSection({ schoolId }: { schoolId: string }) {
  const { circulars, unreadCount } = await getCircularsPageData(schoolId);

  if (circulars.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No circulars have been published yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Megaphone className="size-4" />
        {unreadCount} new notice{unreadCount === 1 ? "" : "s"} in the last week
      </p>

      <Accordion className="rounded-lg border px-4">
        {circulars.map((circular) => (
          <AccordionItem key={circular.id} value={circular.id}>
            <AccordionTrigger>
              <span className="flex flex-1 flex-col items-start gap-1 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="font-medium">{circular.title}</span>
                <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                  {circular.isNew ? (
                    <Badge className="border-transparent bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
                      New
                    </Badge>
                  ) : null}
                  {circular.publishedAt}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>{circular.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
