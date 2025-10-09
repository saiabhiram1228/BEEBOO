
import Link from 'next/link';

export default function Footer() {
  const policies = [
    { name: 'Terms and Conditions', href: 'https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/terms' },
    { name: 'Privacy Policy', href: 'https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/privacy' },
    { name: 'Shipping and Delivery Policy', href: 'https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/shipping' },
    { name: 'Cancellation and Refund Policy', href: 'https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/refund' },
    { name: 'Contact Us', href: 'https://merchant.razorpay.com/policy/RJ4kEO1nMXdRP1/contact_us' },
  ];

  return (
    <footer className="bg-primary/5 border-t">
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-2 mb-4">
          {policies.map((policy) => (
            <Link key={policy.name} href={policy.href} className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline" target="_blank" rel="noopener noreferrer">
              {policy.name}
            </Link>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BEE BOO. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
