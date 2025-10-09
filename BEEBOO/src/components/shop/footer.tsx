
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary/5 border-t">
      <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/contact_us" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Contact Us
            </Link>
            <Link href="https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/shipping" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Shipping Policy
            </Link>
            <Link href="https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Privacy Policy
            </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BEE BOO. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
