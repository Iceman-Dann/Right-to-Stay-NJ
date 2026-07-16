import { useState } from 'react'
import useSWR from 'swr'
import { PageIntro, useTranslation } from '../components'

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Unable to load')
  return response.json()
}

type Row = { label: string; value: number }
type ImpactData = { total: number; events: Row[]; counties: Row[]; categories: Row[]; suppressionThreshold: number; range: number }

const actionLabels: Record<string, Record<string, string>> = {
  en: {
    notice_viewed: 'Notice guides opened',
    help_searched: 'Help searches',
    hotline_referred: 'Hotline referrals',
    checklist_completed: 'Checklists completed',
    draft_generated: 'Review packets made',
    sms_completed: 'Text conversations',
    'notice-to-quit': 'Notice to Quit',
    complaint: 'Complaint',
    summons: 'Summons',
    judgment: 'Judgment',
    warrant: 'Warrant'
  },
  es: {
    notice_viewed: 'Guías de aviso abiertas',
    help_searched: 'Búsquedas de ayuda',
    hotline_referred: 'Referencias a la línea directa',
    checklist_completed: 'Listas de verificación completadas',
    draft_generated: 'Resúmenes de hechos creados',
    sms_completed: 'Conversaciones de texto simuladas',
    'notice-to-quit': 'Aviso de desalojo',
    complaint: 'Demanda',
    summons: 'Citación',
    judgment: 'Fallo de posesión',
    warrant: 'Orden de lanzamiento'
  }
}

