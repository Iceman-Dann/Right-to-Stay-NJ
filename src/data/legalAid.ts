export interface LegalAidOffice {
  county: string
  organization: string
  phone: string
  address: string
}

// Current as of mid-2026. Phone numbers, addresses, and hours should be reverified periodically.
export const legalAidOffices: LegalAidOffice[] = [
  { county: 'Bergen', organization: 'Northeast NJ Legal Services', phone: '201-487-2166', address: '190 Moore St, Suite 100, Hackensack, NJ 07601' },
  { county: 'Hudson', organization: 'Northeast NJ Legal Services', phone: '201-792-6363', address: '574 Summit Ave, 2nd Floor, Jersey City, NJ 07306' },
  { county: 'Essex', organization: 'Essex County Legal Aid Association', phone: '973-624-4500', address: '5 Commerce St, 2nd Floor, Newark, NJ 07102' },
  { county: 'Union', organization: 'Legal Services of New Jersey', phone: '908-354-4340', address: '60 Prince St, Elizabeth, NJ 07208' },
  { county: 'Middlesex', organization: 'Central Jersey Legal Services', phone: '732-249-7600', address: '317 George St, Suite 201, New Brunswick, NJ 08901' },
  { county: 'Mercer', organization: 'Central Jersey Legal Services', phone: '609-695-6249', address: '198 West State St, Trenton, NJ 08608' },
  { county: 'Monmouth', organization: 'Legal Services of New Jersey', phone: '732-414-6750', address: '303 West Main St, 3rd Floor, Freehold, NJ 07728' },
  { county: 'Ocean', organization: 'Legal Services of New Jersey', phone: '732-608-7794', address: '215 Main St, Toms River, NJ 08753' },
  { county: 'Camden', organization: 'South Jersey Legal Services', phone: '856-964-2010', address: '745 Market St, Camden, NJ 08102' },
  { county: 'Burlington', organization: 'South Jersey Legal Services', phone: '609-261-1088', address: '107 High St, Mount Holly, NJ 08060' },
  { county: 'Gloucester', organization: 'South Jersey Legal Services', phone: '856-848-5360', address: '47 Newton Ave, Woodbury, NJ 08096' },
  { county: 'Passaic', organization: 'Northeast NJ Legal Services', phone: '973-977-4150', address: '66 Hamilton St, 3rd Floor, Paterson, NJ 07505' },
]
