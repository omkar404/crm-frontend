export const RCMC_TYPE_MAP = {
  "Agriculture & Food": [
    "APEDA",
    "Spices Board",
    "Tea Board",
    "Coffee Board",
    "Rubber Board",
    "Tobacco Board",
    "Coconut Board",
  ],
  "Engineering & Tech": [
    "EEPC India(Engineering)",
    "ESC(Electronics & Software)",
    "TEPC(Telecom Equipment)",
  ],
  "Chem, Pharma & Plastics": [
    "CHEMEXCIL",
    "PHARMEXCIL",
    "PLEXCONCIL",
    "CAPEXIL",
    "SHEFEXIL",
  ],
  "Textiles & Apparel": [
    "AEPC(Garments)",
    "TEXPROCIL(Cotton)",
    "MATEXIL",
    "HEPC",
    "CEPC",
    "WWEPC",
    "ISEPC",
    "Jute Board",
  ],
  "Lifestyle & Specialized": [
    "GJEPC",
    "CLE",
    "EPCH",
    "SGEPC",
    "MPEDA",
    "CEPC",
    "IOPEPC",
  ],
  "General & Services": [
    "FIEO(Multi-Product/Trader)",
    "SEPC(Services EPC)",
    "PEPC(Project Exports)",
    "EIC(Export Inspection Council)",
  ],
};

export const RCMC_PANEL_OPTIONS = Object.keys(RCMC_TYPE_MAP);
export const RCMC_TYPE_OPTIONS = [...new Set(Object.values(RCMC_TYPE_MAP).flat())];
