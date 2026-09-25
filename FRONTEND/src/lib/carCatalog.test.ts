import { describe, expect, it } from 'vitest'
import { CAR_CATEGORIES, SPEC_LABELS, getCarProfile, getCategory } from './carCatalog'

describe('catalogo editoriale', () => {
  it('riconosce la special edition prima del modello standard', () => {
    const extreme = getCarProfile({ marca: 'Ford', modello: 'Shelby GT500 Extreme' })
    const standard = getCarProfile({ marca: 'Ford', modello: 'Shelby GT500' })

    expect(extreme.category).toBe('special')
    expect(extreme.specialEdition).toBe(true)
    expect(standard.specialEdition).toBe(false)
  })

  it('usa una scheda illustrativa sicura per un modello nuovo', () => {
    const profile = getCarProfile({ marca: 'Nuova Marca', modello: 'Nuovo Modello' })

    expect(profile.illustrative).toBe(true)
    expect(profile.images).toHaveLength(1)
    expect(profile.strengths).toEqual([])
  })

  it('mantiene categorie e specifiche complete', () => {
    expect(CAR_CATEGORIES.map((category) => category.id)).toEqual([
      'classiche',
      'supercar',
      'suv',
      'hypercar',
      'utilitarie',
      'special',
    ])
    expect(SPEC_LABELS).toHaveLength(7)
    expect(getCategory('suv').label).toBe('SUV')
  })
})
