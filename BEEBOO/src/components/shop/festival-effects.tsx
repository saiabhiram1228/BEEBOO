
'use client';
import { useEffect, useState, useMemo } from 'react';
import { getFestivalTheme } from '@/lib/admin-data';
import { useAuth } from '@/context/auth-context';
import { usePathname } from 'next/navigation';

const DiwaliEffects = () => {
    const [sparkles, setSparkles] = useState<{ id: number; top: string; left: string; animationDuration: string }[]>([]);
    const [diyas, setDiyas] = useState<{ id: number; top: string; left: string; animationDuration: string; animationDelay: string }[]>([]);

    useEffect(() => {
        const generateEffects = () => {
            const newSparkles = Array.from({ length: 30 }).map((_, i) => ({
                id: i,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 1.5 + 1}s`,
            }));
            setSparkles(newSparkles);

            const newDiyas = Array.from({ length: 10 }).map((_, i) => ({
                id: i,
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                animationDuration: `${Math.random() * 10 + 15}s`,
                animationDelay: `${Math.random() * 10}s`,
            }));
            setDiyas(newDiyas);
        };

        generateEffects();
        const interval = setInterval(generateEffects, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-64 pointer-events-none z-50 overflow-hidden">
            {sparkles.map(s => (
                <div
                    key={s.id}
                    className="festival-element diwali-sparkle"
                    style={{ top: s.top, left: s.left, animationDuration: s.animationDuration }}
                />
            ))}
            {diyas.map(d => (
                <div
                    key={d.id}
                    className="festival-element diwali-diya"
                    style={{ top: d.top, left: d.left, animationDuration: d.animationDuration, animationDelay: d.animationDelay }}
                >
                    <svg viewBox="0 0 100 50" fill="#FFC94A">
                        <path d="M10 40 C 20 55, 80 55, 90 40 L 90 45 C 80 60, 20 60, 10 45 Z" />
                        <path d="M48 40 Q 50 10, 52 40" fill="#FF5733" />
                         <path d="M49 15 Q 50 5, 51 15" fill="yellow" />
                    </svg>
                </div>
            ))}
        </div>
    );
};

const HoliEffects = () => {
    const colors = ['#FF1493', '#32CD32', '#FFD700', '#1E90FF', '#FF4500'];
    const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        color: colors[i % colors.length],
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 5 + 5}s`,
        animationDelay: `${Math.random() * 5}s`,
    })), []);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="festival-element holi-powder"
                    style={{
                        backgroundColor: p.color,
                        left: p.left,
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay,
                    }}
                />
            ))}
        </div>
    );
};

