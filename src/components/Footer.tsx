export default function Footer() {
  return (
    <footer className="mt-10 sm:mt-12 md:mt-16 border-t border-border pt-6 sm:pt-8 pb-8 sm:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="space-y-3 sm:space-y-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p className="leading-relaxed">
            <strong>Disclaimer:</strong> This project is not directly affiliated with or created by Relay Protocol.
            It is an independent community project created for informational purposes only. While the author works at Relay Protocol,
            this does not make it an official Relay product.
          </p>
          <div className="flex items-center justify-center gap-1 sm:gap-2 pt-1 sm:pt-2">
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
        </div>
      </div>
    </footer>
  );
}
