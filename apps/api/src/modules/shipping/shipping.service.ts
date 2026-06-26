import axios from 'axios'
import { prisma } from '../../lib/prisma'
import { AppError, NotFoundError } from '../../middleware/error.middleware'
import { z } from 'zod'

export const createShippingZoneSchema = z.object({
  name: z.string().min(2).max(100),
  states: z.array(z.string().length(2)).min(1),
  price: z.number().min(0),
  freeAbove: z.number().positive().optional().nullable(),
  estimatedDays: z.string().min(2).max(50),
  isActive: z.boolean().default(true),
})

export type CreateShippingZoneInput = z.infer<typeof createShippingZoneSchema>

interface ViaCepResponse {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export class ShippingService {
  async getAddressFromCep(cep: string): Promise<ViaCepResponse> {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) throw new AppError('CEP inválido', 400)

    try {
      const { data } = await axios.get<ViaCepResponse>(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
        { timeout: 10000 }
      )
      if (data.erro) throw new AppError('CEP não encontrado', 404)
      return data
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError('Erro ao consultar CEP. Tente novamente', 503)
    }
  }

  async calculateShipping(zipCode: string, orderValue: number = 0) {
    const address = await this.getAddressFromCep(zipCode)
    const state = address.uf.toUpperCase()

    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
    })

    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
    const freeThreshold = settings?.freeShippingThreshold ? Number(settings.freeShippingThreshold) : null

    const options = zones
      .filter((zone) => zone.states.includes(state))
      .map((zone) => {
        let price = Number(zone.price)
        let isFree = false

        if (zone.freeAbove && orderValue >= Number(zone.freeAbove)) {
          price = 0
          isFree = true
        } else if (freeThreshold && orderValue >= freeThreshold) {
          price = 0
          isFree = true
        }

        return {
          zoneId: zone.id,
          name: zone.name,
          price,
          originalPrice: Number(zone.price),
          estimatedDays: zone.estimatedDays,
          isFree,
        }
      })

    return {
      address: {
        zipCode: address.cep,
        street: address.logradouro,
        neighborhood: address.bairro,
        city: address.localidade,
        state: address.uf,
      },
      options,
    }
  }

  async listZones() {
    return prisma.shippingZone.findMany({ orderBy: { name: 'asc' } })
  }

  async createZone(input: CreateShippingZoneInput) {
    return prisma.shippingZone.create({
      data: {
        name: input.name,
        states: input.states.map((s) => s.toUpperCase()),
        price: input.price,
        freeAbove: input.freeAbove ?? null,
        estimatedDays: input.estimatedDays,
        isActive: input.isActive,
      },
    })
  }

  async updateZone(id: string, input: Partial<CreateShippingZoneInput>) {
    const zone = await prisma.shippingZone.findUnique({ where: { id } })
    if (!zone) throw new NotFoundError('Zona de frete')

    return prisma.shippingZone.update({
      where: { id },
      data: {
        ...input,
        states: input.states?.map((s) => s.toUpperCase()),
      },
    })
  }

  async deleteZone(id: string): Promise<void> {
    const zone = await prisma.shippingZone.findUnique({ where: { id } })
    if (!zone) throw new NotFoundError('Zona de frete')
    await prisma.shippingZone.delete({ where: { id } })
  }
}

export const shippingService = new ShippingService()
