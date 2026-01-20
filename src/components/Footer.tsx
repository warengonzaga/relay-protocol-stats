import { Star, Bug, GitPullRequest, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const version = '1.0.0';
  const repoUrl = 'https://github.com/warengonzaga/relay-protocol-stats';

  return (
    <footer className="mt-10 sm:mt-12 md:mt-16 border-t border-border pt-6 sm:pt-8 pb-8 sm:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="space-y-4 sm:space-y-6 text-center">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(repoUrl, '_blank', 'noopener,noreferrer')}
              className="text-xs sm:text-sm"
            >
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Star on GitHub
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${repoUrl}/issues`, '_blank', 'noopener,noreferrer')}
              className="text-xs sm:text-sm"
            >
              <Bug className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Report Issue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(repoUrl, '_blank', 'noopener,noreferrer')}
              className="text-xs sm:text-sm"
            >
              <GitPullRequest className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Contribute
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://github.com/sponsors/warengonzaga', '_blank', 'noopener,noreferrer')}
              className="text-xs sm:text-sm"
            >
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Sponsor
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-muted-foreground">
            <p className="leading-relaxed">
              <strong>Disclaimer:</strong> This project is not directly affiliated with or created by Relay Protocol.
              It is an independent community project created for informational purposes only. While the author works at Relay Protocol,
              this does not make it an official Relay product.
            </p>

            {/* Creator and Version */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-1 sm:pt-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <span>Created by</span>
                <a
                  href="https://github.com/warengonzaga"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Waren Gonzaga
                </a>
              </div>
              <span className="hidden sm:inline text-muted-foreground/50">•</span>
              <span className="text-muted-foreground/70">v{version}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
