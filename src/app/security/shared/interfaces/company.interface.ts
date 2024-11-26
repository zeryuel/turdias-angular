export interface Company {
  id: number;
  ruc: string;
  reasonSocial: string;
  fiscalAddress: string;
  deliveryPlace: string;
  email: string;
  phone: string;
  logo: string;
  signature: string;
  apis: {
    security: string;
    logistics: string;
    maintenance: string;
  }
}
