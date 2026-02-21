import { requireAuth } from '../../utils/getCurrentUser'

export default requireAuth(async (event, user) => {
  return {
    user
  }
})
