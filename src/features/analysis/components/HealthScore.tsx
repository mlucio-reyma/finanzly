import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  score:            number
  historicalScores: { month: string; score: number }[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): { text: string; progress: string; badge: string } {
  if (score < 40)  return { text: 'text-error',   progress: 'progress-error',   badge: 'badge-error' }
  if (score <= 70) return { text: 'text-warning',  progress: 'progress-warning', badge: 'badge-warning' }
  return              { text: 'text-success', progress: 'progress-success', badge: 'badge-success' }
}

function scoreMessage(score: number): string {
  if (score < 40)  return 'Hay oportunidades de mejora este mes 💪'
  if (score <= 70) return 'Vas bien, sigue así 👍'
  return 'iiExcelente control financiero! 🌟'
}

// ── Componente ────────────────────────────────────────────────────────────────

export function HealthScore({ score, historicalScores }: Props) {
  const colors = scoreColor(score)

  return (
    <div className="card bg-base-100 card-bordered shadow-sm">
      <div className="card-body gap-4">
        <h2 className="card-title text-base">Score de Salud Financiera</h2>

        {/* Score numérico */}
        <div className="flex flex-col items-center gap-2 py-2">
          <span className={`text-6xl font-extrabold tabular-nums ${colors.text}`}>
            {score}
          </span>
          <span className="text-sm text-base-content/50">de 100 puntos</span>

          {/* Barra de progreso */}
          <progress
            className={`progress ${colors.progress} w-full max-w-xs`}
            value={score}
            max={100}
            aria-label={`Score: ${score} de 100`}
          />

          {/* Mensaje motivacional */}
          <p className="text-sm text-center text-base-content/70 mt-1">
            {scoreMessage(score)}
          </p>
        </div>

        {/* Gráfica de histórico */}
        {historicalScores.length > 0 && (
          <div>
            <p className="text-xs text-base-content/50 mb-2">Últimos meses</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={historicalScores} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [`${value} pts`, 'Score']}
                  contentStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
