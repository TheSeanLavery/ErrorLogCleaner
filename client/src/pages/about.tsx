import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Github } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-3xl">
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">About Error Log Cleaner</h1>
          </div>

          <div className="prose dark:prose-invert">
            <p>
              Error Log Cleaner was created to help developers quickly clean and analyze their error logs. 
              I wanted to give this tool away to everyone and help out the developer community.
            </p>

            <p>
              This tool combines advanced deduplication algorithms with AI-powered analysis to:
            </p>
            <ul>
              <li>Remove duplicate error messages</li>
              <li>Clean out non-critical errors</li>
              <li>Format and organize log output</li>
              <li>Make error logs more readable and actionable</li>
            </ul>

            <div className="flex items-center gap-2 not-prose">
              <a 
                href="https://github.com/TheSeanLavery/ErrorLogCleaner" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <Github className="h-4 w-4" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
