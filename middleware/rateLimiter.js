module.exports = function createRateLimiter(logger) {
	let rate_limiter = {};

	setInterval(function(){
		rate_limiter = {};
	}, 10000);

	function check_limiter(ip_a) {
		logger.debug({ip: ip_a}, 'rate limiter check');
		if (rate_limiter[ip_a] == undefined){
			rate_limiter[ip_a] = 1;
			return false;
		}
		rate_limiter[ip_a] += 1;
		if (rate_limiter[ip_a] > 100){
			logger.warn({ip: ip_a}, 'ip rate limit exceeded');
			return true;
		}
	}

	return check_limiter;
};
