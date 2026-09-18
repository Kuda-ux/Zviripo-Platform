export type ProductPreview = Readonly<{
  id: string;
  name: string;
  shop: string;
  price: string;
  area: string;
  distance: string;
  tag: string;
  tone: string;
}>;

export const products: ProductPreview[] = [
  {
    id: '1',
    name: 'Roller meal 10kg',
    shop: 'Mbare Value Store',
    price: '$8.50',
    area: 'Mbare',
    distance: '1.2 km',
    tag: 'In stock',
    tone: '#dff5e9',
  },
  {
    id: '2',
    name: 'Broiler starter feed',
    shop: 'Sunrise Agro',
    price: '$29.00',
    area: 'Highfield',
    distance: '3.4 km',
    tag: '12 available',
    tone: '#fff0d8',
  },
  {
    id: '3',
    name: 'School shoes · Size 5',
    shop: 'Tariro Fashion',
    price: '$18.00',
    area: 'Sakubva',
    distance: '4.1 km',
    tag: 'New',
    tone: '#e5ecff',
  },
];

export const inventory = [
  { id: '1', name: 'Coca-Cola 500ml', stock: 18, price: '$1.00' },
  { id: '2', name: 'Bread loaf', stock: 7, price: '$1.20' },
  { id: '3', name: 'Mazoe Orange 2L', stock: 4, price: '$3.50' },
  { id: '4', name: 'Roller meal 10kg', stock: 2, price: '$8.50' },
];