function Bars({ rows, lang }: { rows: Row[]; lang: string }) {
  const max = Math.max(...rows.map(r => r.value), 1)
  const dict = actionLabels[lang] || actionLabels.en
  
  return (
    <div className="bar-list">
      {rows.map(row => (
        <div className="bar-row" key={row.label}>
          <div className="bar-label">
            <span>{dict[row.label] || row.label}</span>
            <strong>{row.value}</strong>
          </div>
          <div className="bar-track">
            <span style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Impact() {
  const { t, lang } = useTranslation()
  const [range, setRange] = useState('365')
  const [category, setCategory] = useState('all')
  const { data, error, isLoading } = useSWR<ImpactData>(`/api/impact?range=${range}&category=${category}`, fetcher)
  const [optedOut, setOptedOut] = useState(() => localStorage.getItem('rts-analytics-optout') === 'true')
  
  const [rentRegistry] = useState<{ id: string; date: string; city: string; current: number; proposed: number; percentage: number; isIllegal: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('rts-rent-registry')
      const userSubmissions = saved ? JSON.parse(saved) : []
      const mockData = [
        { id: 'mock-1', date: '7/15/2026', city: 'Jersey City', current: 1800, proposed: 2000, percentage: 11, isIllegal: true },
        { id: 'mock-2', date: '7/14/2026', city: 'Newark', current: 1400, proposed: 1550, percentage: 11, isIllegal: true },
        { id: 'mock-3', date: '7/12/2026', city: 'Hoboken', current: 2200, proposed: 2310, percentage: 5, isIllegal: false },
        { id: 'mock-4', date: '7/10/2026', city: 'Camden', current: 950, proposed: 1100, percentage: 16, isIllegal: true },
      ]
      return [...userSubmissions, ...mockData]
    } catch (e) {
      return []
    }
  })

  function toggleOptOut() {
    const next = !optedOut
    setOptedOut(next)
    localStorage.setItem('rts-analytics-optout', String(next))
  }

  return (
    <section className="shell page-section">
      <PageIntro eyebrow={t('impact_eyebrow')} title={t('impact_title')}>
        <p>{t('impact_desc')}</p>
      </PageIntro>

      <div className="filter-row flex flex-wrap gap-4 border-b border-rule pb-6 mb-8 text-sm">
        <label className="flex items-center gap-2 font-semibold">
          {t('impact_time_period')}
          <select value={range} onChange={e => setRange(e.target.value)} className="p-2 border border-rule bg-paper rounded font-normal">
            <option value="30">{t('impact_time_30')}</option>
            <option value="90">{t('impact_time_90')}</option>
            <option value="365">{t('impact_time_365')}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 font-semibold">
          {t('impact_notice_cat')}
          <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border border-rule bg-paper rounded font-normal">
            <option value="all">{t('impact_cat_all')}</option>
            <option value="notice-to-quit">{t('notice_quit_name')}</option>
            <option value="complaint">{t('notice_complaint_name')}</option>
            <option value="summons">{lang === 'es' ? 'Citación' : 'Summons'}</option>
            <option value="judgment">{t('notice_judgment_name')}</option>
            <option value="warrant">{t('notice_warrant_name')}</option>
          </select>
        </label>
      </div>

      {isLoading && <p className="status-box p-4 bg-rule/20 text-center rounded">{t('impact_loading')}</p>}
      {error && <p className="status-box p-4 bg-red-50 text-red-800 text-center rounded">{t('impact_error')}</p>}

      {data && (
        <>
          <div className="metric bg-ink text-paper p-6 rounded-lg text-center max-w-sm mb-12 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-paper/70 font-semibold">{t('impact_metric_title')}</span>
            <strong className="block text-3xl mt-2">{data.total}</strong>
          </div>

          <div className="dashboard-grid grid gap-8 md:grid-cols-2">
            <article className="border border-rule rounded-lg p-6 bg-paper/50">
              <h2 className="text-lg font-bold border-b border-rule pb-3 mb-4">{t('impact_sec_actions')}</h2>
              {data.events.length ? (
                <Bars rows={data.events} lang={lang} />
              ) : (
                <p className="empty-note text-sm text-margin italic">{lang === 'es' ? 'Aún no hay grupos publicables.' : 'No publishable groups yet.'}</p>
              )}
            </article>

            <article className="border border-rule rounded-lg p-6 bg-paper/50">
              <h2 className="text-lg font-bold border-b border-rule pb-3 mb-4">{t('impact_sec_categories')}</h2>
              {data.categories.length ? (
                <Bars rows={data.categories} lang={lang} />
              ) : (
                <p className="empty-note text-sm text-margin italic">{lang === 'es' ? 'Aún no hay grupos publicables.' : 'No publishable groups yet.'}</p>
              )}
            </article>
          </div>

          <article className="mt-12 border-t border-rule pt-8">
            <h2 className="text-lg font-bold mb-4">{t('impact_sec_counties')}</h2>
            {data.counties.length ? (
              <div className="county-grid grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {data.counties.map(row => (
                  <div key={row.label} className="flex justify-between border-b border-rule/50 pb-2 text-sm">
                    <span>{row.label}</span>
                    <strong className="font-semibold">{row.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-note text-sm text-margin italic">{t('impact_sec_counties_empty')}</p>
            )}
          </article>

          {/* Community Rent-Hike Registry Section */}
          <article className="mt-16 border-t border-rule pt-12">
            <h2 className="text-xl font-bold mb-2 text-ink flex items-center gap-2">
              📊 {lang === 'es' ? 'Registro Comunitario de Aumentos de Alquiler' : 'Community Rent-Hike Registry'}
            </h2>
            <p className="text-xs text-margin mb-6 leading-relaxed max-w-2xl">
              {lang === 'es'
                ? 'Este panel muestra los aumentos de alquiler reportados de forma anónima por los inquilinos. Ayuda a rastrear aumentos ilegales e identificar áreas con abusos en Nueva Jersey.'
                : 'This registry lists rent increases anonymously submitted by tenants. It helps track rent inflation patterns and identify areas with potentially illegal increases in NJ.'}
            </p>

            <div className="overflow-x-auto border border-rule rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-rule/20 text-ink font-bold border-b border-rule">
                  <tr>
                    <th className="p-3">{lang === 'es' ? 'Fecha' : 'Date'}</th>
                    <th className="p-3">{lang === 'es' ? 'Municipio' : 'Municipality'}</th>
                    <th className="p-3">{lang === 'es' ? 'Alquiler Anterior' : 'Previous Rent'}</th>
                    <th className="p-3">{lang === 'es' ? 'Alquiler Propuesto' : 'Proposed Rent'}</th>
                    <th className="p-3">{lang === 'es' ? 'Aumento (%)' : 'Increase (%)'}</th>
                    <th className="p-3">{lang === 'es' ? 'Estado del Audit' : 'Audit Legality'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/50">
                  {rentRegistry.map((item) => (
                    <tr key={item.id} className="hover:bg-rule/5">
                      <td className="p-3 text-margin/80">{item.date}</td>
                      <td className="p-3 font-semibold text-ink">{item.city}</td>
                      <td className="p-3 text-ink">${item.current}</td>
                      <td className="p-3 text-ink">${item.proposed}</td>
                      <td className="p-3 font-semibold text-ink">{item.percentage}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.isIllegal 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {item.isIllegal 
                            ? (lang === 'es' ? '⚠️ Sospechoso / Alto' : '⚠️ Suspicious / High') 
                            : (lang === 'es' ? '✓ Dentro del Límite' : '✓ Within Cap')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}

      <div className="method-box mt-12 border-t border-rule pt-8 space-y-4">
        <h2 className="text-lg font-bold">{t('impact_method_title')}</h2>
        <p className="text-sm leading-7 text-margin">{t('impact_method_desc')}</p>
        <label className="optout flex items-center gap-3 cursor-pointer text-sm font-semibold">
          <input type="checkbox" checked={optedOut} onChange={toggleOptOut} />
          <span>{t('impact_optout_label')}</span>
        </label>
      </div>
    </section>
  )
}
