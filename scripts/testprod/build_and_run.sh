export FRONTEND_PORT=${FRONTEND_PORT=5000} # Set frontend port if not already set
docker-compose -f docker-compose.testprod.yml build
docker-compose -f docker-compose.testprod.yml up -d