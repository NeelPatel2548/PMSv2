import { useState, useEffect } from "react";

// Logo.dev Search API — finds domain by brand name
// Docs: https://www.logo.dev/docs
const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN || "";
const LOGO_DEV_SECRET = import.meta.env.VITE_LOGO_DEV_SECRET || "";

const domainCache = {}; // in-memory cache to avoid repeated API calls

const fetchDomain = async (companyName) => {
  if (domainCache[companyName]) return domainCache[companyName];
  try {
    const res = await fetch(
      `https://api.logo.dev/search?q=${encodeURIComponent(companyName)}`, 
      {
        headers: {
          'Authorization': `Bearer ${LOGO_DEV_SECRET}`,
        }
      }
    );
    const data = await res.json();
    const domain = data?.[0]?.domain || null;
    domainCache[companyName] = domain;
    return domain;
  } catch {
    return null;
  }
};

const CompanyLogo = ({ name, size = 48, className = "" }) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchDomain(name).then((domain) => {
      if (domain) {
        setLogoUrl(
          `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${size}&format=png`
        );
      } else {
        setFailed(true);
      }
    });
  }, [name, size]);

  // Monogram fallback — clean letter avatar, never a broken image icon
  if (failed || !logoUrl) {
    return (
      <div
        className={`flex items-center justify-center font-black text-white bg-bauhaus-black ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
};

export default CompanyLogo;
