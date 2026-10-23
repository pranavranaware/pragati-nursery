import { fetchApi } from '@/lib/apiClient'

export interface PincodeDetails {
  success: boolean
  pincode: string
  state: string | null
  district: string | null
  city: string | null
  localities: string[]
  errorMessage: string | null
}

export const pincodeService = {
  async lookupPincode(pincode: string): Promise<PincodeDetails> {
    const cleanPincode = pincode.trim()
    if (!/^\d{6}$/.test(cleanPincode)) {
      return {
        success: false,
        pincode: cleanPincode,
        state: null,
        district: null,
        city: null,
        localities: [],
        errorMessage: 'Pincode must be 6 digits.',
      }
    }

    try {
      const data = await fetchApi<PincodeDetails>(`/pincode/${cleanPincode}`, {
        method: 'GET',
      })
      return data
    } catch (err: any) {
      return {
        success: false,
        pincode: cleanPincode,
        state: null,
        district: null,
        city: null,
        localities: [],
        errorMessage: 'Unable to lookup pincode. Please enter your location manually.',
      }
    }
  },
}
