
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary/5 border-t">
      <div className="container mx-auto py-6 px-4 md:px-6 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BEE BOO. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
