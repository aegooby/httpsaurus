
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
RUN turtle bundle:snowpack --url http://localhost/
CMD [ "turtle", "deploy:server", "--domain", "localhost" ]

FROM httpsaurus AS dev

RUN turtle clean --dist
RUN turtle bundle:snowpack --url https://www.dev.example.com/
CMD [ "turtle", "deploy:server", "--domain", "www.dev.example.com" ]

FROM httpsaurus AS live

RUN turtle clean --dist
RUN turtle bundle:snowpack --url https://www.example.com/
CMD [ "turtle", "deploy:server", "--domain", "www.example.com" ]
