
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
RUN turtle docker:bundle --target localhost
CMD [ "turtle", "docker:server", "--domain", "localhost" ]

FROM httpsaurus AS dev

RUN turtle clean --dist
RUN turtle docker:bundle --target dev
CMD [ "turtle", "docker:server", "--domain", "www.dev.example.com" ]

FROM httpsaurus AS live

RUN turtle clean --dist
RUN turtle docker:bundle --target live
CMD [ "turtle", "docker:server", "--domain", "www.example.com" ]
