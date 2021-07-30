
FROM aegooby/turtle:latest AS httpsaurus

# Dokku
EXPOSE 3080

WORKDIR /root/httpsaurus
ADD . /root/httpsaurus
RUN cli/install.sh
RUN turtle upgrade
RUN turtle cache

FROM httpsaurus AS localhost

RUN turtle clean --dist
RUN turtle bundle:snowpack --graphql http://localhost/graphql
CMD [ "turtle", "deploy:server", "--domain", "localhost" ]

FROM httpsaurus AS dev

RUN turtle clean --dist
RUN turtle bundle:snowpack --graphql https://www.dev.example.com/graphql
CMD [ "turtle", "deploy:server", "--domain", "www.dev.example.com" ]

FROM httpsaurus AS live

RUN turtle clean --dist
RUN turtle bundle:snowpack --graphql https://www.example.com/graphql
CMD [ "turtle", "deploy:server", "--domain", "www.example.com" ]
