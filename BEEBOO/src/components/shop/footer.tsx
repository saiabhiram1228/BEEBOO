
import Link from 'next/link';

export default function Footer() {
  const policyLinks = [
    { name: 'Terms & Conditions', href: 'https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/terms' },
    { name: 'Privacy Policy', href: 'https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/privacy' },
    { name: 'Cancellation & Refund', href: 'https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/refund' },
    { name: 'Shipping & Delivery', href: 'https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/shipping' },
    { name: 'Contact Us', href: 'https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/contact_us' },
  ];

  return (
    <footer className="bg-primary/5 border-t">
      <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {policyLinks.map((link) => (
                <Link key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {link.name}
                </Link>
            ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          © {new Date().getFullYear()} BEE BOO. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
