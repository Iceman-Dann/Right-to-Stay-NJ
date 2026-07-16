export interface GlossaryItem {
  term: string
  definition: {
    en: string
    es: string
  }
}

export const glossary: Record<string, GlossaryItem> = {
  notice_to_cease: {
    term: 'Notice to Cease',
    definition: {
      en: 'A formal warning letter from a landlord telling a tenant to stop violating a lease term or rule before an eviction lawsuit can be filed.',
      es: 'Una advertencia formal por escrito del arrendador que ordena detener un comportamiento o infracción del contrato antes de poder iniciar una demanda.'
    }
  },
  notice_to_quit: {
    term: 'Notice to Quit',
    definition: {
      en: 'A legal document demanding that a tenant move out of the property by a certain date. It is a required warning step before a landlord can file an eviction lawsuit.',
      es: 'Un documento legal que exige al inquilino desalojar la propiedad en una fecha límite. Es un paso obligatorio antes de iniciar una demanda formal.'
    }
  },
  summons_complaint: {
    term: 'Summons & Complaint',
    definition: {
      en: 'The formal court documents starting an eviction lawsuit. The Summons states when and how to appear; the Complaint lists the landlord\'s allegations.',
      es: 'Los documentos de la corte que inician el caso. La Citación indica cuándo y cómo asistir; la Demanda enumera las alegaciones del propietario.'
    }
  },
  judgment_for_possession: {
    term: 'Judgment for Possession',
    definition: {
      en: 'A court ruling that gives a landlord the legal right to take back the rental property. It does NOT authorize the landlord to lock you out personally.',
      es: 'Una decisión del juez que otorga al propietario el derecho legal de recuperar la propiedad. NO autoriza al arrendador a cambiar las llaves por su cuenta.'
    }
  },
  warrant_of_removal: {
    term: 'Warrant of Removal',
    definition: {
      en: 'The final eviction document issued by the court authorizing a court officer (Special Civil Part Officer) to physically remove the tenant and execute a lockout.',
      es: 'El documento final del tribunal que autoriza a un oficial de la corte a realizar el desalojo físico y cambiar las cerraduras de la vivienda.'
    }
  },
  docket_number: {
    term: 'Docket Number',
    definition: {
      en: 'The unique identification number assigned to a court case (e.g. LT-123456-26) used to look up case files and status.',
      es: 'El número de identificación único asignado a un caso judicial (ej. LT-123456-26) para realizar consultas de expedientes.'
    }
  },
  marini_defense: {
    term: 'Marini Defense',
    definition: {
      en: 'An NJ legal rule letting tenants withhold or deduct rent for vital repair issues (like heat or hot water) if the landlord failed to act after written notice.',
      es: 'Regla legal de NJ que permite retener o deducir el alquiler por fallas vitales (calefacción, agua) si el propietario no actuó tras recibir aviso escrito.'
    }
  },
  mediation: {
    term: 'Mediation',
    definition: {
      en: 'A voluntary settlement process where a neutral third party (mediator) helps the landlord and tenant reach an agreement to avoid a trial.',
      es: 'Proceso voluntario de resolución donde un mediador neutral ayuda a las partes a llegar a un acuerdo firmado para evitar el juicio ante el juez.'
    }
  },
  holdover: {
    term: 'Holdover',
    definition: {
      en: 'An eviction case based on reasons other than non-payment of rent (e.g. lease violations, landlord moving in, or lease expiration).',
      es: 'Un caso de desalojo basado en motivos distintos a la falta de pago (ej. violar el contrato, vencimiento del plazo o si el dueño se muda).'
    }
  }
}
