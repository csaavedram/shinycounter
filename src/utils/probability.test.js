import { describe, expect, it } from 'vitest'
import { GAMES } from '../data/games'
import { calculateRolls, getCumulativeProbability, getEffectiveRate } from './probability'

function gameById(id) {
  return GAMES.find((game) => game.id === id)
}

describe('probability engine', () => {
  it('applies shiny charm as extra rolls in BW2', () => {
    const game = gameById('bw2')
    const hunt = {
      method: 'encounters',
      modifiers: {
        shinyCharm: true,
        sparklingPower: 0,
        outbreak: false,
        research: 'none',
      },
    }

    expect(calculateRolls(game, hunt)).toBe(3)
  })

  it('adds sparkling power and outbreak bonuses in Scarlet/Violet outbreak method', () => {
    const game = gameById('scarlet-violet')
    const hunt = {
      method: 'outbreak',
      modifiers: {
        shinyCharm: true,
        sparklingPower: 3,
        outbreak: true,
        research: 'none',
      },
    }

    const rate = getEffectiveRate(game, hunt)

    expect(rate.denominator).toBe(4096)
    expect(rate.rolls).toBe(8)
    expect(rate.effectiveRate).toBeCloseTo(8 / 4096)
  })

  it('uses +3 shiny charm bonus in Legends Z-A', () => {
    const game = gameById('legends-za')
    const hunt = {
      method: 'encounters',
      modifiers: {
        shinyCharm: true,
        sparklingPower: 0,
        outbreak: false,
        research: 'none',
      },
    }

    expect(calculateRolls(game, hunt)).toBe(4)
  })

  it('returns cumulative probability with encounter count', () => {
    const game = gameById('emerald')
    const hunt = {
      method: 'encounters',
      modifiers: {
        shinyCharm: false,
        sparklingPower: 0,
        outbreak: false,
        research: 'none',
      },
    }

    const result = getCumulativeProbability(8192, game, hunt)

    expect(result.rolls).toBe(1)
    expect(result.denominator).toBe(8192)
    expect(result.odds).toBe(8192)
    expect(result.chance).toBeGreaterThan(0)
  })
})
