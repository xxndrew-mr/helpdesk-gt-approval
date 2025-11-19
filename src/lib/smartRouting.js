// Lokasi: src/lib/smartRouting.js

export const routingMap = {
  // === PRODUK ===
  'PRODUK KOMPETITOR': {
    am_division: 'Divisi Operation', // Ke GM Operation
    ap_division: 'Divisi Prodev'     // Ke Staff Prodev
  },
  'PRODUK ONDA': {
    am_division: 'Divisi Operation',
    ap_division: 'Divisi Prodev'
  },

  // === STOK ===
  'STOCK': {
    am_division: 'Divisi Operation', // Ke GM Operation
    ap_division: 'Divisi Supply Chain' // Ke Supply Chain
  },
  'KIRIMAN': {
    am_division: 'Divisi Operation',
    ap_division: 'Divisi Supply Chain'
  },
  'RETURAN': {
    am_division: 'Divisi Operation',
    ap_division: 'Divisi Supply Chain'
  },

  // === PROGRAM ===
  'HADIAH PROGRAM': {
    am_division: 'Divisi Marketing Pusat', // Ke Marketing Mgr
    ap_division: 'Divisi Marketing Pusat'  // Ke Staff Marketing
  },
  'SKEMA PROGRAM': {
    am_division: 'Divisi Marketing Pusat',
    ap_division: 'Divisi Marketing Pusat'
  },
  'INSENTIF': {
    am_division: 'Divisi Sales Operation', // Ke Sales Op Mgr
    ap_division: 'Divisi Sales Operation'  // Ke Staff Sales Op
  },

  // === TOOLS ===
  'FLYER PROGRAM': {
    am_division: 'Divisi Sales Operation',
    ap_division: 'Divisi Sales Operation'
  },
  'PERALATAN': {
    am_division: 'Divisi Sales Operation',
    ap_division: 'Divisi Sales Operation'
  },
  'OTHERS': {
     // Default fallback jika ada
    am_division: 'Divisi Operation',
    ap_division: 'Divisi Supply Chain'
  }
};

export function getRoutingTarget(subKategori) {
  // Normalisasi input (uppercase)
  const key = subKategori?.toUpperCase();
  return routingMap[key] || null;
}