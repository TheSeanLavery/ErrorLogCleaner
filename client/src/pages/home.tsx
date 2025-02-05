import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { diffLines } from "diff";
import { FileText, Upload, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

function deduplicateLog(log: string): string {
  const lines = log.split('\n');
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  // Split into blocks (separated by empty lines)
  for (let line of lines) {
    if (line.trim() === '') {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  // Count duplicate blocks
  const blockCounts = new Map<string, number>();
  const uniqueBlocks: string[][] = [];

  for (let block of blocks) {
    const blockStr = block.join('\n');
    if (blockCounts.has(blockStr)) {
      blockCounts.set(blockStr, blockCounts.get(blockStr)! + 1);
    } else {
      blockCounts.set(blockStr, 1);
      uniqueBlocks.push(block);
    }
  }

  // Format output with counts
  const result = uniqueBlocks.map(block => {
    const blockStr = block.join('\n');
    const count = blockCounts.get(blockStr)!;
    return count > 1 ? `${blockStr} [x${count}]` : blockStr;
  });

  return result.join('\n\n');
}

function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export default function Home() {
  const [inputLog, setInputLog] = useState("");
  const [dedupedLog, setDedupedLog] = useState("");
  const [cleanedLog, setCleanedLog] = useState("");
  const [diffParts, setDiffParts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setInputLog(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleDeduplicate = () => {
    if (!inputLog) {
      toast({
        title: "Error",
        description: "Please enter or upload a log first",
        variant: "destructive",
      });
      return;
    }
    const deduped = deduplicateLog(inputLog);
    setDedupedLog(deduped);
  };

  const handleClean = async () => {
    if (!dedupedLog) {
      toast({
        title: "Error",
        description: "Please deduplicate the log first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/clean-log", { log: dedupedLog });
      const data = await response.json();
      setCleanedLog(data.cleaned);
      const parts = diffLines(dedupedLog, data.cleaned);
      setDiffParts(parts);

      toast({
        title: "Success",
        description: "Log cleaned successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clean log",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!cleanedLog) {
      toast({
        title: "Error",
        description: "No cleaned log to export",
        variant: "destructive",
      });
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadTextFile(cleanedLog, `cleaned-log-${timestamp}.txt`);

    toast({
      title: "Success",
      description: "Log exported successfully",
    });
  };

  const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
    target.scrollTop = source.scrollTop;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">Error Log Cleaner</h1>
          <p className="text-muted-foreground">
            Clean and deduplicate your error logs using AI
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your error log here..."
              value={inputLog}
              onChange={(e) => setInputLog(e.target.value)}
              className="min-h-[200px] font-mono"
            />

            <div className="flex flex-wrap gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".txt,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Log File
                    </span>
                  </Button>
                </label>
              </div>

              <Button
                variant="secondary"
                onClick={handleDeduplicate}
                disabled={!inputLog}
                className="flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                Deduplicate Log
              </Button>

              <Button
                onClick={handleClean}
                disabled={!dedupedLog || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Clean Log with AI
              </Button>
            </div>
          </div>
        </Card>

        {dedupedLog && cleanedLog && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Removed Lines
              </h2>
              <ScrollArea
                ref={leftPanelRef}
                className="h-[400px] rounded-md border"
                onScroll={(e) => rightPanelRef.current && syncScroll(e.currentTarget, rightPanelRef.current)}
              >
                <pre className="p-4 font-mono text-sm">
                  {diffParts.map((part, i) => (
                    <span
                      key={i}
                      className={cn(
                        part.removed && "bg-red-100 dark:bg-red-900/30 line-through"
                      )}
                    >
                      {part.value}
                    </span>
                  ))}
                </pre>
              </ScrollArea>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Cleaned Log
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={!cleanedLog}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <ScrollArea
                ref={rightPanelRef}
                className="h-[400px] rounded-md border"
                onScroll={(e) => leftPanelRef.current && syncScroll(e.currentTarget, leftPanelRef.current)}
              >
                <pre className="p-4 font-mono text-sm">{cleanedLog}</pre>
              </ScrollArea>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}