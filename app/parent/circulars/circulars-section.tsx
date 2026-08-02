import { Megaphone } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCircularsPageData } from "./data";

export async function CircularsSection({ schoolId }: { schoolId: string }) {
  const { circulars, unreadCount } = await getCircularsPageData(schoolId);

  if (circulars.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="No circulars yet"
            description="Notices from the school will show up here as soon as they're published."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Megaphone className="size-4" />
        {unreadCount} new notice{unreadCount === 1 ? "" : "s"} in the last week
      </p>

      <Accordion className="rounded-xl border border-border bg-card px-4 shadow-sm">
        {circulars.map((circular) => (
          <AccordionItem key={circular.id} value={circular.id}>
            <AccordionTrigger className="rounded-md px-2 py-3 hover:bg-accent max-md:py-3.5">
              <span className="flex flex-1 flex-col items-start gap-1 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="font-medium">{circular.title}</span>
                <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                  {circular.isNew ? (
                    <Badge className="border-transparent bg-accent text-primary">
                      New
                    </Badge>
                  ) : null}
                  {circular.publishedAt}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-2">{circular.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
