export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-4 text-center text-sm text-muted-foreground">
          <p>
            <strong>Disclaimer:</strong> This project is not directly affiliated with or created by Relay Protocol.
            It is an independent community project created for informational purposes only. While the author works at Relay Protocol,
            this does not make it an official Relay product.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
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
