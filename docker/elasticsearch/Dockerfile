ARG ELASTICSEARCH_VERSION
FROM docker.elastic.co/elasticsearch/elasticsearch:${ELASTICSEARCH_VERSION}

# Install ICU Analysis Plugin
RUN bin/elasticsearch-plugin install --batch analysis-icu