const NavratriEffects = () => {
    const colors = ['#FF4500', '#FFD700', '#32CD32', '#f87171', '#fbbf24', '#34d399', '#60a5fa'];
    const lights = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        color: colors[i % colors.length],
        top: `${Math.sin(i * 0.4) * 25 + 30}px`,
        left: `${(i / 50) * 100}%`,
        animationDelay: `${(i * 0.1) % 2}s`,
    })), []);

    return (
        <div className="fixed top-0 left-0 w-full h-24 pointer-events-none z-50 overflow-hidden">
            <div className="navratri-garland" style={{ transformOrigin: 'center top' }}>
                {lights.map(l => (
                    <div
                        key={l.id}
                        className="festival-element navratri-light"
                        style={{
                            top: l.top,
                            left: l.left,
                            backgroundColor: l.color,
                            color: l.color, // for box-shadow
                            animationDelay: l.animationDelay,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const FallingPetals = ({ colors, Icon }: { colors: string[], Icon: React.ComponentType<{ className?: string, style?: React.CSSProperties }> }) => {
    const petals = useMemo(() => Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        color: colors[i % colors.length],
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 8 + 7}s`,
        animationDelay: `${Math.random() * 10}s`,
        transform: `scale(${Math.random() * 0.5 + 0.5})`,
    })), [colors]);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
            {petals.map(p => (
                <Icon
                    key={p.id}
                    className="festival-element"
                    style={{
                        left: p.left,
                        color: p.color,
                        animationName: 'fall',
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay,
                        transform: p.transform,
                    }}
                />
            ))}
        </div>
    );
};

const GaneshChaturthiEffects = () => (
    <FallingPetals
        colors={['#FF6347', '#FFD700', '#FFFFFF']}
        Icon={({ className, style }) => (
            <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" width="24" height="24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.3" /><path d="M12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
            </svg>
        )}
    />
);

const DussehraEffects = () => (
    <FallingPetals
        colors={['#FF8C00', '#FFD700', '#B22222']}
        Icon={({ className, style }) => (
            <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" width="20" height="20">
                <path d="M12 2L9.91 8.35L3.5 9.09l4.57 4.47L7.02 20L12 16.54L16.98 20l-1.05-6.44l4.57-4.47l-6.41-.74L12 2z" />
            </svg>
        )}
    />
);


const TricolorFireworkEffects = () => {
    const colors = ['#FF9933', '#FFFFFF', '#138808'];
    const fireworks = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        color: colors[i % colors.length],
        left: `${Math.random() * 100}%`,
        bottom: `${Math.random() * 40}%`,
        animationDelay: `${Math.random() * 1.5}s`,
    })), []);

    return (
        <div className="fixed bottom-0 left-0 w-full h-1/2 pointer-events-none z-50 overflow-hidden">
            {fireworks.map(f => (
                <div
                    key={f.id}
                    className="festival-element tricolor-firework"
                    style={{
                        left: f.left,
                        bottom: f.bottom,
                        backgroundColor: f.color,
                        animationDelay: f.animationDelay,
                    }}
                />
            ))}
        </div>
    );
};

const EidEffects = () => {
    const lanterns = useMemo(() => Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 90}%`,
        top: `${-10 - Math.random() * 20}%`,
        animationDuration: `${Math.random() * 10 + 15}s`,
        animationDelay: `${Math.random() * 15}s`,
    })), []);
    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
            {lanterns.map(l => (
                <div key={l.id} className="festival-element eid-lantern" style={l}>
                    <svg viewBox="0 0 40 60" width="40" height="60" fill="#FFD700" opacity="0.8">
                        <path d="M5 0 h30 v5 h-30 z" />
                        <path d="M10 5 h20 v40 a10 10 0 0 1 -20 0 z" />
                        <path d="M15 45 h10 v5 h-10 z" />
                        <circle cx="20" cy="55" r="5" fill="#FFFACD" />
                    </svg>
                </div>
            ))}
        </div>
    );
};

const OnamEffects = () => (
    <FallingPetals
        colors={['#FFD700', '#FF8C00', '#FFFFFF', '#32CD32']}
        Icon={({ className, style }) => (
             <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" width="18" height="18">
                <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".3" /><path d="M12,7a5,5,0,1,0,5,5A5,5,0,0,0,12,7Zm0,8a3,3,0,1,1,3-3A3,3,0,0,1,12,15Z" />
             </svg>
        )}
    />
);

const MahaShivratriEffects = () => (
     <FallingPetals
        colors={['#E0E0E0', '#B0C4DE', '#4682B4']}
        Icon={({ className, style }) => (
             <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" width="20" height="20">
                <path d="M20.84 4.22a.996.996 0 0 0-1.2.39L17.5 7.55A8.994 8.994 0 0 0 3.05 14.9l-1.83 1.83a.996.996 0 1 0 1.41 1.41l1.83-1.83A8.994 8.994 0 0 0 16.45 9.5l2.14-2.14a.996.996 0 0 0-.38-1.68zM5 13c0-3.86 3.14-7 7-7s7 3.14 7 7-3.14 7-7 7-7-3.14-7-7z"/>
             </svg>
        )}
    />
);

const RakshaBandhanEffects = () => {
    const rakhis = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 5 + 10}s`,
        animationDelay: `${Math.random() * 15}s`,
    })), []);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
            {rakhis.map(r => (
                <div key={r.id} className="festival-element rakhi-thread" style={r}>
                    <svg width="100" height="10" viewBox="0 0 100 10">
                        <line x1="0" y1="5" x2="40" y2="5" stroke="#FF4500" strokeWidth="2" />
                        <circle cx="50" cy="5" r="5" fill="#FFD700" />
                        <line x1="60" y1="5" x2="100" y2="5" stroke="#FF4500" strokeWidth="2" />
                    </svg>
                </div>
            ))}
        </div>
    );
}

const PongalEffects = () => (
     <FallingPetals
        colors={['#FFD700', '#FF8C00', '#8B4513']}
        Icon={({ className, style }) => (
             <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" width="20" height="20">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4s-4.2 0.9-5.65 2.35C4.9 7.79 4 9.79 4 12s0.9 4.21 2.35 5.65C7.79 19.1 9.79 20 12 20s4.21-0.9 5.65-2.35C19.1 16.21 20 14.21 20 12s-0.9-4.21-2.35-5.65zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
             </svg>
        )}
    />
);

const MakarSankrantiEffects = () => {
    const kites = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 70}%`,
        left: `${Math.random() * 70}%`,
        animationDuration: `${Math.random() * 10 + 15}s`,
        animationDelay: `${Math.random() * 10}s`,
        color: `hsl(${Math.random() * 360}, 100%, 75%)`,
    })), []);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
            {kites.map(k => (
                <div key={k.id} className="festival-element sankranti-kite" style={k}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill={k.color}>
                        <path d="M20 0 L40 20 L20 40 L0 20 Z" />
                    </svg>
                </div>
            ))}
        </div>
    );
};

const FestivalComponentMap: Record<string, React.ComponentType> = {
    'header-lights': NavratriEffects,
    'diwali': DiwaliEffects,
    'holi': HoliEffects,
    'navratri': NavratriEffects,
    'ganesh-chaturthi': GaneshChaturthiEffects,
    'dussehra': DussehraEffects,
    'independence-day': TricolorFireworkEffects,
    'republic-day': TricolorFireworkEffects,
    'eid': EidEffects,
    'onam': OnamEffects,
    'shivratri': MahaShivratriEffects,
    'raksha-bandhan': RakshaBandhanEffects,
    'pongal': PongalEffects,
    'makar-sankranti': MakarSankrantiEffects,
};


export default function FestivalEffects() {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isAdmin || pathname.startsWith('/admin')) {
        setLoading(false);
        return;
    }

    const fetchTheme = async () => {
      try {
        const theme = await getFestivalTheme();
        setActiveTheme(theme);
      } catch (error) {
        console.error("Failed to fetch festival theme:", error);
        setActiveTheme(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [isAdmin, pathname]);

  if (loading || !activeTheme) {
    return null;
  }

  const EffectComponent = FestivalComponentMap[activeTheme];

  return EffectComponent ? <EffectComponent /> : null;
}
