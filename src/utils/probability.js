function getDenominator(baseRate) {
  const [, denominator] = String(baseRate).split('/')
  return Number(denominator)
}

export function calculateRolls(game, hunt) {
  let rolls = 1

  if (game.mechanics.shinyCharm && hunt.modifiers.shinyCharm) {
    rolls += game.rules.shinyCharmBonus || 0
  }

  if (
    game.mechanics.sparklingPower &&
    Array.isArray(game.rules.sparklingPowerBonus)
  ) {
    const level = Number(hunt.modifiers.sparklingPower || 0)
    rolls += game.rules.sparklingPowerBonus[level] || 0
  }

  if (game.mechanics.outbreak && hunt.method === 'outbreak' && hunt.modifiers.outbreak) {
    rolls += 2
  }

  if (game.mechanics.research && hunt.method === 'research') {
    if (hunt.modifiers.research === 'level10') {
      rolls += 1
    }

    if (hunt.modifiers.research === 'perfect') {
      rolls += 3
    }
  }

  return rolls
}

export function getEffectiveRate(game, hunt) {
  const denominator = getDenominator(game.baseRate)
  const rolls = calculateRolls(game, hunt)
  return {
    denominator,
    rolls,
    effectiveRate: rolls / denominator,
  }
}

export function getCumulativeProbability(encounters, game, hunt) {
  const { effectiveRate, rolls, denominator } = getEffectiveRate(game, hunt)
  const attempts = Math.max(0, Number(encounters) || 0)
  const chance = 1 - (1 - effectiveRate) ** attempts

  return {
    rolls,
    denominator,
    effectiveRate,
    chance,
    odds: Math.max(1, Math.round(denominator / Math.max(1, rolls))),
  }
}
