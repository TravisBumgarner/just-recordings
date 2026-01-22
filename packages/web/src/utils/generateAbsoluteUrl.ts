import config from '@/config'
import { ROUTES } from '../consts'

const BASE_URL = config.isProduction ? 'https://justrecordings.com' : 'http://localhost:5173'

export const generateAbsoluteUrl = (path: keyof typeof ROUTES): string => {
  return `${BASE_URL}${ROUTES[path].href()}`
}
