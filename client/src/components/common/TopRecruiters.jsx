import { useState, useEffect } from 'react';
import { topRecruiters as staticRecruiters } from '../../data/landingData';
import api from '../../services/api';
import CompanyLogo from './CompanyLogo';

/**
 * TopRecruiters — merges static companies from landingData.js
 * with dynamic (registered) companies from the API.
 * Deduplication: if a name matches (case-insensitive), dynamic wins.
 * Logos are rendered via the CompanyLogo component (Logo.dev API).
 */
const TopRecruiters = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const mergeCompanies = async () => {
      let dynamic = [];
      try {
        const res = await api.get('/public/companies');
        if (res.data.success) {
          dynamic = res.data.data.map(c => ({
            name: c.name,
            package: null,
            hired: null,
            isStatic: false,
          }));
        }
      } catch {
        // API unavailable — show static only
      }

      // Build a name→company map; dynamic entries override static ones
      const map = new Map();
      staticRecruiters.forEach(c => map.set(c.name.toLowerCase(), c));
      dynamic.forEach(c => {
        const key = c.name.toLowerCase();
        if (map.has(key)) {
          const existing = map.get(key);
          map.set(key, {
            ...existing,
            ...c,
            package: c.package || existing.package,
            hired: c.hired ?? existing.hired,
          });
        } else {
          map.set(key, c);
        }
      });

      setCompanies(Array.from(map.values()));
    };

    mergeCompanies();
  }, []);

  if (companies.length === 0) return null;

  // Double the list for infinite marquee scroll
  const doubled = [...companies, ...companies];

  return (
    <section className="py-16 bg-bauhaus-white border-b-4 border-bauhaus-black">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <h2 className="text-3xl sm:text-4xl font-black uppercase text-bauhaus-black text-center">
          Top <span className="text-bauhaus-blue">Recruiters</span>
        </h2>
        <p className="text-center text-bauhaus-black/50 font-medium mt-2 uppercase tracking-wider text-sm">
          Companies that hire from our campus
        </p>
      </div>
      <div className="overflow-hidden">
        <div className="marquee-track-left">
          {doubled.map((r, i) => (
            <div
              key={`${r.name}-${i}`}
              className="flex-shrink-0 mx-2 w-56 bg-white border-4 border-bauhaus-black p-4 shadow-hard-sm"
            >
              {/* Logo via Logo.dev API with letter-avatar fallback */}
              <CompanyLogo
                name={r.name}
                size={48}
                className="mb-3 border-2 border-bauhaus-black bg-white"
              />

              <p className="font-black text-bauhaus-black uppercase text-sm">{r.name}</p>
              <div className="flex items-center gap-3 mt-2 text-xs font-bold text-bauhaus-black/60">
                {r.package && <span>📦 {r.package}</span>}
                {r.hired != null && <span>👥 {r.hired} hired</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopRecruiters;
