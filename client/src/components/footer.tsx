import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          © 2025 LaveryTechSolutions.com
        </div>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <a 
            href="https://github.com/TheSeanLavery/ErrorLogCleaner" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
