import React, { useEffect, useState } from 'react';

// Colorflow a001 mesh recolored in the editor: deep teal, mint and pearl-white lower glow, with Film Grain.
const meshURL = 'https://colorflow-embed.b-cdn.net/embed.html#e=zEZMpujd';

export default function MeshBackground() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setReduced(media.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  return <>
    <div className="mesh-background" aria-hidden="true">
      {!reduced && <iframe
        src={meshURL}
        title="Decorative Colorflow mesh"
        tabIndex={-1}
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
      />}
    </div>
  </>;
}
