import React from 'react';
import './MarqueeLogos.css';

const PARTNERS = [
  {
    id: 'france-travail',
    name: 'France Travail',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/de/France_Travail_2024.svg',
    url: 'https://www.francetravail.fr'
  },
  {
    id: 'mission-locale',
    name: 'Mission Locale',
    logo: 'https://emploi-mno.fr/wp-content/uploads/2024/08/logo-missionlocale-MNO.png',
    url: 'https://www.missionlocale.fr'
  },
  {
    id: 'hellowork',
    name: 'HelloWork',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Logo_Hellowork.svg',
    url: 'https://www.hellowork.com'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg',
    url: 'https://www.linkedin.com'
  }
];

export const MarqueeLogos = () => {
  const renderLogoSet = (key) => (
    <div key={key} className="marquee-set" aria-hidden={key !== 'set-1'}>
      {PARTNERS.map((partner) => (
        <a
          key={`${key}-${partner.id}`}
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          className="marquee-logo-box"
          title={partner.name}
          aria-label={`${partner.name} - partenaire`}
        >
          <img
            src={partner.logo}
            alt={partner.name}
            className="marquee-logo"
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );

  return (
    <section className="marquee-container" data-testid="marquee-logos">
      <div className="marquee-content">
        <h2 className="marquee-title">Nos partenaires</h2>
        <p className="marquee-subtitle">
          Joboost s'intègre avec les plus grandes plateformes d'emploi en France
        </p>
      </div>

      <div className="marquee-track-wrapper">
        <div className="marquee-track">
          {renderLogoSet('set-1')}
          {renderLogoSet('set-2')}
          {renderLogoSet('set-3')}
          {renderLogoSet('set-4')}
        </div>
      </div>
    </section>
  );
};

export default MarqueeLogos;
