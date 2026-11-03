import React, { useId, useState } from 'react';
import catalog from '../art42-catalog.json';
import scene from '../../assets/art42-source/scene-base.png';

const previews = import.meta.glob('../../assets/art42/character-*-branded.png', { eager: true, query: '?url', import: 'default' });
const cutouts = import.meta.glob('../../assets/art42-source/characters/*.png', { eager: true, query: '?url', import: 'default' });
const title = item => item.name.replace(/^42 — /, '').replace(/ #\d+$/, '');
const trait = (item, key) => item.attributes.find(value => value.trait_type === key)?.value || 'None';
const preview = id => previews[`../../assets/art42/character-${String(id).padStart(2, '0')}-branded.png`];
const cutout = id => cutouts[`../../assets/art42-source/characters/character-${String(id).padStart(2, '0')}-cutout.png`];
const accents = { Common: '#d8c487', Uncommon: '#6ed7bf', Rare: '#c595e9', Legendary: '#73c8ee' };

export default function Art42Gallery({ selected, onSelect, items, account, busy, children }) {
  const [query, setQuery] = useState(''), [rarity, setRarity] = useState('All');
  const prefix = useId().replace(/:/g, '');
  const active = catalog.items.find(item => item.token_id === selected);
  const visible = catalog.items.filter(item => (rarity === 'All' || trait(item, 'Rarity') === rarity)
    && `${item.name} ${item.attributes.map(value => value.value).join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()));
  function ownership(id) {
    const row = items.find(item => item.id === id);
    if (!row) return 'Checking ownership';
    if (!row.minted) return 'Available to mint';
    if (row.listed) return 'Listed · in escrow';
    return row.owner?.toLowerCase() === account?.toLowerCase() ? 'Owned by you' : 'Owned by another wallet';
  }
  return <div className="art42-gallery">
    <div className="art42-stage">
      <section className="art42-featured" aria-label="Selected artwork preview">
        <img key={selected} className="art42-hero-image" src={preview(selected)} alt={title(active)} />
        <div className="art42-image-top"><span>TOKENIZEART ORIGINALS</span><span>#{String(selected).padStart(2, '0')} / 10</span></div>
      </section>
      <div className="art42-info">
        <p className="art42-eyebrow">THE COLLECTION · ART42 #{String(selected).padStart(2, '0')}</p>
        <h2 className="art42-title">{title(active)}</h2>
        <p className="art42-description">{active.description.split(' Part of TokenizeArt')[0]}</p>
        <dl className="art42-traits">{['Expression', 'Outfit', 'Accessory', 'Background'].map(key => <div key={key}><dt>{key}</dt><dd>{trait(active, key)}</dd></div>)}</dl>
        {children}
      </div>
    </div>
    <section className="art42-browser" aria-label="Browse Art42 collection">
      <div className="art42-browser-heading"><div><h2>Explore the collection</h2><p>{visible.length} artworks · by {catalog.artist}</p></div>
        <label className="art42-search"><span className="sr-only">Search artworks</span><input type="search" value={query} placeholder="Find your character" onChange={e => setQuery(e.target.value)} /></label>
      </div>
      <div className="art42-filters" aria-label="Filter by rarity">{['All', 'Common', 'Uncommon', 'Rare', 'Legendary'].map(value => <button type="button" key={value} aria-pressed={rarity === value} onClick={() => setRarity(value)}>{value}</button>)}</div>
      <div className="art42-card-grid" aria-label="Artwork cards">
          {visible.map(item => {
            const id = item.token_id, tier = trait(item, 'Rarity'), foreground = cutout(id), gradient = `${prefix}-plinth-${id}`;
            return <article key={id} data-art-id={id} className={`art42-collectible ${selected === id ? 'is-selected' : ''}`} style={{ '--art-accent': accents[tier], '--art-tilt': `${id % 2 ? -2 : 2}deg` }}>
              <button type="button" className="art42-select" disabled={busy} aria-pressed={selected === id} aria-label={`Select ${title(item)}, ${ownership(id)}`} onClick={() => onSelect(id)}>
                <span className="art42-card-window"><img loading="lazy" src={foreground ? scene : preview(id)} alt="" /></span>
                {foreground && <img className="art42-cutout" loading="lazy" src={foreground} alt="" />}
                <span className="art42-card-top"><span>42 ORIGINALS</span><span>#{String(id).padStart(2, '0')}</span></span>
                <span className="art42-card-rarity">{tier}</span>
                <span className="art42-plinth">
                  <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={gradient} x1="0" y1="0" x2=".2" y2="1"><stop offset="0" stopColor="#303f3a"/><stop offset=".55" stopColor="#10221d"/><stop offset="1" stopColor="#030c09"/></linearGradient></defs><path d="M1 2 L20 20 H136 L153 37 V57 L171 76 H278 L299 56 V108 L288 119 H12 L1 108 Z" fill={`url(#${gradient})`}/><path d="M1 2 L20 20 H136 L153 37 V57 L171 76 H278 L299 56" fill="none" stroke="currentColor" strokeOpacity=".65" strokeWidth="1.5"/></svg>
                  <span className="art42-card-title">{title(item)}</span><span className="art42-card-status">{ownership(id)}</span><span className="art42-card-choice">{selected === id ? 'Selected' : 'View'} ↗</span>
                </span>
              </button>
            </article>;
          })}
          {!visible.length && <p className="helper">No characters match. Try another search or rarity.</p>}
      </div>
      <p className="art42-preview-note">Original collection previews and traits · live ownership from BNB testnet. Preview imagery does not replace immutable NFT metadata.</p>
    </section>
  </div>;
}
