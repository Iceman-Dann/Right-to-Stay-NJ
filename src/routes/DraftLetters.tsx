import { useState } from 'react'
import { PageIntro, useTranslation, PrintIcon, BackIcon } from '../components'
import { recordEvent } from '../data/privacy'

type LetterType = 'habitability' | 'harassment' | 'deposit' | 'utility'

export function DraftLetters() {
  const { t, lang } = useTranslation()
  const [letterType, setLetterType] = useState<LetterType>('habitability')
  
  // Form fields
  const [tenantName, setTenantName] = useState('')
  const [landlordName, setLandlordName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split('T')[0])

  // Security deposit calculator fields
  const [depositAmount, setDepositAmount] = useState('')
  const [interestEarned, setInterestEarned] = useState('0.00')
  const [deductionsAmount, setDeductionsAmount] = useState('0.00')
  const [moveOutDate, setMoveOutDate] = useState('')

  // Utility moratorium fields
  const [utilityCompany, setUtilityCompany] = useState('PSE&G')
  const [utilityAccount, setUtilityAccount] = useState('')
  const [assistanceProgram, setAssistanceProgram] = useState('HEAP')
  
  // Checklist states
  const [deficiencies, setDeficiencies] = useState({
    heat: false,
    leaks: false,
    mold: false,
    pests: false,
    locks: false,
    other: false,
  })
  const [otherDeficiencyDetail, setOtherDeficiencyDetail] = useState('')

  const [threats, setThreats] = useState({
    lockout: false,
    utilities: false,
    entry: false,
    verbal: false,
    other: false,
  })
  const [otherThreatDetail, setOtherThreatDetail] = useState('')

  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  // Toggle helpers
  function toggleDeficiency(key: keyof typeof deficiencies) {
    setDeficiencies(d => ({ ...d, [key]: !d[key] }))
  }

  function toggleThreat(key: keyof typeof threats) {
    setThreats(t => ({ ...t, [key]: !t[key] }))
  }

  // Generate Letter Text
  function generateLetterText(): string {
    const dateFormatted = letterDate || new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')
    
    if (letterType === 'habitability') {
      const selectedList: string[] = []
      if (deficiencies.heat) selectedList.push(lang === 'es' ? '- Falta de calefacción o agua caliente' : '- No heat or hot water')
      if (deficiencies.leaks) selectedList.push(lang === 'es' ? '- Goteras, filtraciones o problemas de plomería' : '- Water leaks or plumbing issues')
      if (deficiencies.mold) selectedList.push(lang === 'es' ? '- Moho grave o fallas de ventilación' : '- Severe mold or ventilation failure')
      if (deficiencies.pests) selectedList.push(lang === 'es' ? '- Plagas (chinches, roedores o cucarachas)' : '- Pest infestation (bedbugs, rodents, or roaches)')
      if (deficiencies.locks) selectedList.push(lang === 'es' ? '- Cerraduras, puertas o ventanas rotas/inseguras' : '- Broken locks, doors, or unsafe windows')
      if (deficiencies.other && otherDeficiencyDetail) selectedList.push(`- ${otherDeficiencyDetail}`)

      const listText = selectedList.length > 0 
        ? selectedList.join('\n') 
        : (lang === 'es' ? '- Múltiples defectos de habitabilidad no resueltos' : '- Various unresolved habitability defects')

      const propertyAddress = address || (lang === 'es' ? '[Su Dirección]' : '[Your Address]')
      const propertyCity = city || (lang === 'es' ? '[Ciudad]' : '[City]')
      const propLandlord = landlordName || (lang === 'es' ? '[Nombre del Propietario]' : '[Landlord / Management Name]')
      const propTenant = tenantName || (lang === 'es' ? '[Su Nombre]' : '[Your Name]')

      if (lang === 'es') {
        return `Fecha: ${dateFormatted}

Estimado/a ${propLandlord},

Le escribo para notificarle formalmente sobre deficiencias graves de habitabilidad en mi apartamento ubicado en:
${propertyAddress} en ${propertyCity}, NJ.

Específicamente, las siguientes áreas requieren reparación o mantenimiento urgente bajo las leyes estatales:
${listText}

Bajo la ley de Nueva Jersey, incluyendo el caso precedente de la Corte Suprema del estado "Marini v. Ireland", los propietarios tienen la obligación legal implícita de mantener las viviendas en condiciones habitables. Si estas deficiencias no se solucionan a la brevedad, me reservo el derecho de ejercer cualquiera de los recursos provistos por la ley:
1. Contratar las reparaciones por mi cuenta y deducir su costo del pago mensual de alquiler (Reparar y Deducir).
2. Retener una porción razonable del alquiler hasta que se realicen todas las reparaciones necesarias.

Por favor, comuníquese conmigo de inmediato para coordinar la fecha y hora de las reparaciones.

Atentamente,

${propTenant}`
      } else {
        return `Date: ${dateFormatted}

Dear ${propLandlord},

I am writing to formally notify you of serious habitability deficiencies inside my rental apartment located at:
${propertyAddress} in ${propertyCity}, NJ.

Specifically, the following vital conditions are defective and require immediate repair under New Jersey state law:
${listText}

Under New Jersey landlord-tenant laws, including the landmark Supreme Court decision in "Marini v. Ireland", landlords have an absolute duty to maintain the rental unit in a safe, clean, and habitable condition. If these urgent issues are not resolved promptly, I reserve my legal rights to:
1. Pay out-of-pocket to repair these defects and deduct the cost from my monthly rent payments (Repair and Deduct).
2. Withhold a portion of my rent until these deficiencies are fully resolved.

Please contact me immediately to schedule the required repairs.

Sincerely,

${propTenant}`
      }
    } else if (letterType === 'harassment') {
      // Harassment Letter
      const selectedList: string[] = []
      if (threats.lockout) selectedList.push(lang === 'es' ? '- Amenazas de cambiar cerraduras / desalojo ilegal sin orden judicial' : '- Threats to change locks or execute self-help lockout')
      if (threats.utilities) selectedList.push(lang === 'es' ? '- Amenazas de corte de servicios públicos (gas, luz o agua)' : '- Threats to cut off utilities (gas, electricity, water)')
      if (threats.entry) selectedList.push(lang === 'es' ? '- Entradas no anunciadas e ilegales al apartamento sin mi consentimiento' : '- Landlord/staff entering the unit without warning or consent')
      if (threats.verbal) selectedList.push(lang === 'es' ? '- Mensajes de texto hostiles, acoso continuo o insultos verbales' : '- Hostile messages, persistent text harassment, or verbal abuse')
      if (threats.other && otherThreatDetail) selectedList.push(`- ${otherThreatDetail}`)

      const listText = selectedList.length > 0 
        ? selectedList.join('\n') 
        : (lang === 'es' ? '- Acoso y hostigamiento contra mi tenencia' : '- Harassment and intimidation regarding my tenancy')

      const propertyAddress = address || (lang === 'es' ? '[Su Dirección]' : '[Your Address]')
      const propertyCity = city || (lang === 'es' ? '[Ciudad]' : '[City]')
      const propLandlord = landlordName || (lang === 'es' ? '[Nombre del Propietario]' : '[Landlord / Management Name]')
      const propTenant = tenantName || (lang === 'es' ? '[Su Nombre]' : '[Your Name]')

      if (lang === 'es') {
        return `Fecha: ${dateFormatted}

Estimado/a ${propLandlord},

Le escribo para exigirle que cese y desista de inmediato de todo acoso, amenaza o acción ilegal en contra de mi tenencia en:
${propertyAddress} en ${propertyCity}, NJ.

Específicamente, he sido objeto del siguiente hostigamiento y/o amenazas por su parte:
${listText}

Tenga en cuenta que bajo el estatuto de Nueva Jersey N.J.S.A. 2A:39-1, es un delito menor y civilmente sancionable que un propietario intente un desalojo por mano propia ("self-help lockout"). Esto incluye cambiar las llaves, quitar puertas, o cortar servicios de agua, gas o electricidad sin que un oficial del tribunal ejecute una Orden de Lanzamiento oficial.

Exijo que toda comunicación futura se realice exclusivamente por escrito (correo electrónico o carta física) y con el debido profesionalismo. Registraré cualquier violación posterior y la reportaré a las autoridades correspondientes y a ayuda legal.

Atentamente,

${propTenant}`
      } else {
        return `Date: ${dateFormatted}

Dear ${propLandlord},

I am writing to demand that you immediately cease and desist all unlawful harassment, threats, or intimidating actions regarding my tenancy at:
${propertyAddress} in ${propertyCity}, NJ.

Specifically, I have been subjected to the following harassing or threatening actions by you or your agents:
${listText}

Please be advised that under New Jersey statute N.J.S.A. 2A:39-1, it is a criminal and civil offense for a landlord to execute a self-help eviction. Landlords are strictly prohibited from changing locks, blocking access, removing doors, or shutting off utilities without a Special Civil Part officer executing a court-ordered Warrant for Removal. Any self-help eviction attempt will be reported to law enforcement immediately.

I demand that all future communication regarding my tenancy be conducted strictly in writing (email or physical mail) and in a professional manner. I will log any further incidents and refer them to legal aid or the court.

Sincerely,

${propTenant}`
      }
    } else if (letterType === 'deposit') {
      const dep = parseFloat(depositAmount) || 0
      const intr = parseFloat(interestEarned) || 0
      const ded = parseFloat(deductionsAmount) || 0
      const net = Math.max(0, dep + intr - ded).toFixed(2)

      const propertyAddress = address || (lang === 'es' ? '[Su Dirección]' : '[Your Address]')
      const propertyCity = city || (lang === 'es' ? '[Ciudad]' : '[City]')
      const propLandlord = landlordName || (lang === 'es' ? '[Nombre del Arrendador]' : '[Landlord / Management Name]')
      const propTenant = tenantName || (lang === 'es' ? '[Su Nombre]' : '[Your Name]')
      const outDate = moveOutDate || (lang === 'es' ? '[Fecha de Desocupación]' : '[Move-Out Date]')

      if (lang === 'es') {
        return `Fecha: ${dateFormatted}

Estimado/a ${propLandlord},

Le escribo para exigir formalmente la devolución total de mi depósito de seguridad de la propiedad que alquilé ubicada en:
${propertyAddress} en ${propertyCity}, NJ.

Mi tenencia finalizó oficialmente el ${outDate}, fecha en la cual desocupé y entregué la propiedad.

El desglose del depósito de seguridad es el siguiente:
- Depósito original: $${dep.toFixed(2)}
- Intereses acumulados devengados: $${intr.toFixed(2)}
- Menos deducciones cobradas: $${ded.toFixed(2)}
- Saldo neto a devolver: $${net}

Bajo el estatuto de Nueva Jersey N.J.S.A. 46:8-21.1, los propietarios tienen la obligación legal estricta de devolver el depósito de seguridad con todos los intereses acumulados, menos deducciones permitidas, en un plazo máximo de 30 días después de terminar el contrato de arrendamiento. Dicho período de 30 días ha transcurrido sin recibir la devolución correspondiente.

Si el saldo total de $${net} no es devuelto dentro de los 7 días hábiles posteriores a la entrega de esta notificación, presentaré una queja formal en la Sección de Reclamos Menores de la Corte de NJ. Tenga en cuenta que bajo N.J.S.A. 46:8-21.1, la corte tiene la facultad de ordenar el pago del doble del monto neto retenido ilegalmente, además de los costos judiciales.

Por favor, envíe el pago correspondiente a mi dirección postal actual.

Atentamente,

${propTenant}`
      } else {
        return `Date: ${dateFormatted}

Dear ${propLandlord},

I am writing to formally demand the full return of my security deposit for the rental unit previously occupied by me at:
${propertyAddress} in ${propertyCity}, NJ.

My tenancy terminated on ${outDate}, and I vacated the premises on that date.

The breakdown of the security deposit calculations is as follows:
- Original security deposit amount: $${dep.toFixed(2)}
- Accrued interest earned: $${intr.toFixed(2)}
- Less deductions claimed: $${ded.toFixed(2)}
- Total net refund due: $${net}

Under New Jersey Statute N.J.S.A. 46:8-21.1, landlords are legally required to return a tenant's security deposit plus interest, less any lawful and itemized deductions, within 30 days after the tenancy terminates. That 30-day statutory window has expired without receiving the refund.

If the full net amount of $${net} is not received within 7 business days of this demand notice, I will file a lawsuit in the Small Claims section of the NJ Special Civil Part. Please be advised that under N.J.S.A. 46:8-21.1, the court is required to award double the net amount wrongfully withheld, plus court costs.

Please mail the check immediately to my current mailing address.

Sincerely,

${propTenant}`
      }
    } else {
      // Utility Letter
      const propertyAddress = address || (lang === 'es' ? '[Su Dirección]' : '[Your Address]')
      const propertyCity = city || (lang === 'es' ? '[Ciudad]' : '[City]')
      const propTenant = tenantName || (lang === 'es' ? '[Su Nombre]' : '[Your Name]')
      const company = utilityCompany || 'PSE&G'
      const acct = utilityAccount || (lang === 'es' ? '[Número de Cuenta]' : '[Account Number]')
      const prog = assistanceProgram || 'HEAP'

      if (lang === 'es') {
        return `Fecha: ${dateFormatted}

Estimado/a Representante de ${company},

Le escribo para disputar formalmente la suspensión programada del servicio de mi cuenta residencial número: ${acct} en la dirección:
${propertyAddress} en ${propertyCity}, NJ.

Soy un cliente residencial elegible que participa activamente en el programa estatal de asistencia pública: ${prog}.

Bajo las regulaciones de la Junta de Servicios Públicos de Nueva Jersey (BPU) y el Programa de Moratoria de Invierno (Winter Termination Program), las compañías de servicios públicos tienen estrictamente prohibido suspender el servicio de electricidad, gas o agua entre el 15 de noviembre y el 15 de marzo para los clientes que califiquen y participen en programas de asistencia designados.

Por lo tanto, solicito formalmente que suspendan cualquier orden de corte de servicios en mi hogar de inmediato y mantengan mi cuenta activa. Estoy dispuesto a establecer un plan de pago diferido razonable de conformidad con las pautas del programa.

Agradezco su atención urgente a esta disputa.

Atentamente,

${propTenant}`
      } else {
        return `Date: ${dateFormatted}

Dear Customer Service at ${company},

I am writing to formally dispute the scheduled termination of utility services for my residential account number: ${acct} at the address:
${propertyAddress} in ${propertyCity}, NJ.

I am a residential customer participating in the state-approved public assistance program: ${prog}.

Under the rules of the New Jersey Board of Public Utilities (BPU) and the Winter Termination Program, utilities are strictly prohibited from shutting off electricity, gas, or water services between November 15 and March 15 for residential customers who participate in designated public assistance programs.

Therefore, I request that you halt any pending shutoff actions immediately and maintain active utility services at my home. I am prepared to coordinate a reasonable deferred payment arrangement for outstanding balances as permitted under program guidelines.

Thank you for your prompt attention to this matter.

Sincerely,

${propTenant}`
      }
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setGenerated(true)
    recordEvent({ eventType: 'draft_generated', outcome: `letter_${letterType}` })
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generateLetterText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="shell page-section">
      <div className="print-hide">
        <PageIntro eyebrow={t('nav_draft_letters')} title={t('letters_title')}>
          <p>{t('letters_subtitle')}</p>
        </PageIntro>
      </div>

      {/* Print-Only Layout Header */}
      <div className="hidden print:block border-b-2 border-ink pb-4 mb-8">
        <h1 className="text-xl font-bold uppercase tracking-wider">{t('letters_title')}</h1>
        <p className="text-xs text-margin font-semibold mt-1">Right to Stay NJ — {t('nav_draft_letters')}</p>
      </div>

      {!generated ? (
        <form onSubmit={handleCreate} className="interview max-w-2xl mt-8">
          {/* Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-margin uppercase mb-2">
              {t('letters_select_type')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLetterType('habitability')}
                className={`py-3 px-4 border rounded-md text-xs font-semibold cursor-pointer active:scale-97 transition ${
                  letterType === 'habitability' ? 'bg-ink border-ink text-paper' : 'border-rule text-ink hover:bg-rule/10'
                }`}
              >
                🛠️ {t('letters_habitability')}
              </button>
              <button
                type="button"
                onClick={() => setLetterType('harassment')}
                className={`py-3 px-4 border rounded-md text-xs font-semibold cursor-pointer active:scale-97 transition ${
                  letterType === 'harassment' ? 'bg-ink border-ink text-paper' : 'border-rule text-ink hover:bg-rule/10'
                }`}
              >
                🚩 {t('letters_harassment')}
              </button>
              <button
                type="button"
                onClick={() => setLetterType('deposit')}
                className={`py-3 px-4 border rounded-md text-xs font-semibold cursor-pointer active:scale-97 transition ${
                  letterType === 'deposit' ? 'bg-ink border-ink text-paper' : 'border-rule text-ink hover:bg-rule/10'
                }`}
              >
                💰 {lang === 'es' ? 'Depósito de Seguridad' : 'Security Deposit'}
              </button>
              <button
                type="button"
                onClick={() => setLetterType('utility')}
                className={`py-3 px-4 border rounded-md text-xs font-semibold cursor-pointer active:scale-97 transition ${
                  letterType === 'utility' ? 'bg-ink border-ink text-paper' : 'border-rule text-ink hover:bg-rule/10'
                }`}
              >
                ❄️ {lang === 'es' ? 'Moratoria de Servicios' : 'Utility Moratorium'}
              </button>
            </div>
          </div>

          <fieldset className="border border-rule rounded-lg p-6 bg-paper/50">
            <legend className="text-sm font-bold uppercase tracking-wider text-ink px-2 bg-paper">
              {lang === 'es' ? 'Datos Básicos' : 'Basic Letter Details'}
            </legend>

            <label className="text-xs font-semibold text-ink">
              {t('letters_form_tenant_name')}
              <input
                type="text"
                required
                value={tenantName}
                onChange={e => setTenantName(e.target.value)}
                className="mt-1 font-normal"
                placeholder="e.g. Maria Santos"
              />
            </label>

            <label className="text-xs font-semibold text-ink">
              {t('letters_form_landlord_name')}
              <input
                type="text"
                required
                value={landlordName}
                onChange={e => setLandlordName(e.target.value)}
                className="mt-1 font-normal"
                placeholder="e.g. Broad Street Apartments LLC"
              />
            </label>

            <label className="text-xs font-semibold text-ink">
              {t('letters_form_address')}
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="mt-1 font-normal"
                placeholder="e.g. 123 Main St, Apt 4B"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-ink">
                {t('letters_form_city')}
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="mt-1 font-normal"
                  placeholder="e.g. Newark"
                />
              </label>

              <label className="text-xs font-semibold text-ink">
                {t('letters_form_date')}
                <input
                  type="date"
                  required
                  value={letterDate}
                  onChange={e => setLetterDate(e.target.value)}
                  className="mt-1 font-normal"
                />
              </label>
            </div>
          </fieldset>

          {/* Letter Specific checklists */}
          {letterType === 'habitability' ? (
            <div className="mt-8 bg-paper border border-rule rounded-lg p-6">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-4 border-b border-rule/50 pb-2">
                {t('letters_lbl_deficiencies')}
              </h3>
              <div className="space-y-3">
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deficiencies.heat}
                    onChange={() => toggleDeficiency('heat')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_def_heat')}</span>
                </label>
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deficiencies.leaks}
                    onChange={() => toggleDeficiency('leaks')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_def_leaks')}</span>
                </label>
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deficiencies.mold}
                    onChange={() => toggleDeficiency('mold')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_def_mold')}</span>
                </label>
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deficiencies.pests}
                    onChange={() => toggleDeficiency('pests')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_def_pests')}</span>
                </label>
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deficiencies.locks}
                    onChange={() => toggleDeficiency('locks')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_def_locks')}</span>
                </label>
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deficiencies.other}
                    onChange={() => toggleDeficiency('other')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_def_other')}</span>
                </label>

                {deficiencies.other && (
                  <input
                    type="text"
                    required
                    value={otherDeficiencyDetail}
                    onChange={e => setOtherDeficiencyDetail(e.target.value)}
                    placeholder={t('letters_placeholder_other')}
                    className="mt-2 w-full p-2 border border-rule bg-paper text-sm rounded"
                  />
                )}
              </div>
            </div>
          ) : letterType === 'harassment' ? (
            <div className="mt-8 bg-paper border border-rule rounded-lg p-6">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-4 border-b border-rule/50 pb-2">
                {t('letters_lbl_threats')}
              </h3>
              <div className="space-y-3">
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={threats.lockout}
                    onChange={() => toggleThreat('lockout')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_threat_lockout')}</span>
                </label>
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={threats.utilities}
                    onChange={() => toggleThreat('utilities')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_threat_utilities')}</span>
                </label>
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={threats.entry}
                    onChange={() => toggleThreat('entry')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_threat_entry')}</span>
                </label>
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={threats.verbal}
                    onChange={() => toggleThreat('verbal')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_threat_verbal')}</span>
                </label>
                <label className="flex items-center flex-row gap-3 font-semibold text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={threats.other}
                    onChange={() => toggleThreat('other')}
                    className="w-4 h-4 rounded border-rule text-ink"
                  />
                  <span>{t('letters_threat_other')}</span>
                </label>

                {threats.other && (
                  <input
                    type="text"
                    required
                    value={otherThreatDetail}
                    onChange={e => setOtherThreatDetail(e.target.value)}
                    placeholder={t('letters_placeholder_other')}
                    className="mt-2 w-full p-2 border border-rule bg-paper text-sm rounded"
                  />
                )}
              </div>
            </div>
          ) : letterType === 'deposit' ? (
            <div className="mt-8 bg-paper border border-rule rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-4 border-b border-rule/50 pb-2">
                💰 {lang === 'es' ? 'Cálculos de Depósito (N.J.S.A. 46:8-21.1)' : 'Security Deposit Calculator (N.J.S.A. 46:8-21.1)'}
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-ink flex flex-col gap-1">
                  {lang === 'es' ? 'Monto Original del Depósito ($)' : 'Original Deposit Amount ($)'}
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="e.g. 1500.00"
                    className="p-2 border border-rule rounded text-sm bg-paper font-normal"
                  />
                </label>

                <label className="text-xs font-semibold text-ink flex flex-col gap-1">
                  {lang === 'es' ? 'Intereses Acumulados ($)' : 'Accrued Interest ($)'}
                  <input
                    type="number"
                    step="0.01"
                    value={interestEarned}
                    onChange={e => setInterestEarned(e.target.value)}
                    placeholder="e.g. 12.50"
                    className="p-2 border border-rule rounded text-sm bg-paper font-normal"
                  />
                </label>

                <label className="text-xs font-semibold text-ink flex flex-col gap-1">
                  {lang === 'es' ? 'Deducciones del Arrendador ($)' : 'Landlord Deductions ($)'}
                  <input
                    type="number"
                    step="0.01"
                    value={deductionsAmount}
                    onChange={e => setDeductionsAmount(e.target.value)}
                    placeholder="e.g. 150.00"
                    className="p-2 border border-rule rounded text-sm bg-paper font-normal"
                  />
                </label>

                <label className="text-xs font-semibold text-ink flex flex-col gap-1">
                  {lang === 'es' ? 'Fecha de Entrega de Llaves' : 'Move-Out Date'}
                  <input
                    type="date"
                    required
                    value={moveOutDate}
                    onChange={e => setMoveOutDate(e.target.value)}
                    className="p-2 border border-rule rounded text-sm bg-paper font-normal"
                  />
                </label>
              </div>

              {(() => {
                const dep = parseFloat(depositAmount) || 0
                const intr = parseFloat(interestEarned) || 0
                const ded = parseFloat(deductionsAmount) || 0
                const net = Math.max(0, dep + intr - ded)
                
                let isExpired = false
                let daysCount = 0
                if (moveOutDate) {
                  const diff = Date.now() - new Date(moveOutDate + 'T00:00:00').getTime()
                  daysCount = Math.floor(diff / (1000 * 60 * 60 * 24))
                  isExpired = daysCount > 30
                }

                return (
                  <div className="mt-4 p-4 rounded-lg bg-rule/10 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-rule pb-2 font-bold text-ink">
                      <span>{lang === 'es' ? 'Reembolso Neto Estimado:' : 'Estimated Net Refund:'}</span>
                      <span className="text-emerald-800">${net.toFixed(2)}</span>
                    </div>
                    {isExpired && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded font-semibold text-emerald-800 animate-fade-in">
                        ✓ {lang === 'es' 
                          ? `Han pasado ${daysCount} días. El plazo de 30 días de la ley de NJ ha vencido.` 
                          : `It has been ${daysCount} days. The 30-day statutory return period has expired.`}
                        <br/>
                        💰 {lang === 'es' 
                          ? `Usted puede reclamar daños dobles por un valor de $${(net * 2).toFixed(2)} en el Tribunal.`
                          : `You can sue for double damages up to $${(net * 2).toFixed(2)} in Court.`}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="mt-8 bg-paper border border-rule rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-4 border-b border-rule/50 pb-2">
                ❄️ {lang === 'es' ? 'Moratoria de Corte de Servicios Públicos' : 'Utility Shutoff Moratorium Program'}
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-ink flex flex-col gap-1">
                  {lang === 'es' ? 'Compañía de Servicios' : 'Utility Provider'}
                  <select
                    value={utilityCompany}
                    onChange={e => setUtilityCompany(e.target.value)}
                    className="p-2 border border-rule rounded bg-paper text-sm font-normal"
                  >
                    <option value="PSE&G">PSE&G</option>
                    <option value="JCP&L">JCP&L</option>
                    <option value="Atlantic City Electric">Atlantic City Electric</option>
                    <option value="New Jersey Natural Gas">New Jersey Natural Gas</option>
                    <option value="Elizabethtown Gas">Elizabethtown Gas</option>
                    <option value="South Jersey Gas">South Jersey Gas</option>
                    <option value="Other">Other / Otra</option>
                  </select>
                </label>

                <label className="text-xs font-semibold text-ink flex flex-col gap-1">
                  {lang === 'es' ? 'Número de Cuenta de Servicio' : 'Utility Account Number'}
                  <input
                    type="text"
                    required
                    value={utilityAccount}
                    onChange={e => setUtilityAccount(e.target.value)}
                    placeholder="e.g. 12-3456-789-0"
                    className="p-2 border border-rule rounded bg-paper text-sm font-normal"
                  />
                </label>

                <label className="text-xs font-semibold text-ink flex flex-col gap-1 sm:col-span-2">
                  {lang === 'es' ? 'Programa de Asistencia en el que participa' : 'Registered Public Assistance Program'}
                  <select
                    value={assistanceProgram}
                    onChange={e => setAssistanceProgram(e.target.value)}
                    className="p-2 border border-rule rounded bg-paper text-sm font-normal"
                  >
                    <option value="HEAP (Home Energy Assistance Program)">HEAP / LIHEAP (Energy assistance)</option>
                    <option value="USF (Universal Service Fund)">USF (Universal Service Fund)</option>
                    <option value="Lifeline Credit / Utility Assistance">Lifeline Credit Program</option>
                    <option value="PAGE (Payment Assistance for Gas and Electric)">PAGE Energy Aid</option>
                    <option value="LIHWAP (Low Income Household Water Assistance)">LIHWAP Water Assistance</option>
                  </select>
                </label>
              </div>

              <div className="p-3.5 bg-sky-50 border border-sky-150 rounded text-xs text-sky-950 font-semibold space-y-1">
                <span className="block text-sky-900 font-bold">❄️ {lang === 'es' ? 'Programa de Protección de Invierno (WTP):' : 'Winter Termination Program Moratorium:'}</span>
                <p className="leading-relaxed">
                  {lang === 'es'
                    ? 'Bajo las regulaciones de la BPU de Nueva Jersey, está estrictamente prohibido cortar el gas, la luz o el agua entre el 15 de noviembre y el 15 de marzo a inquilinos participantes de estos programas.'
                    : 'NJ Board of Public Utilities (BPU) rules prevent energy shutoffs from Nov 15 to Mar 15 for low-income program participants.'}
                </p>
              </div>
            </div>
          )}

          <button type="submit" className="primary-cta w-full py-3.5 mt-8 font-bold active:scale-97 transition">
            {lang === 'es' ? 'Generar Carta Formal' : 'Generate Formal Letter'}
          </button>
        </form>
      ) : (
        <article className="draft-packet relative bg-paper border-2 border-ink p-8 rounded-lg shadow-md max-w-2xl mt-8">
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink select-text">
            {generateLetterText()}
          </div>

          {/* Letter actions */}
          <div className="draft-actions print-hide flex flex-wrap gap-3 mt-8 pt-6 border-t border-rule">
            <button
              onClick={() => window.print()}
              className="primary-cta py-3 px-6 flex items-center gap-1.5 active:scale-97 transition font-bold"
            >
              <PrintIcon className="w-5 h-5" />
              {t('letters_btn_print')}
            </button>
            <button
              onClick={copyToClipboard}
              className="action-btn py-3 px-6 rounded-md flex items-center gap-1.5 active:scale-97 transition font-semibold"
            >
              <span>{copied ? t('btn_copied') : t('letters_btn_copy')}</span>
            </button>
            <button
              onClick={() => setGenerated(false)}
              className="action-btn py-3 px-6 rounded-md flex items-center gap-1.5 active:scale-97 transition font-semibold"
            >
              <BackIcon className="w-5 h-5" />
              {t('btn_edit')}
            </button>
          </div>
        </article>
      )}
    </section>
  )
}
