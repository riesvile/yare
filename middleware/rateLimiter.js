module.exports = function createRateLimiter(logger) {
	let rate_limiter = {};

	setInterval(function(){
		rate_limiter = {};
	}, 10000);

	function check_limiter(ip_a) {
		if (rate_limiter[ip_a] == undefined){
			rate_limiter[ip_a] = 1;
			return false;
		}
		rate_limiter[ip_a] += 1;
		if (rate_limiter[ip_a] > 100){
			logger.warn({ip: ip_a}, 'Rate limit exceeded');
			return true;
		}
	}

	return check_limiter;
};
