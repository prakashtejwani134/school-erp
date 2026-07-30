import { MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/** Static status indicator — this codebase has no SMS-credit-style counter to replace; WhatsApp sending itself is currently mocked (see lib/whatsapp.ts). */
export function CommunicationHealthBadge() {
  return (
    <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
      <MessageCircle className="size-3" />
      WhatsApp: Active
    </Badge>
  );
}
