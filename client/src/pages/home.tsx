import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { diffLines } from "diff";
import { Upload, CheckCircle, AlertCircle, Loader2, Download, Copy } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { CarbonAd } from "@/components/carbon-ad";

function normalizeErrorMessage(message: string): string {
  return message.replace(/\[[\w\s]+\]/g, '[ID]')
                .replace(/\d+/g, '<num>')
                .trim();
}

function deduplicateLog(log: string): string {
  const lines = log.split('\n');
  const errorCache = new Map<string, { count: number; originalMessage: string }>();
  const processedLines: string[] = [];
  let currentErrorBlock: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === '' || i === lines.length - 1) {
      if (i === lines.length - 1 && line.trim() !== '') {
        currentErrorBlock.push(line);
      }

      if (currentErrorBlock.length > 0) {
        const originalBlock = currentErrorBlock.join('\n');
        const normalizedBlock = normalizeErrorMessage(originalBlock);

        if (errorCache.has(normalizedBlock)) {
          const entry = errorCache.get(normalizedBlock)!;
          entry.count++;
        } else {
          errorCache.set(normalizedBlock, {
            count: 1,
            originalMessage: originalBlock
          });
          processedLines.push(originalBlock);
        }

        currentErrorBlock = [];
      }
      if (line.trim() === '') {
        processedLines.push('');
      }
    } else {
      currentErrorBlock.push(line);
    }
  }

  const result = processedLines.map(line => {
    if (!line) return '';
    const normalized = normalizeErrorMessage(line);
    const entry = errorCache.get(normalized);
    if (entry && entry.count > 1) {
      return `${line} [x${entry.count}]`;
    }
    return line;
  });

  return result.join('\n');
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

  const handleClean = async () => {
    if (!inputLog) {
      toast({
        title: "Error",
        description: "Please enter or upload a log first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const dedupedLog = deduplicateLog(inputLog);
      const response = await apiRequest("POST", "/api/clean-log", { log: dedupedLog });
      const data = await response.json();
      setCleanedLog(data.cleaned);
      const parts = diffLines(inputLog, data.cleaned);
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

  const handleCopy = async () => {
    if (!cleanedLog) {
      toast({
        title: "Error",
        description: "No cleaned log to copy",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(cleanedLog);
      toast({
        title: "Success",
        description: "Log copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
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
                onClick={handleClean}
                disabled={!inputLog || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Clean & Deduplicate with AI
              </Button>
            </div>
          </div>
        </Card>

        {cleanedLog && (
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
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
      <CarbonAd />
    </div>
  );
}