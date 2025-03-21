import { motion } from "framer-motion";
import ConversationFlowDesigner from "@/components/agent-studio/conversation-flow-designer";

interface ConversationFlowTabProps {
  agentId: string;
}

export function ConversationFlowTab({ agentId }: ConversationFlowTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[750px]"
    >
      <div className="h-full rounded-lg border bg-card overflow-hidden">
        <ConversationFlowDesigner agentId={agentId} />
      </div>
    </motion.div>
  );
}
