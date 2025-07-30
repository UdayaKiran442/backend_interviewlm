import { Redis } from '@upstash/redis'

import { ActiveConfig } from '../../../utils/config.utils';

const redisService = new Redis({
    url: ActiveConfig.REDIS_URL,
    token: ActiveConfig.REDIS_TOKEN,
})

export default redisService;