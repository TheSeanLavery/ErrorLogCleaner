import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
          </div>

          <div className="prose dark:prose-invert">
            <h2>Data Collection and Usage</h2>
            <p>
              We only process your error logs for the purpose of cleaning and analysis. 
              Your logs are never stored permanently and are deleted immediately after processing.
            </p>

            <h2>OpenAI Integration</h2>
            <p>
              We use OpenAI's API to process and clean your logs. While logs are sent to OpenAI for 
              processing, they are not used for training or stored beyond the immediate processing needs.
            </p>

            <h2>Data Storage</h2>
            <p>
              All processing is done in-memory and no logs are permanently stored on our servers.
              Once your session ends, all data is automatically cleared.
            </p>

            <h2>Contact</h2>
            <p>
              For any privacy-related questions, please visit{" "}
              <a href="https://laverytechsolutions.com" target="_blank" rel="noopener noreferrer">
                LaveryTechSolutions.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
