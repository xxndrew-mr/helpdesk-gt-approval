export const routingMap = {
  PRODUK: {
    am_division: 'Divisi Operation',
    ap_division: 'Divisi Prodev',
  },

  'PROGRAM PENJUALAN': {
    am_division: 'Divisi Marketing Pusat',
    ap_division: 'Divisi Marketing Pusat',
  },

  KOMISI: {
    am_division: 'Divisi Sales Operation',
    ap_division: 'Divisi Sales Operation',
  },

  'TOOLS PENJUALAN': {
    am_division: 'Divisi Sales Operation',
    ap_division: 'Divisi Sales Operation',
  },

  LAINNYA: {
    am_division: 'Divisi Operation',
    ap_division: 'Divisi Operation',
  },
};

export function getRoutingTarget(kategori) {
  if (!kategori) return null;
  const key = kategori.toUpperCase();
  return routingMap[key] || null;
}
