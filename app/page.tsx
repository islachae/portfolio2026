import { ShellProvider } from "@/components/shell-context";
import { Site } from "@/components/Site";
import { ChatProvider } from "@/components/ChaeLLM";

export default function Home() {
  return (
    <ShellProvider>
      <ChatProvider>
        <Site />
      </ChatProvider>
    </ShellProvider>
  );
}
