
'use client';
import { useEffect, useState } from 'react';
import { getAnnouncement } from '@/lib/admin-data';
import { useAuth } from '@/context/auth-context';

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    // We don't want to show the announcement bar for admins
    if (isAdmin) {
        setLoading(false);
        return;
    }

    const fetchAnnouncement = async () => {
      try {
        const text = await getAnnouncement();
        setAnnouncement(text);
      } catch (error) {
        console.error("Failed to fetch announcement:", error);
        setAnnouncement(null); // Ensure it's hidden on error
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [isAdmin]);

  if (loading || !announcement) {
    return null;
  }

  return (
    <div className="bg-destructive text-destructive-foreground overflow-hidden">
      <div className="py-2.5">
        <div className="relative flex overflow-x-hidden">
          <p className="animate-marquee whitespace-nowrap font-medium text-sm">
            {announcement}
          </p>
          <p className="absolute top-0 animate-marquee2 whitespace-nowrap font-medium text-sm">
            {announcement}
          </p>
        </div>
      </div>
    </div>
  );
}

    