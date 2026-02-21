import { apiHandlerAuth } from '../../utils/apiHandler'

export default apiHandlerAuth(async (event, user) => {
  return user
})
