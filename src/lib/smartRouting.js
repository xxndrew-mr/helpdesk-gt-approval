// Lokasi: src/lib/smartRouting.js

export const routingMap = {
  // === PRODUK ===
  'PRODUK KOMPETITOR': {
    am_division: 'Divisi Operation', // GM Operation
    ap_division: 'Divisi Prodev'     // Staff Prodev
  },
  'PRODUK ONDA': {
    am_division: 'Divisi Operation',
    ap_division: 'Divisi Prodev'
  },
  // --- UPDATE BARU SESUAI REQUEST ---
  'KUANTITAS': {
    am_division: 'Divisi Operation', // GM Operation
    ap_division: 'Divisi Prodev'     // Staff Prodev
  },
  'KUALITAS': {
    am_division: 'Divisi Operation', // GM Operation
    ap_division: 'Divisi Prodev'     // Staff Prodev
  },
  // ----------------------------------

  // === STOK ===
  'STOK': { // Jaga-jaga jika ejaan berbeda
    am_division: 'Divisi Operation', 
    ap_division: 'Divisi Supply Chain' 
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
    am_division: 'Divisi Marketing Pusat', 
    ap_division: 'Divisi Marketing Pusat'  
  },
  'SKEMA PROGRAM': {
    am_division: 'Divisi Marketing Pusat',
    ap_division: 'Divisi Marketing Pusat'
  },
  'INSENTIF': {
    am_division: 'Divisi Sales Operation', 
    ap_division: 'Divisi Sales Operation'  
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
  'LAINNYA': {
    am_division: 'Divisi Operation',
    ap_division: 'Divisi Supply Chain'
  }
};

export function getRoutingTarget(subKategori) {
  if (!subKategori) return null;
  // Normalisasi input (uppercase) agar tidak sensitif huruf besar/kecil
  const key = subKategori.toUpperCase();
  return routingMap[key] || null;
}