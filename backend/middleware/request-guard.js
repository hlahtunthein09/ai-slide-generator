const requests = new Map();

function createRateLimiter({ windowMs = 60_000, maxRequests = 5 } = {}) {
    return (req, res, next) => {
        const key = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const current = (requests.get(key) || []).filter(time => now - time < windowMs);

        if (current.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: {
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Please wait a moment before generating another presentation.'
                }
            });
        }

        current.push(now);
        requests.set(key, current);
        next();
    };
}

module.exports = { createRateLimiter };
